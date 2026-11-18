import { NextRequest, NextResponse } from 'next/server';
import { answerPortfolioQuestion } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    const reply = await answerPortfolioQuestion(message, history || []);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return NextResponse.json(
      { error: error.message || '챗봇 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

