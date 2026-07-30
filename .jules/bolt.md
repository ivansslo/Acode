# Bolt ⚡ Performance Optimization Journal

This journal contains critical performance learnings, bottlenecks, and patterns specific to this codebase.

## 2025-03-01 - Optimizing CodeMirror Mode Selection with Lazy-Loaded Sorting Cache
**Learning:** Repetitive sorting of arrays based on dynamic, heavy-computation string properties (like mode specificity scores calculated using RegExp splitting and matching) is a common hot path bottleneck. By caching the sorted representation and pre-calculating specificity scores, we completely avoided array copying and sorting on each lookup.
**Action:** When working with configuration lookup structures, look for opportunities to pre-calculate priorities/scores on instantiation and use a module-level cached list. Ensure mutating methods properly invalidate this cache.
