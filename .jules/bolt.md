# Bolt's Journal

## 2024-08-09 - Object iteration overhead in Javascript: for...in vs. pre-calculated array loops
**Learning:** While refactoring helper functions to avoid dynamic RegExp compilation and configuration redeclarations, we observed that using a native `for...in` loop to iterate over object keys was surprisingly slower (~0.68x) than the original `Object.keys().find()` implementation. This occurs because `for...in` traverses the prototype chain and introduces runtime check overhead in V8. Moving the object to file-scope and iterating over a pre-calculated `Object.entries()` array completely bypasses this overhead, resulting in a ~2.7x speedup.
**Action:** Always prefer flat pre-calculated arrays (like `Object.entries` or `Object.keys` cached once at file scope) with a standard index-based `for` loop over `for...in` loops when optimizing high-traffic object property traversals.
