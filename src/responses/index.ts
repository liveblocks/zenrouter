import type { JsonObject } from "@liveblocks/core";

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
export function json(value: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    // TODO: Allow passing ResponseInit options, like extra response headers?
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * Throws an HttpError for the given status code. Use this construct to
 * terminate the handling of a route, and return an HTTP error to the user.
 *
 * What response will get returned will be determined by what error handler is
 * configured for this status code in the router.
 */
export function abort(status: number): never {
  throw new HttpError(status);
}

export { HttpError, ValidationError };
