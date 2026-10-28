# Reflect project showcase

An interactive pixel-art portfolio with a spotlight map, a Sayo controller
showcase film, and a short Sifter interface demo.

## Live site

https://typesecond.github.io/reflect/

The three project slots feature Bridge75 battery firmware, Sifter, and a Rocket
League soccer-net prototype. Both map views use the shared `dist/projects.js`
project list. Sifter includes an illustrative 14-second video. All three project
panels link to their GitHub repositories. Firmware hardware validation and
Rocket League game integration are clearly marked as pending.

Click anywhere on the controller knob to scan the next project. Project cards
open on the first click or tap, and the film button is always available.
When the film ends or is closed, the same map and controller remain available,
with the selected project and discovery progress preserved. The film can be
played again without reloading the page.

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

## Rocket League project

The third slot links to https://github.com/typesecond/rocket-league-soccer-net,
which contains the procedural mesh generators, generated assets, Windows
staging helper, and integration documentation. The portfolio does not host a
copy of the browser simulation.

## Media and fonts

The Sayo film is an original showcase recording. The Sifter video is a simulated
interface walkthrough; it does not mine or create wallets. Its renderer is in
`scripts/render-sifter-demo.swift`. Details are in `dist/media/README.md`.

Silkscreen is bundled under the SIL Open Font License; its complete notice is
in `dist/assets/Silkscreen-OFL.txt`.
