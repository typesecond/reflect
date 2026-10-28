/* One project list keeps both portfolio views and their counters in sync. */
window.ReflectProjects = [
  {
    name: 'Bridge75 battery', type: 'FIRMWARE / EMBEDDED SYSTEMS', kind: 'keyboard',
    position: [.27, .29],
    description: 'Hold Fn and the F1–F12 lights become a battery gauge. Six keys mean 50%; all twelve mean full. Release Fn and the keyboard goes dark. Built with QMK, with packet validation and tests for every battery level. Software-validated candidate; hardware validation is pending.',
    tags: ['QMK / C', 'Battery telemetry', 'Fn lighting'],
    url: 'https://github.com/typesecond/bridge75-firmware', linkLabel: 'View firmware on GitHub ↗',
    status: 'Software-validated firmware · Hardware validation pending',
  },
  {
    name: 'Sifter', type: 'CRYPTOGRAPHY / DESKTOP TOOLS', kind: 'sifter',
    position: [.73, .31],
    description: 'Find an Ethereum address with a prefix, suffix, or both. Sifter pairs a pixel-art desktop interface with CPU and OpenCL search, live progress, and password-encrypted wallet export. Every result is checked against its private key. An experimental open-source project with a CLI and regression tests.',
    tags: ['Python', 'CPU / OpenCL', 'Pixel UI'],
    url: 'https://github.com/typesecond/sifter', linkLabel: 'View Sifter on GitHub ↗',
    status: 'Experimental software · 19 regression tests',
    demo: 'media/sifter-demo.mp4', demoPoster: 'media/sifter-demo-poster.png',
  },
  {
    name: 'Rocket League net', type: 'GRAPHICS / GAME TOOLS', kind: 'goal',
    position: [.5, .56],
    description: 'A soccer-style goal net that responds to a shot. The playable Canvas sandbox lets you tune net depth, grid spacing, shot speed, and impact position, then watch the mesh deform and settle. The project also includes procedural goal-asset generators for a future custom-map workflow. Rocket League integration is still pending.',
    tags: ['Canvas / JavaScript', 'Procedural mesh', 'Net deformation'],
    url: 'demos/soccer-net/index.html', linkLabel: 'Try the net sandbox ↗',
    status: 'Playable browser prototype · Game integration pending',
  },
];
