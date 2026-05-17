import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";
import { NextRequest } from "next/server";
import type { AnalyzeRequestBody } from "@/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `당신은 재무 데이터를 비전문가도 이해할 수 있게 설명하는 친절한 재무 분석가입니다.
다음 규칙을 지켜주세요:
- 어려운 회계 용어는 쉬운 말로 풀어 설명합니다.
- 숫자는 억원/조원 단위로 읽기 쉽게 표현합니다.
- 회사의 재무 건전성, 수익성, 성장 추세를 3~4개 문단으로 요약합니다.
- 투자 권유나 매수/매도 추천은 하지 않습니다.
- 마크다운 제목(##) 없이 자연스러운 한국어 문단으로 작성합니다.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Gemini API 키가 설정되지 않았습니다. 환경변수 GEMINI_API_KEY를 확인하세요.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: AnalyzeRequestBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "잘못된 요청 본문입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { corpName, bsnsYear, reprtCode, financialSummary } = body;

  if (!corpName || !financialSummary) {
    return new Response(
      JSON.stringify({ error: "corpName과 financialSummary는 필수입니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  const userPrompt = `${corpName}의 ${bsnsYear}년 ${reprtCode} 보고서 재무 데이터입니다.

${financialSummary}

위 데이터를 바탕으로 일반인이 이해하기 쉽게 재무 상태를 분석해 주세요.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    const streamResult = await model.generateContentStream(userPrompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Gemini stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    if (error instanceof GoogleGenerativeAIError) {
      const message = error.message || "";

      if (message.includes("429") || message.includes("quota")) {
        return new Response(
          JSON.stringify({
            error: "API 할당량 초과",
            details:
              "Gemini API 무료 티어 할당량을 초과했습니다. 잠시 후 다시 시도하거나 Google AI Studio에서 유료 계정으로 업그레이드하세요.",
            retryAfter: 60,
            url: "https://ai.google.dev/pricing",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      if (message.includes("401") || message.includes("unauthenticated")) {
        return new Response(
          JSON.stringify({
            error: "API 키 오류",
            details:
              "Gemini API 키가 유효하지 않습니다. .env.local의 GEMINI_API_KEY를 확인하세요.",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "AI 분석 중 오류가 발생했습니다.";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
