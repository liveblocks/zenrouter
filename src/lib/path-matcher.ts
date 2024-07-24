import type { Resolve } from "@liveblocks/core";
import type {
  ComposeLeft,
  Functions,
  Objects,
  Pipe,
  Strings,
  Tuples,
  Unions,
} from "hotscript";

import { raise } from "./utils.js";

const cleanSegmentRe = /^[\w-]+$/;
const identifierRe = /^[a-z]\w*$/;

export type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type PathPattern = `/${string}`;
export type Pattern = `${Method} ${PathPattern}`;

/**
 * From a pattern like:
 *
 *   'GET /foo/<bar>/<qux>/baz'
 *
 * Extracts:
 *
 *   { foo: string, bar: string }
 */
type ExtractParamsBasic<P extends Pattern> = Pipe<
  P, // ....................................... 'GET /foo/<bar>/<qux>/baz'
  [
    Strings.TrimLeft<`${Method} `>, // ........ '/foo/<bar>/<qux>/baz'
    Strings.Split<"/">, // .................... ['', 'foo', '<bar>', '<qux>', 'baz']
    Tuples.Filter<Strings.StartsWith<"<">>, //  ['<bar>', '<qux>']
    Tuples.Map<
      ComposeLeft<
        [
          Strings.Trim<"<" | ">">, // ......... ['bar', 'qux']
          Unions.ToTuple, // .................. [['bar'], ['qux']]
          Tuples.Append<string>, // ........... [['bar', string], ['qux', string]]
        ]
      >
    >,
    Tuples.ToUnion, // ........................ ['bar', string] | ['qux', string]
    Objects.FromEntries, // ................... { bar: string; qux: string }
  ]
>;

/**
 * For:
 *
 *   {
 *     a: () => number,
 *     b: () => 'hi',
 *     c: () => boolean,
 *   }
 *
 * Will return:
 *
 *   {
 *     a: number,
 *     b: 'hi',
 *     c: boolean,
 *   }
 *
 */
export type MapReturnTypes<T> = Pipe<
  T,
  [Objects.MapValues<Functions.ReturnType>]
>;

// export type WithDefaults<A, B> = Pipe<>;

/**
 * From a pattern like:
 *
 *   'GET /foo/<bar>/<n>/baz'
 *
 * Extracts:
 *
 *   { foo: string, n: number }
 */
export type ExtractParams<
  P extends Pattern,
  TParamTypes extends Record<string, unknown>,
  E = ExtractParamsBasic<P>,
> = Resolve<
  Pick<Omit<E, keyof TParamTypes> & TParamTypes, Extract<keyof E, string>>
>;

const ALL: Method[] = ["GET", "POST", "PATCH", "PUT", "DELETE"];

export interface Matcher {
  matchMethod(req: { method?: string }): boolean;
  matchURL(url: URL): Record<string, string> | null;
}

function makeMatcher(method: Method, regex: RegExp): Matcher {
  return {
    matchMethod(req: Request): boolean {
      return method === req.method;
    },
    matchURL(url: URL) {
      const matches = url.pathname.match(regex);
      if (matches === null) {
        return null;
      }
      return matches.groups ?? {};
    },
  };
}

function segmentAsVariable(s: string): string | null {
  if (s.startsWith("<") && s.endsWith(">")) {
    const identifier = s.slice(1, -1);
    return identifierRe.test(identifier) ? identifier : null;
  }
  return null;
}

export function splitMethodAndPattern(
  pattern: string
): [method: Method, pattern: string] {
  for (const method of ALL) {
    if (pattern.startsWith(method)) {
      return [method, pattern.slice(method.length).trimStart()];
    }
  }
  throw new Error(
    `Invalid route pattern: ${JSON.stringify(pattern)}${
      pattern.startsWith("/")
        ? `. Did you mean ${JSON.stringify(`GET ${pattern}`)}?`
        : ""
    }`
  );
}

export function pathMatcher(input: string): Matcher {
  const [method, pattern] = splitMethodAndPattern(input);

  if (pattern === "/") {
    return makeMatcher(method, /^\/$/);
  }

  if (!pattern.startsWith("/")) {
    throw new Error(
      `Route must start with '/', but got ${JSON.stringify(pattern)}`
    );
  }

  if (pattern.endsWith("/")) {
    throw new Error(
      `Route may not end with '/', but got ${JSON.stringify(pattern)}`
    );
  }

  const segments = pattern.slice(1).split("/");

  let index = 1;
  const regexString: string[] = [];
  for (const segment of segments) {
    const placeholder = segmentAsVariable(segment);
    if (placeholder !== null) {
      regexString.push(`(?<${placeholder}>[^/]+)`);
    } else if (cleanSegmentRe.test(segment)) {
      regexString.push(segment);
    } else {
      return raise(`Invalid pattern: ${pattern} (error at position ${index + 1})`); // prettier-ignore
    }

    index += segment.length + 1;
  }

  return makeMatcher(method, new RegExp("^/" + regexString.join("/") + "/?$"));
}
