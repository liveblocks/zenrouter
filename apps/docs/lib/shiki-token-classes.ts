import type { ShikiTransformer } from "shiki";

/** Adds tk-* classes to token spans from TextMate scope (e.g. tk-variable, tk-string). Needs includeExplanation: "scopeName". */
export function shikiTokenClassTransformer(): ShikiTransformer {
  return {
    name: "shiki-token-class",
    span(hast, _line, _col, _lineElement, token) {
      const explanation = token.explanation;
      if (!explanation?.[0]?.scopes?.length) return;

      const scopes = explanation[0].scopes;
      const mostSpecific = scopes[scopes.length - 1];
      const scopeName = mostSpecific?.scopeName ?? "";
      const firstSegment = scopeName.split(".")[0];
      if (!firstSegment) return;

      const existing = hast.properties?.className;
      const classes = Array.isArray(existing)
        ? [...existing]
        : typeof existing === "string"
          ? existing.split(/\s+/).filter(Boolean)
          : [];
      const tokenClass = `tk-${firstSegment}`;
      if (!classes.includes(tokenClass)) {
        classes.push(tokenClass);
      }
      hast.properties = hast.properties ?? {};
      hast.properties.className = classes;
      return hast;
    },
  };
}
