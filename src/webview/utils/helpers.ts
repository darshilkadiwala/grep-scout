export type AnyRecord = Record<string, unknown>;

export function isObject(value: unknown): value is AnyRecord {
  return !!value && typeof value === 'object';
}

export function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isObject(value)) return false;
  return Object.values(value).every((entry) => typeof entry === 'string');
}
