"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import type { CorpCompany } from "@/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<CorpCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      try {
        const res = await fetch("/corp_data.json");
        if (!res.ok) {
          throw new Error("회사 목록을 불러오지 못했습니다.");
        }
        const data: CorpCompany[] = await res.json();
        if (!cancelled) {
          setCompanies(data);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "회사 데이터 로드 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCompanies();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterCompanies = useCallback(
    (q: string, list: CorpCompany[]): CorpCompany[] => {
      const trimmed = q.trim().toLowerCase();
      if (!trimmed) return [];

      return list
        .filter(
          (c) =>
            c.corp_name.toLowerCase().includes(trimmed) ||
            c.corp_eng_name.toLowerCase().includes(trimmed) ||
            c.stock_code.includes(trimmed) ||
            c.corp_code.includes(trimmed)
        )
        .slice(0, 50);
    },
    []
  );

  const results = useMemo(
    () => filterCompanies(query, companies),
    [query, companies, filterCompanies]
  );

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          재무 데이터 시각화 분석
        </h1>
        <p className="mt-3 text-slate-600">
          회사명으로 검색하고, OpenDart 공시 데이터를 차트와 AI로 쉽게 이해해
          보세요.
        </p>
      </section>

      <SearchBar value={query} onChange={setQuery} />

      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-red-700">
          {loadError}
          <br />
          <span className="text-sm">
            빌드 전{" "}
            <code className="rounded bg-red-100 px-1">npm run parse-corp</code>를
            실행했는지 확인하세요.
          </span>
        </p>
      )}

      {!loadError && (
        <>
          {!isLoading && query.trim() && (
            <p className="text-center text-sm text-slate-500">
              총 {companies.length.toLocaleString()}개 회사 중 {results.length}건
              표시
            </p>
          )}
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
