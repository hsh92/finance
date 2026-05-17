import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const xmlPath = join(rootDir, "corp.xml");
const outputPath = join(rootDir, "public", "corp_data.json");

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === "list",
  // 숫자로 보이는 corp_code(00126380), stock_code(005930)의 앞자리 0 유지
  parseTagValue: false,
});

function padCorpCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.padStart(8, "0").slice(-8);
}

function padStockCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.padStart(6, "0").slice(-6);
}

console.log("Parsing corp.xml...");
const xmlContent = readFileSync(xmlPath, "utf-8");
const parsed = parser.parse(xmlContent);

const list = parsed?.result?.list ?? [];
const companies = list.map((item) => ({
  corp_code: padCorpCode(item.corp_code),
  corp_name: String(item.corp_name ?? "").trim(),
  corp_eng_name: String(item.corp_eng_name ?? "").trim(),
  stock_code: padStockCode(item.stock_code),
  modify_date: String(item.modify_date ?? "").trim(),
}));

const publicDir = join(rootDir, "public");
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

writeFileSync(outputPath, JSON.stringify(companies), "utf-8");
console.log(`Generated ${companies.length} companies -> public/corp_data.json`);
