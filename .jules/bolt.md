## 2025-05-15 - [Optimize Mode Resolution]
**Learning:** The core mode resolution utility `getModeForPath` was performing an O(M log M) sort on every call to resolve a file type, which is a high-frequency operation.
**Action:** Always check if core utility functions that involve sorting or heavy computation can be optimized with lazy caching or pre-calculated properties, especially when dealing with static or semi-static data like mode definitions.
