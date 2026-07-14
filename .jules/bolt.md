## 2025-05-15 - Redundant sorting in CodeMirror mode resolution
**Learning:** The `getModeForPath` function in `modelist.ts` was performing an $O(M \log M)$ sort operation on $\sim150$ language modes every time it was called. In a folder listing with $N$ files, this resulted in $O(N \cdot M \log M)$ complexity, causing significant UI lag when resolving file icons for large directories.
**Action:** Always pre-calculate specificity scores and cache sorted lists for frequently accessed registry-like structures. Invalidate the cache only when the underlying registry is modified.
