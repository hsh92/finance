"use client";

import { useCallback, useState } from "react";

interface AIAnalysisProps {
  corpName: string;
  bsnsYear: string;
  reprtLabel: string;
  financialSummary: string;
  disabled?: boolean;
}

export default function AIAnalysis({
  corpName,
  bsnsYear,
  reprtLabel,
  financialSummary,
  disabled = false,
}: AIAnalysisProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!financialSummary.trim()) {
      setError("분석할 재무 데이터가 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setContent("");
    setHasRun(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corpName,
          bsnsYear,
          reprtCode: reprtLabel,
          financialSummary,
        }),
      });

      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        setError(
          (errData as { details?: string }).details ||
            "Gemini API 할당량을 초과했습니다. 잠시 후 다시 시도해 주세요."
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error ||
            `분석 요청 실패 (${res.status})`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("스트리밍 응답을 받을 수 없습니다.");
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setContent(accumulated);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "AI 분석 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [corpName, bsnsYear, reprtLabel, financialSummary]);

  return (
    <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-violet-900">
            AI 재무 분석
          </h3>
          <p className="mt-1 text-sm text-violet-700">
            Gemini가 재무 데이터를 쉬운 말로 설명해 드립니다.
          </p>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={disabled || isLoading || !financialSummary}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "분석 중..." : hasRun ? "다시 분석" : "AI 분석 시작"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-900">{error}</p>
          {error.includes("할당량") && (
            <p className="mt-2 text-xs text-red-800">
              Gemini API 무료 계정의 일일 할당량을 초과했습니다.
              <br />
              <a
                href="https://ai.google.dev/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-700"
              >
                유료 계정으로 업그레이드하거나
              </a>
              <span> 내일 다시 시도해 주세요.</span>
            </p>
          )}
        </div>
      )}

      {(content || isLoading) && (
        <div className="mt-4 rounded-lg border border-violet-100 bg-white p-5">
          {isLoading && !content && (
            <p className="animate-pulse text-slate-500">AI가 분석하고 있습니다...</p>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {content}
            {isLoading && content && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-500" />
            )}
          </div>
        </div>
      )}

      {!hasRun && !error && (
        <p className="mt-4 text-sm text-slate-500">
          재무 데이터를 불러온 뒤 &quot;AI 분석 시작&quot;을 눌러 주세요.
        </p>
      )}
    </section>
  );
}
