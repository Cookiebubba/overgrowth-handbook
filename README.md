# OVERGROWTH: Solo Founder Skill Tree
A GrassChopper-inspired 8-bit skill-tree handbook for solo founders. There are 58 playbook chapters on a thorny vine tree. You cut each chapter free, do the real-world goal, and earn gold.

Live: https://cookiebubba.github.io/overgrowth-handbook/

## Open locally
`python3 -m http.server 8080` in this folder, then open http://localhost:8080 (or just open index.html).

## Files
- `skills-data.js`: chapters, with `all` (hard) and `any` (one-of groups) requirements, a `what` one-liner, and the `goal` ("To clear this")
- `icons.js`: hand-drawn 12x12 pixel icons rendered as crisp SVG
- `layout.js`: generated radial vine layout (`node tools/layout.js`)
- `app.js` / `styles.css` / `index.html`: the game UI (Meadow and Classic themes)
- `LOGIC.md`: the dependency map and reasoning
- `RESEARCH.md`: the research behind the design

## Tools
- `node tools/validate-graph.js`: checks for cycles, unreachable chapters, redundant or dominated requirements, silly gates, and the minimum path to each milestone
- `node tools/layout.js`: regenerates the tree layout after you edit the data
- `node tools/logic-md.js`: prints the dependency table used in LOGIC.md

## Sound and cursors (v4.1)
- `audio/`: music loop and sound effects generated with ElevenLabs (Music + Sound Effects APIs) from prompts in one shared style ("soft retro 8-bit chiptune, warm, cozy, NES-style"), then trimmed, filtered, tuned to C major and loudness-matched. OGG with MP3 fallback, loaded via WebAudio `decodeAudioData`; the procedural 8-bit sounds remain as a fallback.
- Music: 48 s seamless loop (16 bars at 80 BPM), fades in over 2 s after the first tap, ducks under coin bursts, pauses when the tab is hidden, separate ♪ toggle (saved, on by default).
- `cursors/`: pixel arrow / pointing hand / grab / grabbing, 32 px plus 64 px for 2x screens.
