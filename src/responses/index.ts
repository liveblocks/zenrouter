import type { JsonObject } from "@liveblocks/core";

import type { HeadersInit } from "./compat.js";
import { HttpError, ValidationError } from "./HttpError.js";

/**
 * Returns an empty HTTP 204 response.
 */
export function empty(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Return a JSON response.
 */
export function json(
  value: JsonObject,
  status = 200,
  headers?: HeadersInit
): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * Throws an HttpError for the given status code. Use this construct to
 * terminate the handling of a route, and return an HTTP error to the user.
 *
 * What response will get returned will be determined by what error handler is
 * configured for this status code in the router.
 */
export function abort(status: number, headers?: HeadersInit): never {
  throw new HttpError(status, undefined, headers);
}

export { HttpError, ValidationError };
