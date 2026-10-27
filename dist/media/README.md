`sayo-showcase.mp4` is the browser-ready copy of `IMG_2731.mov`.

Format: H.264 video at 720 x 1280, 30 fps, with the recording's AAC audio. Duration: about 72 seconds; the last two seconds have been trimmed. The MP4 uses fast-start metadata for streaming.

The edited recording plays with its original sound and portrait framing. A single control bar provides playback, scrubbing, sound and fullscreen. The fade back to the Reflect project map begins when playback ends. All four discoveries stay marked. The animated 14-second sample is only a fallback if the video cannot load.


`sifter-demo.mp4` is a 14-second, silent, simulated walkthrough of Sifter's pixel
interface, rendered at 1280 × 960, 24 fps, H.264/MP4 with streaming optimization.
It shows pattern entry, search, a mock match, and password-encrypted wallet
export. It does not run mining, generate keys, or create a wallet. The displayed
address and timing are illustrative. Private keys stay hidden throughout.

`scripts/render-sifter-demo.swift` is the source renderer. From the project
root, run `swift scripts/render-sifter-demo.swift` on macOS to regenerate it. The poster
shows the mock result state. Both Reflect project dialogs embed the same video
for slot 2. Playback is muted, loops, pauses on dialog close, and honors reduced
motion by requiring manual play. The original Sayo film is unchanged.
