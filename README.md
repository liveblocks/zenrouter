# Zen Router

<p>
  <a href="https://npmjs.org/package/@liveblocks/zenrouter"><img src="https://img.shields.io/npm/v/@liveblocks/zenrouter?style=flat&label=npm&color=c33" alt="NPM" /></a>
  <a href="https://bundlephobia.com/package/@liveblocks/zenrouter"><img src="https://img.shields.io/bundlephobia/minzip/@liveblocks/zenrouter?style=flat&label=size&color=09f" alt="Size" /></a>
  <a href="https://github.com/liveblocks/zenrouter/blob/main/LICENSE"><img src="https://img.shields.io/github/license/liveblocks/zenrouter?style=flat&label=license&color=f80" alt="License" /></a>
</p>

Zen Router is an opinionated API router with batteries included, encouraging
patterns that remain maintainable as your application grows.

## Installation

```
npm i @liveblocks/zenrouter
```

## Purpose

The main purpose of this router is to implement an API backend.

## Quick start

```ts
import { object, string } from "decoders";
import { Router } from "@liveblocks/zenrouter";

const zen = new Router(/* ... */);

zen.route(
  "GET /greet/<name>",

  ({ p }) => ({ result: `Hi, ${p.name}!` })
);

zen.route(
  "POST /greet",

  object({ name: string }),

  ({ body }) => ({
    result: `Hi, ${body.name}!`,
  })
);

export default zen;
```

## The Zen Router pipeline

![](./zen-router-diagram.png)

## Principles

### Pragmatic

- Implementing real-world endpoints should be joyful, easy, and type-safe.
- All requests and responses are JSON by default.
- All error responses have at least an `{ error }` key with a human-readable
  string.
- You can _throw_ any HTTP error to short-circuit a non-2xx response.
- JSON error responses for all known HTTP status codes, customizable per status
  code.
- CORS support is built-in with a sane `{ cors: true }` default that applies to
  all endpoints in the router. `OPTIONS` routes and responses are managed
  automatically.

### Secure by default

- All requests must be authorized. Authorization is opt-out, not opt-in.
- All path params are verified and type-safe (`/foo/<bar>/<qux>` available as
  `p.bar` and `p.qux`), cannot be empty, and are URI-decoded automatically.
- Input JSON bodies of POST requests must be validated, and are made available
  as a fully-type safe `body` in the handler.
- All query strings are type-safely accessible (`/foo?abc=hi` as `q.abc`).

### Maintainable

- All route patterns are static, fully qualified, and thus greppable. No "base"
  prefix URL setup, which in practice makes codebases harder to navigate over
  time.
- Routes include the method in the definition (`zen.route("POST /v2/foo/bar")`
  instead of `zen.post("/v2/foo/bar")`).
- No complex middlewares. Only the request context and auth functions can carry
  data alongside a request. No per-route middlewares, no monkey-patching of the
  request object.
- Default error handling is configurable per status code; individual handlers
  can always bypass it by throwing a custom Response.

## License

Licensed under the Apache License 2.0, Copyright © 2021-present
[Liveblocks](https://liveblocks.io).

See [LICENSE](../../licenses/LICENSE-APACHE-2.0) for more information.
