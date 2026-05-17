# 재무 데이터 시각화 분석 서비스

누구나 쉽게 이해할 수 있는 재무 데이터 시각화 및 AI 분석 서비스입니다. OpenDart 공시 데이터와 Google Gemini API를 활용하여 회사의 재무 상태를 직관적인 차트와 인공지능 분석으로 제공합니다.

## 주요 기능

### 1. 회사 검색
- 3,800개 이상의 공시 대상 회사 검색
- 회사명, 종목코드, corp_code 기반 실시간 필터링
- 검색 결과에서 corp_code 확인 가능

### 2. 재무 데이터 시각화
- **OpenDart API** 연동으로 실제 공시 데이터 조회
- 사업연도 및 보고서 유형(사업·반기·분기) 선택 가능
- 연결재무제표 또는 주요계정 기준 선택 지원

#### 제공 차트
- **재무상태표**: 자산·부채·자본 구성 비교 (당기/전기/전전기)
- **손익계산서**: 매출액·영업이익·순이익 추이
- **수익성 지표**: 영업이익률·순이익률 라인 차트
- 금액 단위 자동 변환 (억원/조원)

### 3. AI 재무 분석
- **Google Gemini API**를 통한 자동 분석
- 비전문가도 이해할 수 있는 쉬운 언어로 설명
- 실시간 스트리밍 응답 (타이핑 효과)
- 할당량 초과 시 친절한 안내 메시지

## 기술 스택

| 계층 | 기술 |
|------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **스타일링** | Tailwind CSS |
| **차트** | Recharts |
| **데이터 파싱** | fast-xml-parser |
| **API 프록시** | Next.js API Routes |
| **AI** | Google Gemini API |
| **배포** | Vercel (권장) |

## 프로젝트 구조

```
finance/
├── README.md                      # 프로젝트 문서
├── package.json                   # npm 의존성
├── tsconfig.json                  # TypeScript 설정
├── tailwind.config.ts             # Tailwind 설정
├── next.config.mjs                # Next.js 설정
├── .env.example                   # API 키 템플릿
├── .env.local                     # API 키 (git 제외)
├── .gitignore                     # git 제외 파일
│
├── public/
│   └── corp_data.json             # 회사 목록 (XML → JSON 변환)
│
├── scripts/
│   └── parse-corp-xml.mjs         # XML 파싱 스크립트
│
└── src/
    ├── app/
    │   ├── layout.tsx             # 루트 레이아웃 (헤더)
    │   ├── page.tsx               # 메인 검색 페이지
    │   ├── globals.css            # 전역 스타일
    │   │
    │   ├── company/
    │   │   └── [corpCode]/
    │   │       └── page.tsx       # 재무 분석 페이지
    │   │
    │   └── api/
    │       ├── financial/
    │       │   └── route.ts       # OpenDart API 프록시
    │       └── analyze/
    │           └── route.ts       # Gemini API 프록시
    │
    ├── components/
    │   ├── SearchBar.tsx          # 회사명 검색 입력
    │   ├── SearchResults.tsx      # 검색 결과 목록
    │   ├── YearSelector.tsx       # 사업연도 선택
    │   ├── ReportTypeSelector.tsx # 보고서 유형 선택
    │   ├── FinancialCharts.tsx    # 재무 차트 표시
    │   └── AIAnalysis.tsx         # AI 분석 섹션
    │
    ├── lib/
    │   ├── format.ts              # 금액 포맷팅 유틸
    │   ├── financial.ts           # 재무 데이터 처리
    │   └── corp-code.ts           # corp_code 정규화
    │
    └── types/
        └── index.ts               # TypeScript 타입 정의
```

## 설치 및 실행

### 1. 프로젝트 설치

```bash
cd finance
npm install
```

### 2. API 키 설정

`.env.example`을 참고하여 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일에 API 키 입력:
```
OPENDART_API_KEY=your_opendart_key_here
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### 3. 회사 데이터 파싱

```bash
npm run parse-corp
```

`corp.xml`을 `public/corp_data.json`으로 변환합니다. (1회만 필요)

### 4. 개발 서버 시작

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## API 및 외부 서비스

### OpenDart API
- **문서**: https://opendart.fss.or.kr/guide/main.do
- **엔드포인트**: `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json`
- **인증**: API 키 (40자리)
- **기능**: 단일회사 주요계정 조회

### Google Gemini API
- **문서**: https://ai.google.dev/gemini-api
- **모델**: `gemini-2.0-flash` 또는 `gemini-2.5-flash`
- **기능**: 재무 데이터 분석 및 설명
- **할당량**: 무료 티어 제한 있음 (유료 업그레이드 가능)

## 사용 방법

### 1. 메인 페이지에서 회사 검색

```
"삼성전자" 또는 "005930" 또는 "00126380" 입력
↓
검색 결과에서 회사 선택
```

### 2. 재무 데이터 조회

```
연도: 2024
보고서: 사업보고서
↓
"재무 데이터 조회" 버튼 클릭
↓
차트 표시 (자동로드)
```

### 3. AI 분석 (선택)

```
"AI 분석 시작" 버튼 클릭
↓
Gemini가 재무 데이터 분석
↓
분석 결과 표시 (스트리밍)
```

## 보안

### API 키 관리
- `.env.local` 파일에만 저장
- `.gitignore`에 `.env.local` 추가되어 있음 (Git 커밋 제외)
- 클라이언트에 노출 안 됨

### 서버사이드 처리
- 모든 API 호출은 Next.js API Routes에서 처리
- 클라이언트는 프록시 엔드포인트(`/api/financial`, `/api/analyze`)만 호출
- API 키는 서버에서만 사용

## Vercel 배포

### 1. GitHub에 푸시

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel에서 프로젝트 Import

- Vercel 대시보드에서 GitHub 저장소 연결

### 3. 환경 변수 설정

Vercel 프로젝트 설정 → Environment Variables:
- `OPENDART_API_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (선택)

### 4. 자동 배포

main 브랜치에 푸시하면 Vercel이 자동으로:
1. `npm run prebuild` 실행 (corp_data.json 생성)
2. 전체 애플리케이션 빌드 및 배포

## 주요 파일 설명

### `scripts/parse-corp-xml.mjs`
- `corp.xml` (27,000줄)을 `corp_data.json` (3,864개 회사)으로 변환
- 앞자리 0 포함 (corp_code: 8자리, stock_code: 6자리)

### `src/app/api/financial/route.ts`
- OpenDart API 프록시
- 요청한 corp_code 정규화 (8자리 패딩)
- 응답 정규화 (단일 객체 → 배열)
- 캐싱: 1시간

### `src/app/api/analyze/route.ts`
- Gemini API 프록시
- 스트리밍 응답 지원
- 오류 처리 (429 할당량, 401 인증 등)

### `src/lib/financial.ts`
- 재무 데이터 필터링 및 정렬
- 차트 데이터 구성
- AI 분석용 요약 생성

## 오류 해결

### "조회된 데이터가 없습니다 (013)"
**원인**: corp_code가 8자리 형식 아님 (예: `126380` 대신 `00126380` 필요)
**해결**: 최신 `corp_data.json` 사용 (`npm run parse-corp` 실행)

### "API 할당량 초과 (429)"
**원인**: Gemini 무료 티어 일일/분당 할당량 초과
**해결**: 
- 내일까지 기다리기 (일일 할당량은 자정에 리셋)
- Google AI Studio에서 유료 계획 구독

### "API 키가 설정되지 않음 (503)"
**원인**: `.env.local`에 API 키 미설정
**해결**: `.env.local` 파일 생성 후 키 입력

## 라이선스

MIT

## 기여

버그 리포트 및 개선 제안은 언제든지 환영합니다.

## 참고 자료

- [OpenDart 공시정보포털](https://opendart.fss.or.kr/)
- [Google Gemini API 문서](https://ai.google.dev/gemini-api)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Recharts 차트 라이브러리](https://recharts.org/)
