/** OpenDart 고유번호 8자리 (앞자리 0 포함) */
export function normalizeCorpCode(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.padStart(8, "0").slice(-8);
}

/** 종목코드 6자리 (앞자리 0 포함) */
export function normalizeStockCode(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.padStart(6, "0").slice(-6);
}
