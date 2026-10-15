# OVERGROWTH: Solo Founder Skill Tree
A GrassChopper-inspired 8-bit handbook. Cut through the overgrowth, one playbook chapter at a time.

## Open locally
- Double-click `index.html`, or
- `cd /workspace/startup-handbook && python3 -m http.server 8080`, then open http://localhost:8080

No build step. Fonts load from Google Fonts; without a connection it falls back to monospace. Progress is saved in localStorage (RESET clears it).

## Files
- `skills-data.js`: `ARCS` + `SKILLS`, the content and the tree layout (edit here)
- `app.js`: rendering, the vine tree, pan/zoom, progress mechanics
- `styles.css`: pixel UI
- `RESEARCH.md`: research behind the design
