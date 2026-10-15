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
