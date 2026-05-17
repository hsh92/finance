# 재무 데이터 시각화 분석

OpenDart 공시 데이터를 검색·조회하고, 차트로 보여 준 뒤 Gemini로 쉬운 설명을 제공하는 웹 애플리케이션입니다.

## 기능

- **회사 검색**: `corp.xml`에서 변환한 회사 목록(JSON)을 기준으로 회사명·종목코드·고유번호 검색
- **재무 데이터**: 사업연도·보고서 유형 선택 후 OpenDart 단일회사 주요계정 API 결과 표시
- **시각화**: 재무상태표·손익계산서·수익성 지표(Recharts)
- **AI 요약**: Gemini로 재무 요약 문장 생성(스트리밍)

## 기술 스택

| 영역 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| 차트 | Recharts |
| XML 처리 | fast-xml-parser (빌드 시 `corp_data.json` 생성) |
| 배포 | Vercel |

## 디렉터리 구조

```
finance/
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── .env.example
├── public/
│   └── corp_data.json          # prebuild에서 corp.xml 기준 생성
├── scripts/
│   └── parse-corp-xml.mjs
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── company/[corpCode]/page.tsx
    │   └── api/
    │       ├── financial/route.ts   # OpenDart 프록시
    │       └── analyze/route.ts     # Gemini 프록시
    ├── components/
    │   ├── SearchBar.tsx
    │   ├── SearchResults.tsx
    │   ├── YearSelector.tsx
    │   ├── ReportTypeSelector.tsx
    │   ├── FinancialCharts.tsx
    │   └── AIAnalysis.tsx
    ├── lib/
    │   ├── corp-code.ts
    │   ├── financial.ts
    │   └── format.ts
    └── types/
        └── index.ts
```

## 로컬 실행

```bash
npm install
npm run parse-corp    # corp.xml → public/corp_data.json
cp .env.example .env.local   # Windows: copy .env.example .env.local
# .env.local에 OpenDart/Gemini용 값을 채움
npm run dev
```

브라우저: `http://localhost:3000`

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | `prebuild`로 json 생성 후 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run parse-corp` | 수동으로 `corp_data.json` 재생성 |

## 환경 변수 (로컬 · Vercel)

`.env.example` 참고. 이름은 다음과 같습니다.

- `OPENDART_API_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (선택, 기본값은 앱 설정에 따름)

호스팅(Vercel 등)에서는 프로젝트 설정의 Environment Variables에 동일 이름으로 등록합니다.

## 사용 흐름

1. 메인에서 회사 검색 후 항목 선택
2. 회사 상세에서 연도·보고서 선택 → 데이터 로드
3. 차트 확인 후 필요 시 AI 분석 실행

## OpenDart · Gemini 참고 문서

- [OpenDart 가이드](https://opendart.fss.or.kr/guide/main.do)
- [Gemini API](https://ai.google.dev/gemini-api)
- [Next.js 문서](https://nextjs.org/docs)
- [Recharts](https://recharts.org/)

## 라이선스

MIT
