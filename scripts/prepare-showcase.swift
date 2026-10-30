import Foundation
import AVFoundation

// Usage: swift scripts/prepare-showcase.swift source.mov output.mp4 end-seconds
guard CommandLine.arguments.count == 4,
      let cutoff = Double(CommandLine.arguments[3]), cutoff.isFinite, cutoff > 0 else {
    fatalError("Usage: prepare-showcase.swift source.mov output.mp4 end-seconds")
}
let source = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
precondition(FileManager.default.fileExists(atPath: source.path), "Source is missing")
precondition(!FileManager.default.fileExists(atPath: output.path), "Output already exists")

let asset = AVURLAsset(url: source)
let duration = try await asset.load(.duration)
let end = CMTime(seconds: min(cutoff, duration.seconds), preferredTimescale: 60000)
let videoTracks = try await asset.loadTracks(withMediaType: .video)
precondition(!videoTracks.isEmpty, "No video track")
let videoTrack = videoTracks[0]
let size = try await videoTrack.load(.naturalSize)
let transform = try await videoTrack.load(.preferredTransform)
let bounds = CGRect(origin: .zero, size: size).applying(transform)
let scale = min(1, 720 / min(bounds.width, bounds.height), 1280 / max(bounds.width, bounds.height))
let renderSize = CGSize(width: floor(bounds.width * scale / 2) * 2,
                        height: floor(bounds.height * scale / 2) * 2)
let composition = AVMutableVideoComposition()
composition.renderSize = renderSize
composition.frameDuration = CMTime(value: 1, timescale: 30)
let instruction = AVMutableVideoCompositionInstruction()
instruction.timeRange = CMTimeRange(start: .zero, duration: end)
let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: videoTrack)
layer.setTransform(transform.concatenating(CGAffineTransform(translationX: -bounds.minX, y: -bounds.minY))
    .concatenating(CGAffineTransform(scaleX: scale, y: scale)), at: .zero)
instruction.layerInstructions = [layer]
composition.instructions = [instruction]

let reader = try AVAssetReader(asset: asset)
reader.timeRange = instruction.timeRange
let videoOutput = AVAssetReaderVideoCompositionOutput(videoTracks: [videoTrack], videoSettings: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
])
videoOutput.videoComposition = composition
reader.add(videoOutput)
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true
writer.metadata = []
let videoInput = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(renderSize.width), AVVideoHeightKey: Int(renderSize.height),
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 2_500_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoMaxKeyFrameIntervalKey: 60,
    ],
])
writer.add(videoInput)
var streams: [(AVAssetReaderOutput, AVAssetWriterInput)] = [(videoOutput, videoInput)]
for track in try await asset.loadTracks(withMediaType: .audio) {
    let formats = try await track.load(.formatDescriptions)
    precondition(formats.count > 0 && CMFormatDescriptionGetMediaSubType(formats[0]) == kAudioFormatMPEG4AAC,
                 "Audio passthrough requires AAC")
    let audioOutput = AVAssetReaderTrackOutput(track: track, outputSettings: nil)
    let audioInput = AVAssetWriterInput(mediaType: .audio, outputSettings: nil, sourceFormatHint: formats[0])
    reader.add(audioOutput)
    writer.add(audioInput)
    streams.append((audioOutput, audioInput))
}
precondition(writer.startWriting(), "Cannot start MP4 writer")
writer.startSession(atSourceTime: .zero)
precondition(reader.startReading(), "Cannot decode source")
let group = DispatchGroup()
for (index, stream) in streams.enumerated() {
    let (trackOutput, trackInput) = stream
    group.enter()
    var finished = false
    trackInput.requestMediaDataWhenReady(on: DispatchQueue(label: "showcase.track.\(index)")) {
        guard !finished else { return }
        while trackInput.isReadyForMoreMediaData {
            guard let sample = trackOutput.copyNextSampleBuffer() else {
                finished = true
                trackInput.markAsFinished()
                group.leave()
                return
            }
            if !trackInput.append(sample) {
                finished = true
                reader.cancelReading()
                group.leave()
                return
            }
        }
    }
}
precondition(group.wait(timeout: .now() + 180) == .success, "Encoding timed out")
precondition(reader.status == .completed, "Decode failed: \(String(describing: reader.error))")
writer.endSession(atSourceTime: end)
await writer.finishWriting()
precondition(writer.status == .completed, "Encode failed: \(String(describing: writer.error))")
print("Exported \(end.seconds) seconds, \(Int(renderSize.width))x\(Int(renderSize.height)), H.264 with AAC passthrough")
