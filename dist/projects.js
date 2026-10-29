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
    description: 'Project vision: a physics-accurate soccer net modeled into the existing Rocket League net enclave. Configurable net depth and mesh density shape a three-dimensional goal assembly, with a procedural modeling workflow through Python, Blender, and UDK. Designed to bring believable ball-impact response and net movement to the goal while preserving its existing layout and scoring behavior. Prototype stage; in-game integration and physics validation are pending.',
    tags: ['Python / Mesh generation', 'Blender / FBX', 'UDK asset pipeline'],
    url: 'https://github.com/typesecond/rocket-league-soccer-net', linkLabel: 'View Rocket League net on GitHub ↗',
    status: 'Procedural asset prototype · Game integration and physics validation pending',
  },
];
