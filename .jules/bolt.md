## 2025-05-18 - Batching IndexedDB readwrite transactions

**Learning:** Opening separate `readwrite` IndexedDB transactions in a loop (e.g. `await deleteRecord(db, url)` per item) causes massive $O(N)$ transaction overhead (~10ms-20ms per transaction in WebViews due to async event loop queuing and transaction flush boundaries). Batching multiple object store operations into a single transaction reduces execution time from ~250ms to ~2.7ms (>90x speedup for 100 operations).

**Action:** Whenever performing multiple reads or writes/deletes against IndexedDB in loops, collect the keys or records first and process them in a single `db.transaction(...)` call instead of creating per-item transactions.
