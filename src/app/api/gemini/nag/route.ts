import { NextRequest, NextResponse } from 'next/server';
import { generateNaggingMessage } from '@/lib/gemini';
import { NaggingPersona, NaggingIntensity } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskTitle, assignee, dueDate, persona, intensity } = body;

    if (!taskTitle) {
      return NextResponse.json(
        { error: '할 일 제목이 필요합니다.' },
        { status: 400 }
      );
    }

    const message = await generateNaggingMessage({
      taskTitle: taskTitle || '할 일',
      assignee: assignee || '팀원',
      dueDate: dueDate || '오늘 중',
      persona: (persona || 'fact') as NaggingPersona,
      intensity: (intensity || 'standard') as NaggingIntensity,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error in /api/gemini/nag:', error);
    return NextResponse.json(
      { error: error.message || '잔소리 메시지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

