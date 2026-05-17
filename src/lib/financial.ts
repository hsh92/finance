import type { ChartDataPoint, FinancialAccountItem } from "@/types";
import { parseAmount } from "./format";

const BS_ACCOUNTS = ["자산총계", "부채총계", "자본총계"];
const IS_ACCOUNTS = ["매출액", "영업이익", "당기순이익(손실)"];

function filterAccounts(
  list: FinancialAccountItem[],
  sjDiv: "BS" | "IS",
  accountNames: string[],
  fsDiv: "CFS" | "OFS" = "CFS"
): FinancialAccountItem[] {
  return list.filter(
    (item) =>
      item.sj_div === sjDiv &&
      item.fs_div === fsDiv &&
      accountNames.includes(item.account_nm)
  );
}

function toChartPoint(item: FinancialAccountItem): ChartDataPoint {
  const point: ChartDataPoint = {
    name: item.account_nm,
    당기: parseAmount(item.thstrm_amount),
    전기: parseAmount(item.frmtrm_amount),
  };
  if (item.bfefrmtrm_amount) {
    point.전전기 = parseAmount(item.bfefrmtrm_amount);
  }
  return point;
}

export function buildBalanceSheetData(
  list: FinancialAccountItem[],
  fsDiv: "CFS" | "OFS" = "CFS"
): ChartDataPoint[] {
  const items = filterAccounts(list, "BS", BS_ACCOUNTS, fsDiv);
  const ordered = BS_ACCOUNTS.map((name) =>
    items.find((i) => i.account_nm === name)
  ).filter(Boolean) as FinancialAccountItem[];
  return ordered.map(toChartPoint);
}

export function buildIncomeStatementData(
  list: FinancialAccountItem[],
  fsDiv: "CFS" | "OFS" = "CFS"
): ChartDataPoint[] {
  const items = filterAccounts(list, "IS", IS_ACCOUNTS, fsDiv);
  const ordered = IS_ACCOUNTS.map((name) =>
    items.find((i) => i.account_nm === name)
  ).filter(Boolean) as FinancialAccountItem[];
  return ordered.map(toChartPoint);
}

export function buildProfitabilityData(
  list: FinancialAccountItem[],
  fsDiv: "CFS" | "OFS" = "CFS"
): { name: string; 영업이익률: number; 순이익률: number }[] {
  const revenue = filterAccounts(list, "IS", ["매출액"], fsDiv)[0];
  const operating = filterAccounts(list, "IS", ["영업이익"], fsDiv)[0];
  const net = filterAccounts(list, "IS", ["당기순이익(손실)"], fsDiv)[0];

  if (!revenue) return [];

  const periods: { label: string; rev: number; op: number; net: number }[] = [
    {
      label: "당기",
      rev: parseAmount(revenue.thstrm_amount),
      op: parseAmount(operating?.thstrm_amount),
      net: parseAmount(net?.thstrm_amount),
    },
    {
      label: "전기",
      rev: parseAmount(revenue.frmtrm_amount),
      op: parseAmount(operating?.frmtrm_amount),
      net: parseAmount(net?.frmtrm_amount),
    },
  ];

  if (revenue.bfefrmtrm_amount) {
    periods.push({
      label: "전전기",
      rev: parseAmount(revenue.bfefrmtrm_amount),
      op: parseAmount(operating?.bfefrmtrm_amount),
      net: parseAmount(net?.bfefrmtrm_amount),
    });
  }

  return periods.map((p) => ({
    name: p.label,
    영업이익률: p.rev ? Math.round((p.op / p.rev) * 1000) / 10 : 0,
    순이익률: p.rev ? Math.round((p.net / p.rev) * 1000) / 10 : 0,
  }));
}

export function summarizeForAI(
  list: FinancialAccountItem[],
  corpName: string,
  bsnsYear: string,
  reprtLabel: string
): string {
  const cfs = list.filter((i) => i.fs_div === "CFS");
  const target = cfs.length > 0 ? cfs : list;

  const bs = buildBalanceSheetData(target, cfs.length ? "CFS" : "OFS");
  const is = buildIncomeStatementData(target, cfs.length ? "CFS" : "OFS");
  const profit = buildProfitabilityData(target, cfs.length ? "CFS" : "OFS");

  const lines: string[] = [
    `회사: ${corpName}`,
    `사업연도: ${bsnsYear}`,
    `보고서: ${reprtLabel}`,
    "",
    "[재무상태표 - 연결/주요]",
    ...bs.map(
      (b) =>
        `${b.name}: 당기 ${b.당기.toLocaleString()}원, 전기 ${b.전기.toLocaleString()}원`
    ),
    "",
    "[손익계산서]",
    ...is.map(
      (b) =>
        `${b.name}: 당기 ${b.당기.toLocaleString()}원, 전기 ${b.전기.toLocaleString()}원`
    ),
    "",
    "[수익성 지표 (%)]",
    ...profit.map(
      (p) => `${p.name}: 영업이익률 ${p.영업이익률}%, 순이익률 ${p.순이익률}%`
    ),
  ];

  return lines.join("\n");
}
