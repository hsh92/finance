"use client";

import Link from "next/link";
import type { CorpCompany } from "@/types";

interface SearchResultsProps {
  results: CorpCompany[];
  query: string;
  isLoading?: boolean;
}

export default function SearchResults({
  results,
  query,
  isLoading = false,
}: SearchResultsProps) {
  if (!query.trim()) {
    return (
      <p className="mt-6 text-center text-slate-500">
        회사명을 입력하면 corp_code를 포함한 검색 결과가 표시됩니다.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="mt-6 text-center text-slate-500">회사 목록을 불러오는 중...</p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="mt-6 text-center text-slate-500">
        &quot;{query}&quot;에 해당하는 회사를 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {results.map((company) => (
        <li key={company.corp_code}>
          <Link
            href={`/company/${company.corp_code}?name=${encodeURIComponent(company.corp_name)}&stock=${company.stock_code}`}
            className="flex flex-col gap-1 px-5 py-4 transition hover:bg-primary-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <span className="text-lg font-semibold text-slate-900">
                {company.corp_name}
              </span>
              {company.stock_code && (
                <span className="ml-2 text-sm text-slate-500">
                  ({company.stock_code})
                </span>
              )}
              <p className="text-sm text-slate-500">{company.corp_eng_name}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-md bg-primary-100 px-2 py-1 font-mono text-primary-800">
                corp_code: {company.corp_code}
              </span>
              <span className="text-primary-600">재무 분석 보기 →</span>
            </div>
          </Link>
        </li>
      ))}
      {results.length >= 50 && (
        <li className="bg-slate-50 px-5 py-3 text-center text-sm text-slate-500">
          상위 50건만 표시됩니다. 검색어를 더 구체적으로 입력해 보세요.
        </li>
      )}
    </ul>
  );
}
