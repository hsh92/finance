"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import YearSelector from "@/components/YearSelector";
import ReportTypeSelector from "@/components/ReportTypeSelector";
import FinancialCharts from "@/components/FinancialCharts";
import AIAnalysis from "@/components/AIAnalysis";
import {
  REPORT_OPTIONS,
  type FinancialAccountItem,
  type OpenDartResponse,
  type ReportCode,
} from "@/types";
import { normalizeCorpCode } from "@/lib/corp-code";
import { summarizeForAI } from "@/lib/financial";

interface CompanyPageProps {
  params: { corpCode: string };
}

const OPENDART_MESSAGES: Record<string, string> = {
  "000": "정상",
  "010": "등록되지 않은 키입니다.",
  "011": "사용할 수 없는 키입니다.",
  "012": "접근할 수 없는 IP입니다.",
  "013": "조회된 데이터가 없습니다.",
  "014": "파일이 존재하지 않습니다.",
  "020": "요청 제한을 초과하였습니다.",
  "021": "조회 가능한 회사 개수가 초과하였습니다.",
  "100": "필드의 부적절한 값입니다.",
  "101": "부적절한 접근입니다.",
  "800": "시스템 점검 중입니다.",
  "900": "정의되지 않은 오류가 발생하였습니다.",
  CONFIG_ERROR: "API 키가 설정되지 않았습니다.",
};

function CompanyPageContent({ corpCode: corpCodeParam }: { corpCode: string }) {
  const corpCode = normalizeCorpCode(corpCodeParam);
  const searchParams = useSearchParams();
  const corpName = searchParams.get("name") ?? "선택한 회사";
  const stockCode = searchParams.get("stock") ?? "";

  const [bsnsYear, setBsnsYear] = useState(String(new Date().getFullYear() - 1));
  const [reprtCode, setReprtCode] = useState<ReportCode>("11011");
  const [list, setList] = useState<FinancialAccountItem[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const reprtLabel =
    REPORT_OPTIONS.find((r) => r.value === reprtCode)?.label ?? reprtCode;

  const fetchFinancial = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setStatus(null);
    setMessage(null);
    setList([]);

    try {
      const qs = new URLSearchParams({
        corp_code: corpCode,
        bsns_year: bsnsYear,
        reprt_code: reprtCode,
      });

      const res = await fetch(`/api/financial?${qs.toString()}`);
      const data: OpenDartResponse & { status?: string; message?: string } =
        await res.json();

      setStatus(data.status ?? null);
      setMessage(data.message ?? null);

      if (data.status === "000" && data.list) {
        setList(data.list);
      } else if (data.status !== "000") {
        const desc =
          OPENDART_MESSAGES[data.status ?? ""] ?? data.message ?? "조회 실패";
        setFetchError(desc);
      }
    } catch (err) {
      setFetchError(
        err instanceof Error
          ? err.message
          : "재무 데이터를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [corpCode, bsnsYear, reprtCode]);

  useEffect(() => {
    fetchFinancial();
  }, [fetchFinancial]);

  const financialSummary = useMemo(() => {
    if (list.length === 0) return "";
    return summarizeForAI(list, corpName, bsnsYear, reprtLabel);
  }, [list, corpName, bsnsYear, reprtLabel]);

  const rceptNo = list[0]?.rcept_no;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          ← 검색으로 돌아가기
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{corpName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          corp_code: <span className="font-mono">{corpCode}</span>
          {stockCode && (
            <>
              {" "}
              · 종목코드: <span className="font-mono">{stockCode}</span>
            </>
          )}
        </p>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <YearSelector value={bsnsYear} onChange={setBsnsYear} />
        <ReportTypeSelector value={reprtCode} onChange={setReprtCode} />
        <div className="flex items-end">
          <button
            type="button"
            onClick={fetchFinancial}
            disabled={isLoading}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? "불러오는 중..." : "재무 데이터 조회"}
          </button>
        </div>
      </section>

      {isLoading && (
        <p className="text-center text-slate-500">
          OpenDart에서 데이터를 가져오는 중...
        </p>
      )}

      {fetchError && !isLoading && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
          {fetchError}
          {status && status !== "000" && (
            <span className="mt-1 block text-sm">
              (코드: {status}
              {message ? ` — ${message}` : ""})
            </span>
          )}
        </p>
      )}

      {!isLoading && list.length > 0 && (
        <>
          {rceptNo && (
            <p className="text-sm text-slate-500">
              공시 원문:{" "}
              <a
                href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline"
              >
                DART 공시뷰어 열기
              </a>
            </p>
          )}

          <FinancialCharts list={list} />

          <AIAnalysis
            corpName={corpName}
            bsnsYear={bsnsYear}
            reprtLabel={reprtLabel}
            financialSummary={financialSummary}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
}

export default function CompanyPage({ params }: CompanyPageProps) {
  return (
    <Suspense
      fallback={
        <p className="text-center text-slate-500">페이지를 불러오는 중...</p>
      }
    >
      <CompanyPageContent corpCode={params.corpCode} />
    </Suspense>
  );
}
