import Foundation
import ImageIO
import UniformTypeIdentifiers
// usage: webimg <src> <dst.jpg> <maxPixels> <quality0-1>  -> prints "<w>x<h>"
let a = CommandLine.arguments
guard a.count >= 5, let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil) else { print("ERR"); exit(1) }
let opts: [CFString: Any] = [
  kCGImageSourceCreateThumbnailFromImageAlways: true,
  kCGImageSourceCreateThumbnailWithTransform: true,   // bake in EXIF orientation
  kCGImageSourceThumbnailMaxPixelSize: Int(a[3])!,
]
guard let img = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary) else { print("ERR"); exit(1) }
guard let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else { print("ERR"); exit(1) }
CGImageDestinationAddImage(dst, img, [kCGImageDestinationLossyCompressionQuality: Double(a[4])!] as CFDictionary)
CGImageDestinationFinalize(dst)
print("\(img.width)x\(img.height)")
