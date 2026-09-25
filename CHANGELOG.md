## [Unreleased]

## [1.3.0] - 2026-09-25

**Performance:**

- Faster route matching: only routes for the request's method are scanned
- `q` is now only computed when a handler actually accesses it
- Less per-request overhead when CORS is enabled
- Slightly less per-request overhead for routes with params

## [1.2.0] - 2026-07-02

- Add `.alias()` to register a route under multiple paths without duplicating
  the handler

## [1.1.0] - 2026-06-22

- Add `binary` response

## [1.0.18] - 2026-05-26

- Packaging fix: no longer trigger pnpm's "Ignored build scripts" warning in
  consumer projects.

## [1.0.17] - 2026-02-25

- Initial public release
