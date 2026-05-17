import { NextRequest, NextResponse } from "next/server";
import { normalizeCorpCode } from "@/lib/corp-code";
import type { FinancialAccountItem, OpenDartResponse } from "@/types";

const OPENDART_URL =
  "https://opendart.fss.or.kr/api/fnlttSinglAcnt.json";

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENDART_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: "CONFIG_ERROR",
        message:
          "OpenDart API 키가 설정되지 않았습니다. 환경변수 OPENDART_API_KEY를 확인하세요.",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const corpCodeRaw = searchParams.get("corp_code");
  const bsns_year = searchParams.get("bsns_year");
  const reprt_code = searchParams.get("reprt_code");

  if (!corpCodeRaw || !bsns_year || !reprt_code) {
    return NextResponse.json(
      {
        status: "100",
        message: "corp_code, bsns_year, reprt_code는 필수입니다.",
      },
      { status: 400 }
    );
  }

  const corp_code = normalizeCorpCode(corpCodeRaw);

  const url = new URL(OPENDART_URL);
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("corp_code", corp_code);
  url.searchParams.set("bsns_year", bsns_year);
  url.searchParams.set("reprt_code", reprt_code);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "HTTP_ERROR",
          message: `OpenDart API 요청 실패 (${res.status})`,
        },
        { status: 502 }
      );
    }

    const data: OpenDartResponse = await res.json();

    if (data.status === "000" && data.list && !Array.isArray(data.list)) {
      data.list = [data.list as FinancialAccountItem];
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("OpenDart fetch error:", error);
    return NextResponse.json(
      {
        status: "900",
        message: "OpenDart API 호출 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
