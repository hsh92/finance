/** 콤마 포함 금액 문자열을 숫자로 변환 */
export function parseAmount(value: string | undefined | null): number {
  if (!value || value === "-" || value.trim() === "") return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

/** 원 단위 금액을 읽기 쉬운 문자열로 (억/조) */
export function formatKoreanAmount(amount: number): string {
  if (amount === 0) return "0원";
  const abs = Math.abs(amount);
  if (abs >= 1_0000_0000_0000) {
    return `${(amount / 1_0000_0000_0000).toFixed(2)}조원`;
  }
  if (abs >= 1_0000_0000) {
    return `${(amount / 1_0000_0000).toFixed(0)}억원`;
  }
  if (abs >= 1_0000) {
    return `${(amount / 1_0000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 차트용 단위: 조원 */
export function toTrillionWon(amount: number): number {
  return Math.round((amount / 1_0000_0000_0000) * 100) / 100;
}

/** 차트용 단위: 억원 */
export function toHundredMillionWon(amount: number): number {
  return Math.round(amount / 1_0000_0000);
}

export function pickChartUnit(maxValue: number): "조" | "억" {
  return maxValue >= 1_0000_0000_0000 ? "조" : "억";
}

export function convertForChart(amount: number, unit: "조" | "억"): number {
  return unit === "조" ? toTrillionWon(amount) : toHundredMillionWon(amount);
}
