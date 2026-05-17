"use client";

interface YearSelectorProps {
  value: string;
  onChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
}

export default function YearSelector({
  value,
  onChange,
  minYear = 2015,
  maxYear = new Date().getFullYear(),
}: YearSelectorProps) {
  const years: string[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(String(y));
  }

  return (
    <div>
      <label
        htmlFor="bsns-year"
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        사업연도
      </label>
      <select
        id="bsns-year"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </select>
    </div>
  );
}
