## 2025-05-22 - [Batch CodeMirror Dispatches]
**Learning:** Multiple sequential `editor.dispatch({ effects })` calls in CodeMirror 6 trigger multiple updates, which can be expensive (layout, re-rendering). Batching `StateEffect` objects into a single dispatch is more efficient.
**Action:** When updating multiple options or swapping editor state, collect all `StateEffect` objects into an array and call `editor.dispatch({ effects })` once at the end.
