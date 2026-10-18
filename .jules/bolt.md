## 2026-07-12 - Batched CodeMirror StateEffects
**Learning:** In Acode's EditorManager, switching files or updating settings triggered multiple separate `editor.dispatch` calls for theme, individual options, and read-only status. Each dispatch in CodeMirror 6 triggers a full view update cycle, which is expensive on mobile devices.
**Action:** Use an optional `targetEffects` array parameter in configuration functions to collect `StateEffect` objects and dispatch them in a single transaction at the end of the update block.
