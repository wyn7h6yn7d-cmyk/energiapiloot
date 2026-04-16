import { getApiEnv } from "@/lib/api/env";
import { ApiError } from "@/lib/api/errors";

export type FetchJsonOpts = {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & FetchJsonOpts = {}
): Promise<T> {
  const env = getApiEnv();
  const timeoutMs = init.timeoutMs ?? env.HTTP_TIMEOUT_MS;
  const retries = init.retries ?? env.HTTP_MAX_RETRIES;
  const { timeoutMs: _t, retries: _r, ...reqInit } = init;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...reqInit,
        signal: ctrl.signal,
        headers: {
          Accept: "application/json",
          ...reqInit.headers,
        },
      });
      clearTimeout(t);
      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status} for ${url}`, {
          code: res.status === 401 ? "UNAUTHORIZED" : "UPSTREAM",
          status: res.status,
        });
      }
      return (await res.json()) as T;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < retries) {
        await sleep(200 * Math.pow(2, attempt));
        continue;
      }
    }
  }
  if (lastErr instanceof ApiError) throw lastErr;
  throw new ApiError(lastErr instanceof Error ? lastErr.message : "Network error", {
    code: "NETWORK",
    cause: lastErr,
  });
}
