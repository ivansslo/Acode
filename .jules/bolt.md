## 2025-05-14 - Batching CodeMirror 6 Transactions
**Learning:** CodeMirror 6 view updates are triggered by every `editor.dispatch()` call. Sequential calls to `applyOptions()`, `setTheme()`, and read-only updates in `applyCurrentEditorOptions` resulted in multiple redundant view update cycles.
**Action:** Always prefer batching `StateEffect` objects into a single `editor.dispatch({ effects })` call when performing multiple configuration changes simultaneously to improve UI responsiveness and reduce CPU overhead.
