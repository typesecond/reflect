// Render an illustrative Sifter interface demo. No mining or key generation.
import Foundation
import CoreGraphics
import CoreText
import AVFoundation
import ImageIO

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let output = root.appendingPathComponent("dist/media/sifter-demo.mp4")
let poster = root.appendingPathComponent("dist/media/sifter-demo-poster.png")
let width = 1280, height = 960, fps: Int32 = 24
let seconds = 14.0
let fontURL = root.appendingPathComponent("dist/assets/Silkscreen-Regular.ttf")
CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, nil)

func color(_ hex: String, _ alpha: CGFloat = 1) -> CGColor {
    let number = UInt32(hex, radix: 16)!
    return CGColor(red: CGFloat((number >> 16) & 255) / 255,
                   green: CGFloat((number >> 8) & 255) / 255,
                   blue: CGFloat(number & 255) / 255, alpha: alpha)
}
let bg = "141627", panel = "1e2339", edge = "46506d", text = "edf0df"
let muted = "a2abc2", lime = "b9ec78", gold = "f1c777"

func rect(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, _ hex: String, _ alpha: CGFloat = 1) {
    c.setFillColor(color(hex, alpha)); c.fill(CGRect(x: x, y: y, width: w, height: h))
}
func box(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat, fill: String, border: String = edge) {
    rect(c, x, y, w, h, border); rect(c, x + 3, y + 3, w - 6, h - 6, fill)
}
func label(_ c: CGContext, _ value: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ hex: String = text, pixel: Bool = false) {
    let font = CTFontCreateWithName((pixel ? "Silkscreen" : "Menlo") as CFString, size, nil)
    let string = NSAttributedString(string: value, attributes: [
        NSAttributedString.Key(kCTFontAttributeName as String): font,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): color(hex)
    ])
    c.saveGState(); c.setShouldAntialias(true)
    c.translateBy(x: x, y: y + size); c.scaleBy(x: 1, y: -1)
    c.textMatrix = .identity; c.textPosition = .zero
    CTLineDraw(CTLineCreateWithAttributedString(string), c)
    c.restoreGState()
}
func button(_ c: CGContext, _ title: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, primary: Bool = false, active: Bool = false, disabled: Bool = false) {
    box(c, x, y, w, 46, fill: primary ? (active ? "9fc65e" : lime) : bg, border: primary ? lime : edge)
    label(c, title, x + 15, y + 12, 17, disabled ? "65708c" : primary ? bg : text, pixel: true)
}
func sieve(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, _ t: Double, active: Bool) {
    rect(c, x, y + 25, 68, 6, "596080")
    rect(c, x + 6, y + 31, 6, 18, "596080"); rect(c, x + 56, y + 31, 6, 18, "596080")
    rect(c, x + 12, y + 45, 44, 6, gold)
    for i in 0..<4 { rect(c, x + 17 + CGFloat(i * 9), y + 34, 5, 11, gold) }
    for i in 0..<3 {
        let fall = active ? CGFloat((t * 32 + Double(i * 9)).truncatingRemainder(dividingBy: 28)) : CGFloat(i * 6)
        rect(c, x + 16 + CGFloat(i * 16), y - 6 + fall, 6, 6, i == 1 ? lime : gold)
    }
    rect(c, x + 25, y + 60, 18, 5, lime); rect(c, x + 19, y + 65, 30, 5, "dcf1c0")
    rect(c, x + 25, y + 70, 18, 5, lime); rect(c, x + 31, y + 75, 6, 5, lime)
}
func cursor(_ c: CGContext, _ x: CGFloat, _ y: CGFloat, click: Bool) {
    let rows = ["10000000", "11000000", "11100000", "11110000", "11111000", "11111100", "11111110", "11110000", "11011000", "10011000", "00001100"]
    if click { box(c, x - 12, y - 12, 52, 52, fill: panel, border: gold) }
    for (row, values) in rows.enumerated() {
        for (col, value) in values.enumerated() where value == "1" {
            rect(c, x + CGFloat(col * 3) + 2, y + CGFloat(row * 3) + 2, 3, 3, "080b13")
            rect(c, x + CGFloat(col * 3), y + CGFloat(row * 3), 3, 3, text)
        }
    }
}
func typed(_ value: String, _ t: Double, start: Double) -> String {
    String(value.prefix(max(0, min(value.count, Int((t - start) * 5)))))
}
func draw(_ c: CGContext, _ t: Double) {
    c.setShouldAntialias(false)
    c.translateBy(x: 0, y: CGFloat(height)); c.scaleBy(x: 1, y: -1)
    rect(c, 0, 0, CGFloat(width), CGFloat(height), "0d1020")
    for x in stride(from: 20, to: width, by: 34) {
        for y in stride(from: 16, to: height, by: 34) { rect(c, CGFloat(x), CGFloat(y), 2, 2, "283148", 0.65) }
    }
    label(c, "SIFTER / QUICK LOOK", 88, 20, 16, muted, pixel: true)
    label(c, "SIMULATED DEMO", 944, 20, 16, gold, pixel: true)
    rect(c, 96, 76, 1106, 814, "070a14")
    box(c, 82, 62, 1106, 814, fill: bg)
    rect(c, 85, 65, 1100, 35, panel)
    for (index, hex) in ["d58c87", gold, lime].enumerated() { rect(c, 102 + CGFloat(index * 22), 77, 10, 10, hex) }
    label(c, "Sifter", 584, 70, 17, muted)
    let mining = t >= 4.1 && t < 7.6
    let found = t >= 7.6
    let exporting = t >= 9.4 && t < 11.9
    let saved = t >= 11.9
    sieve(c, 120, 113, t, active: mining)
    label(c, "SIFTER", 214, 130, 44, "dcf1c0", pixel: true)
    label(c, "ETHEREUM", 946, 130, 19, muted, pixel: true)
    label(c, "ADDRESS MINER", 898, 158, 19, muted, pixel: true)
    box(c, 118, 222, 1034, 242, fill: panel)
    label(c, "STARTS WITH", 144, 240, 20, text, pixel: true)
    label(c, "ENDS WITH", 662, 240, 20, text, pixel: true)
    box(c, 144, 279, 474, 54, fill: bg, border: t >= 1.3 && t < 2.5 ? lime : edge)
    box(c, 662, 279, 464, 54, fill: bg, border: t >= 2.5 && t < 3.6 ? lime : edge)
    label(c, typed("c0f", t, start: 1.4), 161, 292, 25)
    label(c, typed("fee", t, start: 2.5), 680, 292, 25)
    if t > 3.2 { label(c, "0xc0f..................................fee", 145, 351, 20, lime) }
    else { label(c, "Type a prefix, a suffix, or both.", 145, 351, 20, muted) }
    button(c, "AUTO", 145, 396, 176)
    button(c, mining ? "STOP SEARCH" : "FIND ADDRESS", 856, 396, 270, primary: true, active: t >= 3.8 && t < 4.2)
    let status = saved ? "Encrypted wallet saved." : found ? "Demo match found." : mining ? "Sifting locally..." : "Ready to search."
    label(c, status, 143, 489, 22, found ? lime : text)
    label(c, mining ? "GPU engine active" : found ? "Search complete" : "Engine: Auto", 144, 529, 19, lime)
    label(c, mining ? "Elapsed: \(Int(t - 4.1))s" : found ? "Elapsed: 3.5s" : "Elapsed: 0s", 826, 529, 19, muted)
    for i in 0..<32 {
        let bright = mining && (i + Int(t * 12)) % 12 < 4
        rect(c, 145 + CGFloat(i * 30), 571, 24, 5, bright ? lime : edge, bright ? 1 : 0.55)
    }
    box(c, 118, 611, 1034, 204, fill: panel)
    label(c, "YOUR ADDRESS", 144, 629, 20, lime, pixel: true)
    label(c, found ? "0xc0f4a91d8b3267ec82b6e59a07c315d294efafee" : "Your match will appear here.", 145, 669, 23)
    label(c, "Private key hidden", 145, 707, 18, muted)
    button(c, "COPY ADDRESS", 145, 750, 250, disabled: !found)
    button(c, "SHOW KEY", 411, 750, 192, disabled: !found)
    button(c, "SAVE WALLET", 620, 750, 260, primary: true, active: t >= 9.1 && t < 9.5, disabled: !found)
    label(c, "LOCAL SEARCH / PASSWORD-ENCRYPTED WALLET EXPORT", 142, 840, 15, muted, pixel: true)
    if exporting {
        rect(c, 85, 100, 1100, 773, "070a14", 0.65)
        box(c, 333, 318, 614, 300, fill: panel, border: lime)
        label(c, "SAVE WALLET", 366, 346, 25, lime, pixel: true)
        label(c, "Encrypt your wallet with a password.", 367, 398, 19)
        box(c, 367, 443, 546, 50, fill: bg)
        let count = min(10, max(0, Int((t - 9.6) * 10)))
        label(c, String(repeating: "•", count: count), 384, 453, 25, text)
        button(c, t >= 11.2 ? "SAVING..." : "SAVE ENCRYPTED", 568, 535, 346, primary: true, active: t >= 11.1)
    }
    if saved {
        box(c, 770, 682, 350, 52, fill: "26352b", border: lime)
        label(c, "WALLET SAVED", 795, 696, 19, lime, pixel: true)
    }
    if t < 1.3 { cursor(c, 1045, 870, click: false) }
    else if t < 2.5 { cursor(c, 258, 305, click: false) }
    else if t < 3.6 { cursor(c, 776, 305, click: false) }
    else if t < 4.3 { cursor(c, 1020, 420, click: t >= 3.85 && t < 4.1) }
    else if t < 8.7 { cursor(c, 1110, 552, click: false) }
    else if t < 9.5 { cursor(c, 802, 774, click: t >= 9.15) }
    else if t < 11.1 { cursor(c, 800, 472, click: false) }
    else if t < 11.9 { cursor(c, 834, 559, click: true) }
    else { cursor(c, 1090, 776, click: false) }
    label(c, "PATTERN → SEARCH → MATCH → ENCRYPTED EXPORT", 88, 909, 17, muted, pixel: true)
}

try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
if FileManager.default.fileExists(atPath: output.path) { try FileManager.default.removeItem(at: output) }
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width, AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 1_800_000,
                                     AVVideoExpectedSourceFrameRateKey: fps,
                                     AVVideoProfileLevelKey: AVVideoProfileLevelH264MainAutoLevel]
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width, kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
])
writer.add(input)
guard writer.startWriting() else { fatalError("Cannot start video writer: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
let count = Int(seconds * Double(fps))
for index in 0..<count {
    autoreleasepool {
        while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
        var buffer: CVPixelBuffer?
        guard let pool = adaptor.pixelBufferPool,
              CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer) == kCVReturnSuccess,
              let pixel = buffer else { fatalError("Cannot allocate a frame") }
        CVPixelBufferLockBaseAddress(pixel, [])
        let c = CGContext(data: CVPixelBufferGetBaseAddress(pixel), width: width, height: height,
                          bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixel),
                          space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue)!
        draw(c, Double(index) / Double(fps))
        if [0, 132, 204, 252, 312].contains(index), let image = c.makeImage() {
            let target = index == 204 ? poster : URL(fileURLWithPath: "/private/tmp/sifter-demo-\(index).png")
            let dest = CGImageDestinationCreateWithURL(target as CFURL, "public.png" as CFString, 1, nil)!
            CGImageDestinationAddImage(dest, image, nil)
            precondition(CGImageDestinationFinalize(dest))
        }
        CVPixelBufferUnlockBaseAddress(pixel, [])
        precondition(adaptor.append(pixel, withPresentationTime: CMTime(value: Int64(index), timescale: fps)))
    }
}
input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting { semaphore.signal() }
semaphore.wait()
guard writer.status == .completed else { fatalError("Video writing failed: \(String(describing: writer.error))") }
// AVFoundation may leave a safe-save intermediate after fast-start rewriting.
for file in try FileManager.default.contentsOfDirectory(at: output.deletingLastPathComponent(), includingPropertiesForKeys: nil)
    where file.lastPathComponent.hasPrefix(output.lastPathComponent + ".sb-") {
    try? FileManager.default.removeItem(at: file)
}
let bytes = try FileManager.default.attributesOfItem(atPath: output.path)[.size]!
print("Rendered \(seconds)s · \(width)×\(height) · \(fps)fps · \(bytes) bytes")
