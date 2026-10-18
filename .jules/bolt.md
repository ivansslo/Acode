## 2025-02-15 - Slicing string file extensions in JS
**Learning:** Slicing a string with `slice(0, -ext.length)` when `ext` is empty results in `slice(0, -0)`, which is coerced to `slice(0, 0)` and returns an empty string. This can cause severe functional regressions when attempting to remove empty file extensions.
**Action:** Always check that the extension string is non-empty (`if (ext)`) before slicing path strings by negative extension length.
