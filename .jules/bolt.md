## 2025-05-22 - Batching CodeMirror 6 Dispatches
**Learning:** CodeMirror 6 view updates are triggered on every `dispatch`. When multiple compartments or facets need reconfiguration (e.g., during file switching or theme changes), multiple `dispatch` calls lead to redundant DOM measurements and re-renders, impacting perceived smoothness.
**Action:** Always prefer batching `StateEffect` objects into a single `editor.dispatch({ effects: [...] })` call. Designed `applyOptions` and `setTheme` to support an optional `targetEffects` array to facilitate this pattern across the codebase.
