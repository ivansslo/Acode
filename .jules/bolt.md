## 2025-02-21 - Palette hint generators evaluating getters in loops

**Learning:** In Acode palette implementations (`commandPalette`, `findFile`), properties like `recents.files` or `recentCommands.commands` are getters that access `localStorage` and run `JSON.parse` synchronously on every access. Calling these inside `.forEach` or `.map` loops over files or commands causes hundreds or thousands of redundant `localStorage` reads and JSON parses per hint generation pass.

**Action:** Always hoist recents/history getter calls out of iteration loops into a `Set` (`new Set(recents.files)` or `new Set(recentCommands.commands)`) before processing items. This reduces I/O & parsing to a single pass and turns linear $O(N)$ array searches into $O(1)$ constant-time Set lookups.
