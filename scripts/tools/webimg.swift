import Foundation
import ImageIO
import CoreGraphics
import UniformTypeIdentifiers
// usage: webimg <src> <dst.jpg> <maxPixels> <quality0-1> [trim]  -> prints "<w>x<h>"
// Bakes in EXIF orientation. With "trim", crops away solid black borders left by some exports.
let a = CommandLine.arguments
guard a.count >= 5, let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil) else { print("ERR"); exit(1) }
let maxPx = Int(a[3])!, q = Double(a[4])!, trim = a.count > 5 && a[5] == "trim"
func thumb(_ size: Int) -> CGImage? {
  let o: [CFString: Any] = [kCGImageSourceCreateThumbnailFromImageAlways: true, kCGImageSourceCreateThumbnailWithTransform: true, kCGImageSourceThumbnailMaxPixelSize: size]
  return CGImageSourceCreateThumbnailAtIndex(src, 0, o as CFDictionary)
}
// Render large enough that the trimmed result can still reach maxPx.
guard var img = thumb(trim ? Int(Double(maxPx) * 1.35) : maxPx) else { print("ERR"); exit(1) }
if trim {
  let w = img.width, h = img.height
  let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  let p = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
  func lit(_ x: Int, _ y: Int) -> Bool { let i = (y * w + x) * 4; return Int(p[i]) + Int(p[i + 1]) + Int(p[i + 2]) > 36 }
  func rowLit(_ y: Int) -> Bool { var n = 0; for x in stride(from: 0, to: w, by: 4) where lit(x, y) { n += 1 }; return n > w / 40 }
  func colLit(_ x: Int) -> Bool { var n = 0; for y in stride(from: 0, to: h, by: 4) where lit(x, y) { n += 1 }; return n > h / 40 }
  var top = 0, bottom = h - 1, left = 0, right = w - 1
  while top < bottom && !rowLit(top) { top += 1 }
  while bottom > top && !rowLit(bottom) { bottom -= 1 }
  while left < right && !colLit(left) { left += 1 }
  while right > left && !colLit(right) { right -= 1 }
  // Row 0 of the bitmap buffer is the top of the image, matching CGImage.cropping coordinates.
  let rect = CGRect(x: left, y: top, width: right - left + 1, height: bottom - top + 1)
  if let c = img.cropping(to: rect) { img = c }
  if max(img.width, img.height) > maxPx {
    let s = Double(maxPx) / Double(max(img.width, img.height))
    let nw = Int(Double(img.width) * s), nh = Int(Double(img.height) * s)
    let c2 = CGContext(data: nil, width: nw, height: nh, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    c2.interpolationQuality = .high
    c2.draw(img, in: CGRect(x: 0, y: 0, width: nw, height: nh))
    img = c2.makeImage()!
  }
}
guard let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else { print("ERR"); exit(1) }
CGImageDestinationAddImage(dst, img, [kCGImageDestinationLossyCompressionQuality: q] as CFDictionary)
CGImageDestinationFinalize(dst)
print("\(img.width)x\(img.height)")
