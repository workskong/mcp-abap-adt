// Centralized configuration helpers
// Keep minimal and synchronous so it's safe during startup and tests
export function getPort(): number {
  const envVal = process.env.PORT;
  if (envVal !== undefined) {
    const n = Number(envVal);
    if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) return Math.floor(n);
    // PORT was provided but is invalid
    throw new Error(`Invalid PORT environment variable: ${envVal}. PORT must be a positive integer.`);
  }
  // PORT not provided — fail fast with clear message
  throw new Error('PORT environment variable is not set. Please set PORT to a positive integer.');
}

export const DEFAULT_PORT = getPort();