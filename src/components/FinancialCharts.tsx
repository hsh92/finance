"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint, FinancialAccountItem } from "@/types";
import {
  buildBalanceSheetData,
  buildIncomeStatementData,
  buildProfitabilityData,
} from "@/lib/financial";
import { convertForChart, pickChartUnit } from "@/lib/format";

interface FinancialChartsProps {
  list: FinancialAccountItem[];
}

function toChartRows(data: ChartDataPoint[], unit: "조" | "억") {
  return data.map((d) => ({
    name: d.name,
    당기: convertForChart(d.당기, unit),
    전기: convertForChart(d.전기, unit),
    ...(d.전전기 !== undefined
      ? { 전전기: convertForChart(d.전전기, unit) }
      : {}),
  }));
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-4 h-80">{children}</div>
    </section>
  );
}

export default function FinancialCharts({ list }: FinancialChartsProps) {
  const hasCfs = list.some((i) => i.fs_div === "CFS");
  const fsDiv = hasCfs ? "CFS" : "OFS";
  const fsLabel = hasCfs ? "연결재무제표" : "재무제표";

  const bsData = buildBalanceSheetData(list, fsDiv);
  const isData = buildIncomeStatementData(list, fsDiv);
  const profitData = buildProfitabilityData(list, fsDiv);

  const allAmounts = [...bsData, ...isData].flatMap((d) => [
    d.당기,
    d.전기,
    d.전전기 ?? 0,
  ]);
  const maxVal = Math.max(...allAmounts, 0);
  const unit = pickChartUnit(maxVal);
  const unitLabel = unit === "조" ? "조원" : "억원";

  const bsChart = toChartRows(bsData, unit);
  const isChart = toChartRows(isData, unit);

  const barColors = {
    당기: "#2563eb",
    전기: "#94a3b8",
    전전기: "#cbd5e1",
  };

  if (bsData.length === 0 && isData.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        시각화할 재무 데이터가 없습니다. 다른 연도나 보고서 유형을 선택해 보세요.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        기준: {fsLabel} · 금액 단위: {unitLabel}
      </p>

      {bsChart.length > 0 && (
        <ChartCard title="재무상태표" subtitle="자산 · 부채 · 자본 비교">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bsChart} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit={unit} />
              <Tooltip
                formatter={(value: number) => [`${value} ${unitLabel}`, ""]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend />
              <Bar dataKey="당기" fill={barColors.당기} name="당기" radius={[4, 4, 0, 0]} />
              <Bar dataKey="전기" fill={barColors.전기} name="전기" radius={[4, 4, 0, 0]} />
              {bsChart[0] && "전전기" in bsChart[0] && (
                <Bar
                  dataKey="전전기"
                  fill={barColors.전전기}
                  name="전전기"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {isChart.length > 0 && (
        <ChartCard title="손익계산서" subtitle="매출 · 영업이익 · 순이익 비교">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={isChart} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} unit={unit} />
              <Tooltip
                formatter={(value: number) => [`${value} ${unitLabel}`, ""]}
              />
              <Legend />
              <Bar dataKey="당기" fill="#059669" name="당기" radius={[4, 4, 0, 0]} />
              <Bar dataKey="전기" fill="#6ee7b7" name="전기" radius={[4, 4, 0, 0]} />
              {isChart[0] && "전전기" in isChart[0] && (
                <Bar dataKey="전전기" fill="#a7f3d0" name="전전기" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {profitData.length > 0 && (
        <ChartCard title="수익성 지표" subtitle="매출 대비 이익률 (%)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis unit="%" domain={[0, "auto"]} />
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="영업이익률"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="순이익률"
                stroke="#db2777"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
