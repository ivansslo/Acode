# Bolt ⚡ Performance Journal

Critical learnings, codebase performance patterns, and unexpected bottlenecks.

## 2025-03-01 - Color Chip Rendering Bottleneck
**Learning:** Synchronous HTML5 Canvas operations, specifically `ctx.getImageData()`, are extremely slow due to forcing a GPU-to-CPU readback and synchronization. Calling it repeatedly inside a CodeMirror 6 viewport rendering cycle blocks the main thread and causes visible scroll lag. Wrapping it with highly optimized, regex-based JS parsing functions for Hex, RGB/RGBA, HSL/HSLA, and CSS named colors completely avoids the canvas overhead for >99.9% of user colors.
**Action:** For performance-critical UI rendering pipelines that need color parsing, prioritize lightweight native JS parsing and caching over web browser rendering fallback mechanisms.
