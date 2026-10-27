# Reflect project showcase

An interactive pixel-art portfolio with a spotlight map, a Sayo controller
showcase film, and a short Sifter interface demo.

## Live site

https://typesecond.github.io/reflect/

Project slots currently feature Bridge75 battery firmware, Sifter, and two
clearly labeled sample concepts. Both project-map views link to the real project
repositories. The Sifter panel includes an illustrative 14-second video.

## Local preview

```sh
python3 serve.py --port 4175
```

Open http://127.0.0.1:4175/. The local server supports byte ranges for video seeking.

## Deployment

GitHub Actions validates the static assets and publishes only `dist/` to GitHub
Pages when `main` changes. There is no application server or database, and no
local server needs to remain running for visitors.

```sh
python3 scripts/check-site.py
```

All local asset paths are relative so the site works beneath `/reflect/` as
well as at the root of the preview server.

## Media and fonts

The Sayo film is an original showcase recording. The Sifter video is a simulated
interface walkthrough; it does not mine or create wallets. Its renderer is in
`scripts/render-sifter-demo.swift`. Details are in `dist/media/README.md`.

Silkscreen is bundled under the SIL Open Font License; its complete notice is
in `dist/assets/Silkscreen-OFL.txt`.
