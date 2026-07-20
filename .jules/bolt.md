## 2026-07-18 - Optimized File Type Pattern Matching in Helpers

**Learning:** Declaring large regular expression mappings (e.g., 23 regex patterns) and allocating array keys via `Object.keys().find()` on hot execution paths (such as `getFileType` which runs for every file node in tree/list renders) creates major performance and GC overhead.

**Action:** Extract large object literals containing RegExp objects to static file-level constants, and replace dynamic lookup methods like `.find` on `Object.keys()` with highly-optimized, allocation-free `for...in` loops.
