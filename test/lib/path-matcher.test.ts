import * as fc from "fast-check";
import { describe, expect, test } from "vitest";

import { pathMatcher } from "~/lib/path-matcher.js";

function _(pathname: string, base = "https://example.com") {
  return new URL(pathname, base);
}

describe("pathMatcher", () => {
  test("simple paths (without dynamic segments)", () =>
    fc.assert(
      fc.property(
        fc.webUrl().map((u) => new URL(u)),

        (input) => {
          fc.pre(input.pathname !== "/");
          expect(pathMatcher("GET /").matchURL(input)).toBeNull();
        }
      )
    ));

  test("simple paths (without dynamic segments)", () => {
    expect(
      pathMatcher("GET /").matchURL(new URL("https://example.com"))
    ).toEqual({});
    expect(
      pathMatcher("GET /").matchURL(new URL("https://example.com/"))
    ).toEqual({});

    expect(pathMatcher("GET /foo").matchURL(_("/foo"))).toEqual({});
    expect(pathMatcher("GET /foo").matchURL(_("/foo/"))).toEqual({});
  });

  test.each(
    // [pattern, input, result]
    [
      ["/", "/foo", null],
      ["/foo/<bar>", "/foo/bar", { bar: "bar" }],
      ["/foo/<bar>", "/foo/qux", { bar: "qux" }],
      ["/foo/<qux>", "/foo/bar", { qux: "bar" }],
      ["/foo/<a>/<b>", "/foo/bar", null],
      ["/foo/<a>/<b>", "/foo/bar/qux", { a: "bar", b: "qux" }],
      ["/foo/<a>/<b>", "/foo/bar/qux/baz", null],
    ]
  )("path with dynamic segment: %p %p", (pattern, input, result) => {
    expect(pathMatcher("GET " + pattern).matchURL(_(input))).toEqual(result);
  });

  test.each([
    ["", "Route must start with '/'"],
    [" ", "Route must start with '/'"],
    ["must/start/with/slash/", "Route must start with '/'"],
    ["//", "Route may not end with '/'"],
    ["/must/not/end/with/slash/", "Route may not end with '/'"],
    ["/spaces are not allowed", "Invalid pattern"],
    ["/cannot/have//double/slashes", "Invalid pattern"],
    ["//x", "Invalid pattern"],
    ["/<not closed", "Invalid pattern"],
    ["/not opened>", "Invalid pattern"],
    ["/<not><opened>", "Invalid pattern"],
    ["/<vars cannot have spaces>", "Invalid pattern"],
    ["/foo/%bar", "Invalid pattern"],
    ["/foo\\bar", "Invalid pattern"],
    ["/foo/:bar", "Invalid pattern"],
  ])("throws when initialized with invalid path: %p", (invalid, errmsg) => {
    expect(() => pathMatcher("GET " + invalid)).toThrow(errmsg);
  });
});
