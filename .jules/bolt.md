# Bolt ⚡ Performance Optimization Journal

## 2025-02-14 - Lazy-Caching Mode Lists and Pre-computing Specificity Scores
**Learning:** In Acode, file-path-to-editor-mode resolution (`getModeForPath`) was performing a full `O(M log M)` sort of all registered modes on every single call. Because modes are rarely added or removed after boot, but are frequently searched during file opening, switching, and LSP actions, this was a severe CPU bottleneck on Android devices. Additionally, computing `specificityScore` inside the sort comparator repeatedly parsed and evaluated extension strings.
**Action:** Always pre-compute and store specificity scores directly on model/configuration instances at construction time. Use a module-level lazy-cache for sorted/filtered structures that are frequently read but rarely mutated, and ensure precise invalidation hooks are placed in mutator functions (`addMode`, `removeMode`).
