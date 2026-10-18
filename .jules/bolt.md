## 2025-05-14 - Batching CodeMirror 6 StateEffects
**Learning:** Sequential `editor.dispatch` calls in CodeMirror 6 trigger multiple expensive view update cycles. Batching them into a single `dispatch({ effects: [...] })` significantly improves performance during complex state transitions like switching files.
**Action:** Always look for opportunities to batch `StateEffect` objects when multiple configuration changes occur simultaneously.
