import { type Enum } from "rustie";

export type Result<T, E> = Enum<{ Ok: T; Err: E }>;

export const is_not_null = <T>(item: T | null): item is T => item !== null;

export const small_address = (address: string) =>
  address.slice(0, 8) + "…" + address.slice(-8);

export function from_nano(nano: number | bigint): number {
  if (typeof nano === "bigint") return Number(nano / 1_000_000_000n);
  else return nano / 1_000_000_000;
}

export function format_token(nano: number | bigint): string {
  const amount = from_nano(nano);
  return amount.toFixed(2);
}

export function bigint_division(a: bigint, b: bigint, precision = 8n): number {
  if (b == 0n) return NaN;
  const base = 10n ** precision;
  const base_num = Number(base);
  return Number((a * base) / b) / base_num;
}
