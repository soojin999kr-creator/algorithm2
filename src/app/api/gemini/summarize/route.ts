import { NextRequest, NextResponse } from 'next/server';
import { summarizeMeetingWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '회의록 또는 대화 텍스트를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await summarizeMeetingWithGemini(text);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    return NextResponse.json(
      { error: error.message || '회의록 요약 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

