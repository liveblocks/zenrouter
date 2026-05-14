export function getBaseUrl(): URL {
  const explicit = process.env.BASE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      // Fall through to Vercel fallbacks below. Vercel project settings can
      // contain unresolved references like "$NEXT_PUBLIC_VERCEL_URL" that
      // arrive here as literal strings.
    }
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) {
    return new URL(`https://${vercelHost}`);
  }

  throw new Error(
    "BASE_URL is not set and no Vercel deployment URL is available"
  );
}
