import type { JsonObject } from "@liveblocks/core";
import { number, object } from "decoders";

import { HttpError, json, Router } from "~";
import { ErrorHandler } from "~/ErrorHandler";
import { captureConsole, expectResponse, fail } from "~test/utils";

function ok(value: JsonObject): Response {
  return new Response(JSON.stringify(value, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf8" },
  });
}

const IGNORE_AUTH_FOR_THIS_TEST = () => Promise.resolve(true);

/**
 * Generates the simplest router you can think of.
 */
function simplestRouter() {
  return new Router({ authorize: IGNORE_AUTH_FOR_THIS_TEST });
}

describe("starting from scratch gives guided experience", () => {
  test("take 0", () => {
    const r = new Router();
    expect(() => r.fetch).toThrow("No routes configured yet. Try adding one?");
  });

  test("take 1", () => {
    const r = new Router();
    expect(() =>
      // @ts-expect-error deliberate type error
      r.route("/", fail)
    ).toThrow('Invalid route pattern: "/". Did you mean "GET /"?');
  });
});

describe("Router setup errors", () => {
  test("default context is null when not specified", async () => {
    const r = simplestRouter();
    r.route("GET /", ({ ctx }) => ok({ ctx }));

    const req = new Request("http://example.org/");
    const resp = await r.fetch(req);
    await expectResponse(resp, { ctx: null });
  });

  test("unless you specifically define how to authorize, the default router will reject all requests", async () => {
    const konsole = captureConsole();

    const r = new Router();
    r.route("GET /", ({ ctx }) => ok({ ctx }));

    const req = new Request("http://example.org/");
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Forbidden" }, 403);

    expect(konsole.error).toHaveBeenCalledWith(
      "This request was not checked for authorization. Please configure a generic `authorize` function in the Router constructor."
    );
  });

  test("fails for patterns without method", () => {
    const r = simplestRouter();
    // @ts-expect-error Not starting with an HTTP method
    expect(() => r.route("i am not valid", fail)).toThrow(
      'Invalid route pattern: "i am not valid"'
    );
  });

  test("fails for patterns without method", () => {
    const r = simplestRouter();
    // @ts-expect-error Not starting with an HTTP method
    expect(() => r.route("/foo", fail)).toThrow(
      'Invalid route pattern: "/foo". Did you mean "GET /foo"?'
    );
  });

  test("fails for patterns with invalid method", () => {
    const r = simplestRouter();
    // @ts-expect-error Not starting with a valid HTTP method
    expect(() => r.route("GRAB /foo", fail)).toThrow(
      'Invalid route pattern: "GRAB /foo"'
    );
  });

  test("fails with duplicate placeholder", () => {
    const r = simplestRouter();
    expect(() => r.route("GET /foo/<x>/<x>", fail)).toThrow(
      "Duplicate capture group name"
    );
  });

  test("fails with placeholder names that aren’t valid JS names", () => {
    const r = simplestRouter();
    expect(() => r.route("GET /foo/<x/y>", fail)).toThrow(
      "Invalid pattern: /foo/<x/y> (error at position 6)"
    );
  });
});

describe("Router", () => {
  function num(x: string): number {
    const n = parseInt(x);
    if (isNaN(n)) {
      throw new Error("Invalid number");
    }
    return n;
  }

  const r = new Router({
    errorHandler: new ErrorHandler(),
    authorize: IGNORE_AUTH_FOR_THIS_TEST,
    getContext: () => null,
    params: {
      x: num,
      y: num,
    },
  });

  r.onUncaughtError(() =>
    json(
      { error: "Internal server error", details: "Please try again later" },
      500
    )
  );

  r.route("GET /ping", () => ok({ data: "pong" }));
  r.route("GET /echo/<name>", ({ p }) => ok({ name: p.name }));
  r.route("GET /concat/<a>/<b>", ({ p }) => ok({ result: `${p.a}${p.b}` }));
  r.route("GET /add/<x>/<y>", ({ p }) => ok({ result: p.x + p.y, p }));
  r.route("GET /custom-error", () => {
    throw new Response("I'm a custom response", { status: 499 });
  });
  r.route("GET /custom-http-error", () => {
    throw new HttpError(488, "Custom Error");
  });
  r.route("GET /broken", () => {
    throw new Error("Random error");
  });
  r.route("GET /echo-query", ({ q }) => ok({ q }));

  r.route("GET /test", fail);
  r.route("POST /test", fail);
  r.route("PATCH /test", fail);
  r.route("PUT /test", fail);
  r.route("DELETE /test", fail);

  test("without placeholders", async () => {
    const req = new Request("http://example.org/ping");
    expect(await (await r.fetch(req)).json()).toEqual({
      data: "pong",
    });
  });

  test("one placeholder", async () => {
    const req1 = new Request("http://example.org/echo/foo");
    expect(await (await r.fetch(req1)).json()).toEqual({
      name: "foo",
    });

    const req2 = new Request("http://example.org/echo/bar");
    expect(await (await r.fetch(req2)).json()).toEqual({
      name: "bar",
    });
  });

  test("test paths with multiple dynamic placeholders", async () => {
    const req1 = new Request("http://example.org/concat/foo/bar");
    expect(await (await r.fetch(req1)).json()).toEqual({
      result: "foobar",
    });

    const req2 = new Request("http://example.org/concat/bar/foo");
    expect(await (await r.fetch(req2)).json()).toEqual({
      result: "barfoo",
    });
  });

  test("placeholders are automatically decoded", async () => {
    const req1 = new Request("http://example.org/echo/foo%2Fbar%2Fqux");
    expect(await (await r.fetch(req1)).json()).toEqual({
      name: "foo/bar/qux",
    });

    const req2 = new Request("http://example.org/echo/foo%2F😂");
    expect(await (await r.fetch(req2)).json()).toEqual({
      name: "foo/😂",
    });
  });

  test("placeholders are automatically decoded + validated", async () => {
    const req = new Request("http://example.org/add/1337/42");
    expect(await (await r.fetch(req)).json()).toEqual({
      result: 1379,
      p: { x: 1337, y: 42 },
    });
  });

  test("placeholders that cannot be URI decoded will throw a 400 error", async () => {
    const req = new Request("http://example.org/echo/foo%2Xbar%2Xqux");
    //                                                  ^^^   ^^^ Malformed URL
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Bad Request" }, 400);
  });

  test("placeholders that cannot be decoded/transformed will throw a 400 error", async () => {
    const req = new Request("http://example.org/add/1/one");
    //                                                ^^^ Not a valid number
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Bad Request" }, 400);
  });

  test("non-matching paths will return 404", async () => {
    const req = new Request("http://example.org/i/don't/exist");
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Not Found" }, 404);
  });

  test("matching paths but non-matching methods will return 405", async () => {
    const req = new Request("http://example.org/echo/bar", { method: "POST" });
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Method Not Allowed" }, 405);
  });

  test("accessing the query string", async () => {
    const req = new Request(
      "http://example.org/echo-query?a=1&b=2&c=3&c=4&d[]=d1&d[]=d2&x="
    );
    const resp = await r.fetch(req);
    await expectResponse(resp, {
      q: { a: "1", b: "2", c: "4", "d[]": "d2", x: "" },
    });
  });

  test("return custom response", async () => {
    const req = new Request("http://example.org/custom-error");
    const resp = await r.fetch(req);
    await expectResponse(resp, "I'm a custom response", 499);
  });

  test("broken endpoint returns 500", async () => {
    const req = new Request("http://example.org/broken");
    const resp = await r.fetch(req);
    await expectResponse(
      resp,
      {
        error: "Internal server error",
        details: "Please try again later",
      },
      500
    );
  });

  test("custom status error handling", async () => {
    const req = new Request("http://example.org/custom-http-error");
    const resp = await r.fetch(req);
    await expectResponse(resp, { error: "Custom Error" }, 488);
  });
});

describe("Router body validation", () => {
  const r = new Router({ authorize: IGNORE_AUTH_FOR_THIS_TEST });

  r.route(
    "POST /add",
    object({ x: number, y: number }),

    ({ body }) => ({ result: body.x + body.y })
  );

  // r.registerErrorHandler(ValidationError, (e) => json({ crap: true }, 422));
  // r.registerErrorHandler(422, () => json({ crap: true }, 422));

  test("accepts correct body", async () => {
    const req = new Request("http://example.org/add", {
      method: "POST",
      body: '{"x":41,"y":1}',
    });
    await expectResponse(await r.fetch(req), { result: 42 });
  });

  test("rejects invalid body", async () => {
    const req = new Request("http://example.org/add", {
      method: "POST",
      body: '{"x":41,"y":"not a number"}',
    });
    await expectResponse(
      await r.fetch(req),
      { error: "Unprocessable Entity" },
      422
    );
  });

  test("broken JSON bodies lead to 400", async () => {
    const req = new Request("http://example.org/add", {
      method: "POST",
      body: "I'm no JSON",
    });
    await expectResponse(await r.fetch(req), { error: "Bad Request" }, 400);
  });

  test("accessing body without defining a decoder is an error", async () => {
    const konsole = captureConsole();

    const r = new Router({ authorize: IGNORE_AUTH_FOR_THIS_TEST });

    r.route("POST /", (input) => {
      // Simply accessing the `body` without defining a decoder should fail
      input.body;
      return ok({ ok: true });
    });

    const req = new Request("http://example.org/", { method: "POST" });
    await expectResponse(
      await r.fetch(req),
      { error: "Internal Server Error" },
      500
    );

    expect(konsole.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /^Uncaught error: Error: Cannot access body: this endpoint did not define a body decoder/
      )
    );
  });
});

describe("Error handling setup", () => {
  test("every router has its own error handler", async () => {
    const app1 = new Router();
    const app2 = new Router();

    // Configured in r1...
    app1.onError((e) => {
      switch (e.status) {
        case 404:
          return json({ quote: "One does not simply..." }, e.status);
        default:
          return fail();
      }
    });

    // r1 will use the custom defined 404 handler
    app1.route("GET /", fail);
    const resp1 = await app1.fetch(new Request("http://example.org/foo"));
    await expectResponse(resp1, { quote: "One does not simply..." }, 404);

    // ...but r2 will not use it
    app2.route("GET /", fail);
    const resp2 = await app2.fetch(new Request("http://example.org/foo"));
    await expectResponse(resp2, { error: "Not Found" }, 404);
  });

  test("multiple routers can share the same error handler", async () => {
    const errorHandler = new ErrorHandler();
    const app1 = new Router({ errorHandler });
    const app2 = new Router({ errorHandler });

    // Configured in r1...
    app1.onError((e) => {
      switch (e.status) {
        case 404:
          return json({ quote: "One does not simply..." }, e.status);
        default:
          return fail();
      }
    });

    // r1 will use the custom defined 404 handler
    app1.route("GET /", fail);
    const resp1 = await app1.fetch(new Request("http://example.org/foo"));
    await expectResponse(resp1, { quote: "One does not simply..." }, 404);

    // ...and now r2 will also use it
    app2.route("GET /", fail);
    const resp2 = await app2.fetch(new Request("http://example.org/foo"));
    await expectResponse(resp2, { quote: "One does not simply..." }, 404);
  });

  test("handles bugs in http error handler itself", async () => {
    const konsole = captureConsole();

    const app = new Router();
    app.onError(() => {
      throw new Error("Oops, I'm a broken error handler");
    });

    app.route("GET /", fail);

    // Trigger a 404, but the broken error handler will not handle that correctly
    const res = await app.fetch(new Request("http://example.org/foo"));
    await expectResponse(res, { error: "Internal Server Error" }, 500);

    expect(konsole.error).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(
        /^Uncaught error: Error: Oops, I'm a broken error handler/
      )
    );
  });
});
