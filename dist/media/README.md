`sayo-showcase.mp4` contains 0:12 through 1:29.56 of `IMG_2732.mov`.
The first 12 seconds are removed from the file. Playback starts at 0:00,
and the edited duration is 1:17.56 (77.555 seconds).

Format: H.264, 720 × 1280, 30 fps, with the original AAC audio passed through.
Video targets 2.5 Mb/s. MP4 metadata is placed before the media data for streaming.
Location metadata is not copied to the export.

The recording retains its portrait framing and sound. Playback, seeking, sound,
and fullscreen use the existing control bar. On completion or close, the film
fades to black and returns to the same map, gear, selection, and discovery count.
The 14-second animation remains a fallback for playback errors.

Regenerate on macOS with:

```sh
swift scripts/prepare-showcase.swift /path/to/IMG_2732.mov /tmp/sayo-showcase.mp4 89.56 12
```

`sifter-demo.mp4` is a 14-second, silent, simulated walkthrough of Sifter's pixel
interface, rendered at 1280 × 960, 24 fps, H.264/MP4 with streaming optimization.
It shows pattern entry, search, a mock match, and password-encrypted wallet
export. It does not run mining, generate keys, or create a wallet. The displayed
address and timing are illustrative. Private keys stay hidden throughout.

`scripts/render-sifter-demo.swift` is the source renderer. From the project
root, run `swift scripts/render-sifter-demo.swift` on macOS to regenerate it. The poster
shows the mock result state. Both Reflect project dialogs embed the same video
for slot 2. Playback is muted, loops, pauses on dialog close, and honors reduced
motion by requiring manual play.
