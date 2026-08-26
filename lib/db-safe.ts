export class DatabaseUnavailableError extends Error {
  constructor(label: string, cause: unknown) {
    super(`Database query failed: ${label}`);
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

function log(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[db] ${label} failed: ${message}`);
  if (error instanceof Error && error.stack) console.error(error.stack);
}

/**
 * For any query whose absence would misinform the reader. On failure this
 * THROWS rather than returning empty, so Next.js does not cache a broken
 * render and the route error boundary can say what actually happened.
 */
export async function safeQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    log(label, error);
    throw new DatabaseUnavailableError(label, error);
  }
}

/**
 * For decorative surfaces only — a sidebar rail, a trending list. An empty
 * fallback here degrades the page without misinforming anyone.
 */
export async function optionalQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    log(label, error);
    return fallback;
  }
}
