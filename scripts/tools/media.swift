// Tiny AVFoundation media tool (no ffmpeg on this Mac).
//   media frames <in> <outPrefix> <count> <maxDim> [fromFrac] [toFrac]
//   media clip <in> <out.mp4> <start> <duration> <maxDim> <kbps> [audio]
//   media sheet <out.jpg> <cols> <cellW> <img...>
import AVFoundation
import CoreImage
import ImageIO
import UniformTypeIdentifiers

func fail(_ s: String) -> Never { FileHandle.standardError.write((s + "\n").data(using: .utf8)!); exit(1) }

func writeJPEG(_ img: CGImage, _ path: String, _ q: Double = 0.82) {
  let url = URL(fileURLWithPath: path) as CFURL
  guard let dest = CGImageDestinationCreateWithURL(url, UTType.jpeg.identifier as CFString, 1, nil) else { fail("dest \(path)") }
  CGImageDestinationAddImage(dest, img, [kCGImageDestinationLossyCompressionQuality: q] as CFDictionary)
  if !CGImageDestinationFinalize(dest) { fail("write \(path)") }
}

func even(_ v: Double) -> Int { let i = Int(v.rounded()); return i - (i % 2) }

let a = CommandLine.arguments
guard a.count >= 2 else { fail("usage") }

switch a[1] {
case "frames":
  let asset = AVURLAsset(url: URL(fileURLWithPath: a[2]))
  let count = Int(a[4])!, maxDim = Double(a[5])!
  let from = a.count > 6 ? Double(a[6])! : 0.0, to = a.count > 7 ? Double(a[7])! : 1.0
  let dur = asset.duration.seconds
  let gen = AVAssetImageGenerator(asset: asset)
  gen.appliesPreferredTrackTransform = true
  gen.maximumSize = CGSize(width: maxDim, height: maxDim)
  let tol = CMTime(seconds: 0.3, preferredTimescale: 600)
  gen.requestedTimeToleranceBefore = tol; gen.requestedTimeToleranceAfter = tol
  for i in 0..<count {
    let frac = from + (to - from) * (Double(i) + 0.5) / Double(count)
    let t = CMTime(seconds: dur * frac, preferredTimescale: 600)
    do {
      let img = try gen.copyCGImage(at: t, actualTime: nil)
      let out = "\(a[3])-\(String(format: "%02d", i)).jpg"
      writeJPEG(img, out); print(out, img.width, img.height, String(format: "t=%.1fs", dur * frac))
    } catch { print("frame \(i) failed: \(error)") }
  }

case "clip":
  let asset = AVURLAsset(url: URL(fileURLWithPath: a[2]))
  let out = URL(fileURLWithPath: a[3]); try? FileManager.default.removeItem(at: out)
  let start = Double(a[4])!, want = Double(a[5])!, maxDim = Double(a[6])!, kbps = Int(a[7])!
  let withAudio = a.count > 8 && a[8] == "audio"
  guard let vt = asset.tracks(withMediaType: .video).first else { fail("no video") }
  // Optional extra rotation (degrees) for footage shot with the camera on its side: ROTATE=90 or ROTATE=-90.
  let extraDeg = Double(ProcessInfo.processInfo.environment["ROTATE"] ?? "0") ?? 0
  let tf = vt.preferredTransform.concatenating(CGAffineTransform(rotationAngle: CGFloat(extraDeg * .pi / 180)))
  let r = CGRect(origin: .zero, size: vt.naturalSize).applying(tf)
  let osz = CGSize(width: abs(r.width), height: abs(r.height))
  let scale = min(1.0, maxDim / max(osz.width, osz.height))
  let w = even(osz.width * scale), h = even(osz.height * scale)
  let fps = min(30.0, Double(vt.nominalFrameRate > 0 ? vt.nominalFrameRate.rounded() : 30))
  let total = asset.duration.seconds
  let dur = min(want, total - start)
  let startT = CMTime(seconds: start, preferredTimescale: 600)
  let range = CMTimeRange(start: startT, duration: CMTime(seconds: dur, preferredTimescale: 600))

  let instr = AVMutableVideoCompositionInstruction()
  instr.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
  let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: vt)
  // Orient, move to origin, then scale.
  let oriented = tf.concatenating(CGAffineTransform(translationX: -min(r.minX, r.maxX), y: -min(r.minY, r.maxY)))
  layer.setTransform(oriented.concatenating(CGAffineTransform(scaleX: scale, y: scale)), at: .zero)
  instr.layerInstructions = [layer]
  let vc = AVMutableVideoComposition()
  vc.renderSize = CGSize(width: w, height: h)
  vc.frameDuration = CMTime(value: 1, timescale: CMTimeScale(fps))
  vc.instructions = [instr]

  let reader = try! AVAssetReader(asset: asset)
  reader.timeRange = range
  let vout = AVAssetReaderVideoCompositionOutput(videoTracks: [vt], videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
  vout.videoComposition = vc
  vout.alwaysCopiesSampleData = false
  reader.add(vout)

  let writer = try! AVAssetWriter(outputURL: out, fileType: .mp4)
  writer.shouldOptimizeForNetworkUse = true
  let vin = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: w, AVVideoHeightKey: h,
    AVVideoCompressionPropertiesKey: [
      AVVideoAverageBitRateKey: kbps * 1000,
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      AVVideoMaxKeyFrameIntervalKey: Int(fps * 2),
      AVVideoAllowFrameReorderingKey: true,
      AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC,
      AVVideoExpectedSourceFrameRateKey: Int(fps),
    ] as [String: Any],
  ])
  vin.expectsMediaDataInRealTime = false
  let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: vin, sourcePixelBufferAttributes: nil)
  writer.add(vin)

  var aout: AVAssetReaderTrackOutput? = nil
  var ain: AVAssetWriterInput? = nil
  if withAudio, let at = asset.tracks(withMediaType: .audio).first, let fd = at.formatDescriptions.first {
    let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(fd as! CMAudioFormatDescription)!.pointee
    let ch = min(2, Int(asbd.mChannelsPerFrame)), sr = asbd.mSampleRate > 0 ? asbd.mSampleRate : 48000
    let o = AVAssetReaderTrackOutput(track: at, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM, AVNumberOfChannelsKey: ch, AVSampleRateKey: sr])
    reader.add(o); aout = o
    let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVNumberOfChannelsKey: ch, AVSampleRateKey: sr, AVEncoderBitRateKey: 192_000])
    i.expectsMediaDataInRealTime = false
    writer.add(i); ain = i
  }

  guard reader.startReading() else { fail("reader: \(String(describing: reader.error))") }
  guard writer.startWriting() else { fail("writer: \(String(describing: writer.error))") }
  writer.startSession(atSourceTime: .zero)
  let group = DispatchGroup()

  group.enter()
  var vDone = false
  vin.requestMediaDataWhenReady(on: DispatchQueue(label: "v")) {
    while vin.isReadyForMoreMediaData && !vDone {
      guard let sb = vout.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(sb) else {
        vDone = true; vin.markAsFinished(); group.leave(); return
      }
      let t = CMTimeSubtract(CMSampleBufferGetPresentationTimeStamp(sb), startT)
      if t.seconds >= 0 { adaptor.append(pb, withPresentationTime: t) }
    }
  }
  if let aout, let ain {
    group.enter()
    var aDone = false
    ain.requestMediaDataWhenReady(on: DispatchQueue(label: "a")) {
      while ain.isReadyForMoreMediaData && !aDone {
        guard let sb = aout.copyNextSampleBuffer() else { aDone = true; ain.markAsFinished(); group.leave(); return }
        var timing = CMSampleTimingInfo()
        CMSampleBufferGetSampleTimingInfo(sb, at: 0, timingInfoOut: &timing)
        timing.presentationTimeStamp = CMTimeSubtract(timing.presentationTimeStamp, startT)
        timing.decodeTimeStamp = .invalid
        var copy: CMSampleBuffer?
        CMSampleBufferCreateCopyWithNewTiming(allocator: nil, sampleBuffer: sb, sampleTimingEntryCount: 1, sampleTimingArray: &timing, sampleBufferOut: &copy)
        if let copy, timing.presentationTimeStamp.seconds >= 0 { ain.append(copy) }
      }
    }
  }
  group.wait()
  let sem = DispatchSemaphore(value: 0)
  writer.finishWriting { sem.signal() }
  sem.wait()
  if writer.status != .completed { fail("write failed: \(String(describing: writer.error))") }
  let size = (try? FileManager.default.attributesOfItem(atPath: out.path)[.size] as? Int) ?? 0
  print(out.lastPathComponent, "\(w)x\(h)", String(format: "%.1fs %.2fMB", dur, Double(size) / 1_048_576))

case "sheet":
  let outPath = a[2], cols = Int(a[3])!, cellW = Double(a[4])!
  let paths = Array(a[5...])
  let imgs: [CGImage] = paths.compactMap { p in
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil) else { return nil }
    return CGImageSourceCreateImageAtIndex(src, 0, nil)
  }
  let cellH = cellW * 16 / 9 >= 0 ? cellW : cellW
  let rows = Int(ceil(Double(imgs.count) / Double(cols)))
  let W = Int(cellW) * cols, H = Int(cellH) * rows
  let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
  ctx.setFillColor(CGColor(gray: 0.1, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
  for (i, img) in imgs.enumerated() {
    let c = i % cols, rI = i / cols
    let s = min(cellW / Double(img.width), cellH / Double(img.height)) * 0.96
    let dw = Double(img.width) * s, dh = Double(img.height) * s
    let x = Double(c) * cellW + (cellW - dw) / 2
    let y = Double(H) - Double(rI + 1) * cellH + (cellH - dh) / 2
    ctx.draw(img, in: CGRect(x: x, y: y, width: dw, height: dh))
    // index marker: small squares = i+1 in binary would be unreadable; draw a bar per index/5 instead
    ctx.setFillColor(CGColor(red: 1, green: 0.36, blue: 0.14, alpha: 1))
    for k in 0..<(i + 1) { ctx.fill(CGRect(x: Double(c) * cellW + 4 + Double(k % 10) * 7, y: Double(H) - Double(rI) * cellH - 10 - Double(k / 10) * 8, width: 5, height: 5)) }
  }
  writeJPEG(ctx.makeImage()!, outPath, 0.8)
  print(outPath, W, H)

default: fail("unknown command")
}
