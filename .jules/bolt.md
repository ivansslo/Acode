## 2026-07-24 - Sorting Optimization: Repeated .toLowerCase() vs Property Cache vs Map Cache
**Learning:** In V8 (Node/Chrome/WebView), repeatedly calling `.toLowerCase()` on short strings (~13 chars) inside an array sorting comparator is faster than either introducing dynamic object property mutations (`item._lowercaseName = ...`) or lookup overheads using a `Map`. Mutating objects dynamically changes their hidden class/shape, causing V8 to deoptimize the object layout, which is highly detrimental to performance (~12% slower). Map lookups also incur consistent access overhead.
**Action:** Avoid caching string cases on objects during sorting unless string lengths are extremely long or comparison counts are massive, and never dynamically mutate object properties to cache sort keys.

## 2026-07-24 - SAF Content URI Formatting Performance in getVirtualAddress
**Learning:** In path-processing utilities like `getVirtualAddress`, using dynamic RegExp compilation inside a loop to match prefixes of storage URIs causes major performance degradation (~90.56% overhead). Native `String.prototype.startsWith` is heavily optimized in JS runtimes, allocation-free, and handles prefix matching perfectly.
**Action:** Always favor native string methods (`startsWith`, `slice`) over RegExp compilation when checking or manipulating fixed prefixes/suffixes of strings.
