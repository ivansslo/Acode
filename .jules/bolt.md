## 2026-07-13 - Batching CodeMirror State Effects
**Learning:** CodeMirror 6 `StateEffect` objects should be batched into a single `editor.dispatch({ effects })` call whenever possible. Each dispatch triggers a full view update cycle, which is expensive. Batching multiple configuration changes (theme, options, read-only status) into one transaction significantly reduces UI thread overhead during file switching and settings updates.

**Action:** When modifying editor configurations, always check if multiple dispatches can be combined. Provide an optional `targetEffects` array to utility functions to facilitate this batching pattern across the codebase.
