# Vendored: @booqable/client

This directory is the **built output of [booqable/booqable.js](https://github.com/booqable/booqable.js)**
(commit `886d6df`), the zero-dependency JavaScript port of the booqable.rb gem.

- **Do not edit these files** — changes belong in the booqable.js repo.
- To update, run `scripts/vendor-booqable-js.sh` from the repo root.
- The app-facing entry point is `src/lib/booqable.ts`, which exports a
  `booqable` client configured for the worker proxy + iframe session; import
  types or errors from `@/lib/booqable/index.js` when needed.
