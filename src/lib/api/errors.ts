export type ApiErrorCode =
  | "CONFIG"
  | "NETWORK"
  | "TIMEOUT"
  | "VALIDATION"
  | "UPSTREAM"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly causeDetail?: unknown;

  constructor(
    message: string,
    opts?: { code?: ApiErrorCode; status?: number; cause?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.code = opts?.code ?? "UNKNOWN";
    this.status = opts?.status;
    this.causeDetail = opts?.cause;
  }
}

export type AdapterResult<T> =
  | { ok: true; data: T; meta?: Record<string, string | number | boolean> }
  | { ok: false; error: ApiError };
