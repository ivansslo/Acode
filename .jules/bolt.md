# Bolt Performance Journal

## 2026-06-21 - Native String Manipulation Beats RegExp and Array Allocations for Path Utilities
**Learning:** Utilities like `Path.extname` are called frequently across the codebase during file type checking, rendering, and icon mapping. Inefficient implementations that use `.split('/')`, `.slice(-1)[0]`, and RegExp compilation/matching (`/.+\..*$/`) incur heavy overhead from array allocations and regular expression execution. Replacing these with `lastIndexOf` and `.slice` native string methods results in a ~5.6x speedup (~20s vs ~3.6s for 10 million iterations) and removes all garbage collection overhead.
**Action:** Always inspect basic path/URL helpers for RegExp or array allocation patterns (`split`, `slice`, `map`) on critical hot paths, and substitute them with direct native string operations like `indexOf`, `lastIndexOf`, `startsWith`, and `slice` where possible.
