import { number, numeric, object, string } from "decoders";
import { describe, expectTypeOf, test } from "vitest";

import { HttpError, ValidationError, ZenRouter } from "~/index.js";

declare function fail(message?: string): never;

declare const req: Request;

describe("ZenRouter without options", () => {
  test("ctx is readonly unknown, path param is string", () => {
    const app = new ZenRouter();
    app.route("GET /<foo>", ({ ctx, p }) => {
      expectTypeOf(ctx).toEqualTypeOf<Readonly<unknown>>();
      expectTypeOf(p.foo).toEqualTypeOf<string>();
      fail("no implementation");
    });
  });

  test("fetch returns a Response", async () => {
    const app = new ZenRouter();
    app.route("GET /<foo>", () => fail("no implementation"));
    expectTypeOf(await app.fetch(req, 1, "a", true)).toEqualTypeOf<Response>();
  });
});

describe("ZenRouter with getContext()", () => {
  test("ctx reflects the return type of getContext()", () => {
    const app = new ZenRouter({
      getContext: (request, ...args) => ({ hello: "world", request, args }),
    });

    app.route("GET /", ({ ctx }) => {
      expectTypeOf(ctx.hello).toEqualTypeOf<string>();
      expectTypeOf(ctx.request.url).toEqualTypeOf<string>();
      expectTypeOf(ctx.args).toEqualTypeOf<readonly any[]>();
      fail("no implementation");
    });
  });
});

describe("ZenRouter with authorize()", () => {
  test("auth reflects the return type of authorize()", () => {
    const app = new ZenRouter({
      authorize: ({ ctx }) => ({
        userId: "user-123",
        passThrough: { ctx },
      }),
    });

    app.route("GET /", ({ ctx, auth }) => {
      expectTypeOf(ctx).toEqualTypeOf<Readonly<unknown>>();
      expectTypeOf(auth.passThrough.ctx).toEqualTypeOf<Readonly<unknown>>();
      expectTypeOf(auth.userId).toEqualTypeOf<string>();
      fail("no implementation");
    });
  });
});

describe("ZenRouter with getContext() + authorize()", () => {
  test("ctx and auth reflect both functions' return types", () => {
    const app = new ZenRouter({
      getContext: () => ({ abc: 123 }),
      authorize: ({ ctx }) => ({
        userId: "user-456",
        passThrough: { ctx },
      }),
    });

    app.route("GET /", ({ ctx, auth }) => {
      expectTypeOf(ctx).toEqualTypeOf<Readonly<{ abc: number }>>();
      expectTypeOf(auth.passThrough.ctx).toEqualTypeOf<
        Readonly<{ abc: number }>
      >();
      expectTypeOf(auth.userId).toEqualTypeOf<string>();
      fail("no implementation");
    });
  });
});

describe("ZenRouter with centralized param validation", () => {
  test("typed params are decoded; unrelated ones are not available", () => {
    const app = new ZenRouter({
      params: {
        id: numeric,
        hex: string.transform((x) => parseInt(x, 16)),
      },
    });

    app.route("GET /rooms/<id>", ({ p }) => {
      expectTypeOf(p.id).toEqualTypeOf<number>();
      fail("no implementation");
    });

    app.route("GET /foo/<id>/bar/<name>", ({ p }) => {
      expectTypeOf(p.id).toEqualTypeOf<number>();
      expectTypeOf(p.name).toEqualTypeOf<string>();
      // @ts-expect-error Not part of the pattern, so not available
      p.hex;
      fail("no implementation");
    });

    app.route("GET /foo/<id>/bar/<name>/hex/<hex>", ({ p }) => {
      expectTypeOf(p.id).toEqualTypeOf<number>();
      expectTypeOf(p.name).toEqualTypeOf<string>();
      // Compare to the prev test, here hex *is* available
      expectTypeOf(p.hex).toEqualTypeOf<number>();
      fail("no implementation");
    });
  });

  test("body without a schema is `never`", () => {
    const app = new ZenRouter({ params: { id: numeric } });
    app.route("POST /foo/<id>", ({ body }) => {
      expectTypeOf(body).toEqualTypeOf<never>();
      fail("no implementation");
    });
  });

  test("body is typed from the provided schema", () => {
    const app = new ZenRouter({ params: { id: numeric } });
    app.route(
      "POST /foo/<id>",
      object({ foo: string, bar: number }),
      ({ body }) => {
        expectTypeOf(body.foo).toEqualTypeOf<string>();
        expectTypeOf(body.bar).toEqualTypeOf<number>();
        // @ts-expect-error body.qux does not exist
        body.qux;
        fail("no implementation");
      }
    );
  });

  test("query params are always optional strings", () => {
    const app = new ZenRouter();
    app.route("GET /foo", ({ q }) => {
      expectTypeOf(q.foo).toEqualTypeOf<string | undefined>();
      expectTypeOf(q.bar).toEqualTypeOf<string | undefined>();
      expectTypeOf(q.i_do_not_exist).toEqualTypeOf<string | undefined>();
      fail("no implementation");
    });
  });
});

describe("Type-safety of error handlers", () => {
  test("onUncaughtError receives unknown; onError receives HttpError | ValidationError", () => {
    const app = new ZenRouter();

    app.onUncaughtError((e) => {
      expectTypeOf(e).toEqualTypeOf<unknown>();
      fail();
    });

    app.onError((e) => {
      expectTypeOf(e).toEqualTypeOf<HttpError | ValidationError>();
      if (e instanceof ValidationError) {
        expectTypeOf(e.reason).toEqualTypeOf<string>();
      }
      fail();
    });
  });
});
