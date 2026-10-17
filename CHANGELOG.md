# Changelog

## [Unreleased] - 2026-10-10

### Added
- **Reload button** on the Transactions tab, next to the account filter buttons. It re-reads the opened file and re-parses it, and shows a short "Reloaded" confirmation.
- **Reload button in the page footer.** It reloads and then scrolls to the bottom of the page so the latest changes stay in view.
- **True reload from disk** in browsers that support the File System Access API (Chrome, Edge). The Open tab now uses `showOpenFilePicker()` and keeps a file handle. In Firefox and Safari, Reload re-opens the file picker instead, because those browsers can't re-read a file silently.
- **`above` keyword in value expressions.** It evaluates to the sum of the postings written above it in the same transaction, e.g. `Expenses:Food  ($172.22 - above)`. Postings before it contribute; the postings after it, including a blank auto-balanced one, do not. On the first posting it is `0`.
- **Comment indicator column** in the transaction table. A comment icon appears for transactions that have notes or comments, and hovering it shows the text of the transaction note, posting notes and comment lines.
- Tests for `above` in the grammar and in journal processing.
- `watchify` dev dependency and an `npm run watch` script that rebuilds `bundle.js` on save.

### Changed
- The Open tab's file `<input>` is now a "Choose File" button. The classic input stays as a hidden fallback.
- `ExpressionEvaluator.evaluate(expr, context)` takes an optional `context` (currently `runningTotal`). Existing single-argument calls are unaffected.
- `Journal.amount(posting, runningTotal)` and `Journal.transactionBalance()` now carry a running total across postings.

### Fixed
- Removed an unresolved git merge conflict in `spec/journal.spec.js` that broke the test run.
- Removed a reference to an undefined `button` variable in the file reader's `onerror` handler.