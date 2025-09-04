// Centralized configuration helpers
// Keep minimal and synchronous so it's safe during startup and tests
export function getPort(): number {
  const envVal = process.env.PORT;
  if (envVal !== undefined) {
    const n = Number(envVal);
    if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return 6969;
}

export const DEFAULT_PORT = getPort();
