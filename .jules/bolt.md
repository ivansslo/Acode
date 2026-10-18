# Bolt ⚡ Performance Journal

Critical learnings, codebase performance patterns, and unexpected bottlenecks.

## 2026-08-01 - Modelist Sorting Bottleneck
**Learning:** In the Acode codebase, file resolution (`getModeForPath`) is queried extremely frequently during tab switching, file opening, and status bar updates. Each query trigger performed a full $O(M \log M)$ sort over CodeMirror's registered modes list. Because sorting recalculated a complex specificity score with expensive string splits and RegExp source length checks on every comparison, it severely slowed down path resolution.
**Action:** Always pre-calculate and cache static weights (like `specificityScore`) during class initialization, and lazily sort/cache lookups that occur repeatedly on static datasets.
