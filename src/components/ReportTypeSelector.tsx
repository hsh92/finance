"use client";

import { REPORT_OPTIONS, type ReportCode } from "@/types";

interface ReportTypeSelectorProps {
  value: ReportCode;
  onChange: (code: ReportCode) => void;
}

export default function ReportTypeSelector({
  value,
  onChange,
}: ReportTypeSelectorProps) {
  return (
    <div>
      <label
        htmlFor="reprt-code"
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        보고서 유형
      </label>
      <select
        id="reprt-code"
        value={value}
        onChange={(e) => onChange(e.target.value as ReportCode)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        {REPORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
