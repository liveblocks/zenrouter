# Zen Router

<p>
  <a href="https://npmjs.org/package/@liveblocks/zenrouter"><img src="https://img.shields.io/npm/v/@liveblocks/zenrouter?style=flat&label=npm&color=c33" alt="NPM" /></a>
  <a href="https://bundlejs.com/?q=%40liveblocks%2Fzenrouter%401.0.17&treeshake=%5B%7B+ZenRouter+%7D%5D"><img src="https://deno.bundlejs.com/badge?q=@liveblocks/zenrouter&treeshake=[{ZenRouter}]" alt="Size" /></a>
  <a href="https://github.com/liveblocks/zenrouter/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-apache2-green" alt="License: Apache 2.0" /></a>
</p>

An opinionated API router with typed path params, built-in body validation, and
a clean auth model. Built for Cloudflare Workers, Bun, Node.js, and every other
modern JavaScript runtime.

**[Documentation](https://zenrouter.liveblocks.io/docs)**

## Installation

```
npm i @liveblocks/zenrouter
```

## Quick start

```ts
import { object, string } from "decoders";
import { ZenRouter } from "@liveblocks/zenrouter";

const zen = new ZenRouter(/* ... */);

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

## License

Licensed under the Apache License 2.0, Copyright © 2021-present
[Liveblocks](https://liveblocks.io).

See [LICENSE](../../licenses/LICENSE-APACHE-2.0) for more information.
