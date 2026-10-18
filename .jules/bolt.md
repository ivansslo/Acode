# Bolt Performance Journal

## 2025-02-15 - Caching Sorted Mode Specificity List
**Learning:** CodeMirror mode detection uses `getModeForPath`, which originally performed an $O(M \log M)$ sorting of 146 registered modes on *every single* call, repeatedly parsing strings/regexes to calculate mode specificity scores. Precomputing scores during mode construction and caching the sorted list of modes at the module level (invalidated only on `addMode` / `removeMode`) avoids thousands of redundant allocations and CPU cycles.
**Action:** Always watch out for helper functions that repeatedly sort arrays or process regular expression sources within hot paths (like rendering files in a file tree or resolving modes for files). Cache sorted references and precompute metadata during initialization.
