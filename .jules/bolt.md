## 2025-05-15 - [Batching CodeMirror State Effects]
**Learning:** In CodeMirror 6, every `dispatch` call triggers a full update cycle, including DOM measurements and re-rendering. Sequential updates to theme, language, and editor options can cause measurable stutter on mobile devices.
**Action:** Always batch `StateEffect` objects into a single `dispatch` whenever possible. Refactor configuration methods like `applyOptions` and `setTheme` to accept an optional `targetEffects` array for shared transactions.
