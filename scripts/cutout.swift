// On-device subject cut-out with Apple Vision. Usage: swift cutout.swift in.png out.png
import Foundation
import Vision
import CoreImage
import ImageIO

let args = CommandLine.arguments
guard args.count == 3 else { fatalError("usage: cutout in out") }
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
guard let src = CGImageSourceCreateWithURL(input as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("cannot read input") }

let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([request])
guard let result = request.results?.first else { fatalError("no subject found") }
print("instances:", result.allInstances.count)
let buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
let image = CIImage(cvPixelBuffer: buffer)
let ctx = CIContext()
let space = CGColorSpace(name: CGColorSpace.sRGB)!
try ctx.writePNGRepresentation(of: image, to: output, format: .RGBA8, colorSpace: space)
print("wrote", output.path, Int(image.extent.width), "x", Int(image.extent.height))
