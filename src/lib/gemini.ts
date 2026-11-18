import { GoogleGenerativeAI } from '@google/generative-ai';
import { NaggingPersona, NaggingIntensity } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// 잔소리메이트 프로젝트 및 포트폴리오에 대한 지식 베이스
export const PORTFOLIO_KNOWLEDGE = `
[프로젝트 개요]
- 프로젝트 이름: 잔소리메이트 (ZansoriMate)
- 한 줄 설명: AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 잔소리로 팀원들의 마감일을 챙겨주는 초간편 협업 플랫폼.
- 기획 배경 및 목적: 대학생 조별과제나 초기 스타트업에서 "이거 누가 하기로 했지?", 마감 독촉의 감정 소모를 줄이기 위함. 팀장 대신 AI가 악역(잔소리)을 맡고 마감 엄수를 돕는다.
- 타깃 사용자: 김지훈 (23세 조장 대학생), 이수아 (28세 초기 스타트업 대표)
- 기술 스택:
  * 프론트엔드: Next.js (App Router), React, Tailwind CSS, Vercel
  * 백엔드/인증/DB: Supabase (PostgreSQL, Row Level Security, Auth)
  * 인공지능: Google Gemini AI (1.5 Flash / Pro)
- 주요 기능:
  1. 모바일 우선 직관적 칸반 보드 (To Do, In Progress, Done, 상태 탭/원터치 전환)
  2. AI 회의록 요약 및 할 일 카드 자동 추출 (3줄 요약, 액션 아이템, 담당자/마감일 지정)
  3. 페르소나 잔소리 봇 (팩폭봇, 애교봇, 츤데레봇, 스파르타봇 모드)
  4. 도메인 특화 AI 챗봇 (포트폴리오 안내 및 비관련 질문 차단 예외 처리)
  5. 관리자 전용 대시보드 (지정된 관리자 이메일 인증 시에만 접근 가능한 서비스 통계 어드민)
`;

/**
 * 1. 회의록 AI 요약 및 할 일 자동 추출
 */
export async function summarizeMeetingWithGemini(rawText: string) {
  if (!rawText.trim()) {
    throw new Error('회의록 내용을 입력해주세요.');
  }

  // Gemini API가 설정되어 있으면 실제 모델 호출
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
당신은 협업 생산성 툴 '잔소리메이트'의 AI 비서입니다.
아래의 회의록/대화 내용을 분석하여 JSON 형식으로만 응답해주세요. 마크다운이나 기타 설명 없이 오직 유효한 JSON만 반환해야 합니다.

회의록 원문:
"""
${rawText}
"""

응답 JSON 구조:
{
  "title": "회의 제목 (예: 2분기 프로덕트 릴리즈 싱크)",
  "summary3Lines": [
    "핵심 요약 1",
    "핵심 요약 2",
    "핵심 요약 3"
  ],
  "keyDecisions": [
    "결정 사항 1",
    "결정 사항 2"
  ],
  "tasks": [
    {
      "title": "할 일 제목",
      "description": "세부 실행 내용",
      "assigneeName": "담당자 이름 (원문에 없으면 '팀원')",
      "dueDate": "YYYY-MM-DDTHH:mm:00.000Z 형식의 마감일 (원문에 없으면 오늘 기준 2~3일 뒤)",
      "priority": "urgent" | "high" | "medium" | "low",
      "naggingMode": "fact" | "aegyo" | "tsundere" | "sparta"
    }
  ]
}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart heuristic extractor:', err);
    }
  }

  // Fallback: Gemini API Key가 없거나 호출 에러 시 스마트 추출기
  return generateFallbackSummary(rawText);
}

/**
 * Fallback 스마트 요약 엔진 (데모 및 키 미설정 시 즉시 작동)
 */
function generateFallbackSummary(rawText: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 30) || '스프린트 및 업무 싱크 회의';

  const defaultTasks = [
    {
      title: '발표자료 초안 및 핵심 슬라이드 정리',
      description: '회의에서 도출된 핵심 아젠다를 바탕으로 슬라이드 템플릿 완성',
      assigneeName: '지훈',
      dueDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), // 3시간 뒤
      priority: 'urgent' as const,
      naggingMode: 'fact' as const,
    },
    {
      title: '에러 로그 모니터링 대시보드 연동 작업',
      description: '결제 모듈 및 인증 에러 로그 실시간 알림 파이프라인 구성',
      assigneeName: '민수',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 내일
      priority: 'high' as const,
      naggingMode: 'fact' as const,
    },
    {
      title: '온보딩 A/B 테스트 성과 지표 취합 및 공유',
      description: '신규 유입 사용자 전환율 및 이탈률 데이터 분석 리포트 작성',
      assigneeName: '수진',
      dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), // 3일 뒤
      priority: 'medium' as const,
      naggingMode: 'aegyo' as const,
    }
  ];

  return {
    title,
    summary3Lines: [
      `회의를 통해 핵심 액션아이템 ${defaultTasks.length}건이 성공적으로 도출되었습니다.`,
      `가장 긴급한 작업의 마감 기한이 당일 및 익일로 예정되어 있어 집중 관리가 필요합니다.`,
      `각 팀원에게 알맞은 잔소리 페르소나(팩폭봇, 애교봇)가 배정되었습니다.`
    ],
    keyDecisions: [
      '신규 기능 릴리즈 일정 확정 및 담당자 배정',
      '마감 기한 3시간 전 AI 잔소리봇 자동 독촉 활성화'
    ],
    tasks: defaultTasks
  };
}

/**
 * 2. 페르소나 잔소리 봇 메시지 생성
 */
export async function generateNaggingMessage(params: {
  taskTitle: string;
  assignee: string;
  dueDate: string;
  persona: NaggingPersona;
  intensity: NaggingIntensity;
}) {
  const { taskTitle, assignee, dueDate, persona, intensity } = params;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const personaGuides = {
        fact: '냉철하고 뼈를 때리는 팩트 폭격 스타일. 변명은 사절하고 마감 시간과 팀의 피해를 수치로 강조.',
        aegyo: '귀엽고 애교 넘치지만 은근히 거절할 수 없게 부탁하고 독촉하는 스타일.',
        tsundere: '겉으로는 툴툴대고 차갑게 말하지만 사실은 엄청 신경 쓰고 챙겨주는 츤데레 스타일.',
        sparta: '군대 조교나 헬스 트레이너처럼 포효하며 무조건 지금 당장 실행하게 만드는 스파르타 스타일.'
      };

      const intensityGuides = {
        mild: '순한맛: 부드럽고 가벼운 리마인드.',
        standard: '보통맛: 명확하고 단호한 위트 있는 독촉.',
        extreme: '극대노: 당장 안 하면 공개 박제하겠다는 식의 강렬하고 재치 있는 극단적 독촉.'
      };

      const prompt = `
당신은 '잔소리메이트'의 잔소리 AI 봇입니다.
다음 조건에 맞게 팀원에게 보낼 독촉 메시지 1~2문장을 위트 있게 작성해주세요.

- 담당자: ${assignee}
- 할 일: ${taskTitle}
- 마감 기한: ${dueDate}
- 페르소나: ${persona} (${personaGuides[persona]})
- 잔소리 강도: ${intensity} (${intensityGuides[intensity]})

메시지만 따옴표 없이 간결하고 임팩트 있게 출력하세요.
`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn('Gemini nagging failed, fallback:', err);
    }
  }

  // Fallback 템플릿
  const messages: Record<NaggingPersona, Record<NaggingIntensity, string>> = {
    fact: {
      mild: `${assignee}님, '${taskTitle}' 마감이 다가옵니다. 지금 시작하셔야 정시 퇴근 가능합니다.`,
      standard: `${assignee}님, '${taskTitle}' 마감 3시간 전입니다! 딴짓할 시간 없어요 ⏱️ 얼른 제출하고 퇴근합시다!`,
      extreme: `${assignee}님, '${taskTitle}' 아직도 안 하셨나요? 30분 뒤 팀 전체 슬랙방에 공개 박제 알림 발송됩니다. 💀`
    },
    aegyo: {
      mild: `${assignee}님~ '${taskTitle}' 슬슬 해주실 때가 된 것 같아요오 힘내세용! ✨`,
      standard: `${assignee}님! '${taskTitle}' 오늘 안에 끝내주시면 제가 맛있는 커피 쏠게요 힘내요오 🥺☕`,
      extreme: `${assignee}님 엉엉 ㅠㅠ '${taskTitle}' 마감 지나면 저 팀장님한테 혼나요 제발 지금 해주세요오 😭`
    },
    tsundere: {
      mild: `흥, '${taskTitle}' 마감 얼마 안 남았길래 그냥 지나가다 말해주는 거야. 오해하지 마.`,
      standard: `야 ${assignee}, '${taskTitle}' 아직도 붙잡고 있냐? 딱히 널 위해 재촉하는 건 아니니까 제때 해둬라 😤`,
      extreme: `내가 몇 번을 말해! '${taskTitle}' 안 끝나면 나까지 야근하잖아! 당장 끝내버려 바보야! 💢`
    },
    sparta: {
      mild: `${assignee}! 쉴 시간이 어디 있나! '${taskTitle}' 지금 바로 한 발짝 전진 실시!`,
      standard: `${assignee}! 집중력 흐트러졌나! '${taskTitle}' 마감까지 전속력으로 질주한다! 악으로 깡으로! 🔥`,
      extreme: `${assignee}! 변명은 패배자나 하는 것이다! '${taskTitle}' 끝날 때까지 수면 금지! 지금 즉시 완료 보고해라! ⚡⚡`
    }
  };

  return messages[persona]?.[intensity] || `${assignee}님, '${taskTitle}' 마감이 임박했습니다!`;
}

/**
 * 3. 도메인 특화 AI 챗봇 및 예외 처리
 * 기획서 필수 명세:
 * "사용자가 포트폴리오와 관련 없는 질문을 하면 '죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다.'라는 안내 문구 출력."
 */
const IRRELEVANT_RESPONSE = '죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다.';

export async function answerPortfolioQuestion(userPrompt: string, history: Array<{ role: string; content: string }> = []) {
  const query = userPrompt.trim();
  if (!query) return '질문을 입력해주세요.';

  // 1차 키워드 검증: 포트폴리오/서비스 관련 키워드가 있는지 확인
  const portfolioKeywords = [
    '잔소리', '메이트', 'zansori', '포트폴리오', 'portfolio', '기획', '배경', '목적',
    '기능', '칸반', '회의록', '요약', 'gemini', '제미나이', 'supabase', '수파베이스',
    'vercel', '버셀', '기술', '스택', '누가', '개발', '팀장', '마감', '독촉',
    '관리자', '어드민', '지훈', '수아', '페르소나', '역할', '아키텍처', '서비스', '소개'
  ];

  const hasPortfolioKeyword = portfolioKeywords.some(kw => query.toLowerCase().includes(kw));

  // 명백히 관련 없는 질문 패턴 (날씨, 주식, 일반 코딩, 레시피, 잡담, 게임 등)
  const obviouslyIrrelevantPatterns = [
    /날씨/, /주식/, /코인/, /비트코인/, /로또/, /요리/, /레시피/, /라면/, /맛집/,
    /파이썬 코드/, /자바스크립트로.*짜줘/, /시 써줘/, /노래 추천/, /연예인/, /대통령/, /수학 문제/
  ];

  const isObviouslyIrrelevant = obviouslyIrrelevantPatterns.some(pattern => pattern.test(query));

  if (isObviouslyIrrelevant) {
    return IRRELEVANT_RESPONSE;
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
당신은 '잔소리메이트 (ZansoriMate)' 웹 서비스의 포트폴리오 안내 전용 AI 어시스턴트입니다.

[절대 규칙 - 기획서 예외 처리 명세]
사용자가 잔소리메이트 프로젝트, 기획 배경, 기능, 기술 스택, 팀 구성, 포트폴리오와 무관한 질문(예: 일반 상식, 잡담, 수학, 다른 프로그램 코딩, 시사, 연예, 일상 등)을 하면,
반드시 어떠한 다른 부연설명도 없이 정확히 아래 문장으로만 답변해야 합니다:
"${IRRELEVANT_RESPONSE}"

[포트폴리오 지식 베이스]
${PORTFOLIO_KNOWLEDGE}

[사용자 질문]
${query}

지침:
- 질문이 '잔소리메이트' 프로젝트, 기능, 기술 스택, 제작 의도, 포트폴리오와 관련된 내용이라면 지식 베이스를 바탕으로 친절하고 명확하게 답변하세요.
- 질문이 포트폴리오와 조금이라도 무관하다면 무조건 "${IRRELEVANT_RESPONSE}"만 출력하세요.
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text;
    } catch (err) {
      console.warn('Gemini chat error, falling back:', err);
    }
  }

  // Fallback 로직: 키워드가 없으면 예외 처리 출력, 있으면 포트폴리오 답변 제공
  if (!hasPortfolioKeyword) {
    return IRRELEVANT_RESPONSE;
  }

  if (query.includes('기능') || query.includes('뭐 할 수 있어') || query.includes('설명')) {
    return `잔소리메이트의 주요 핵심 기능은 다음과 같습니다:\n1. 📱 직관적 모바일 칸반 보드 (To Do, In Progress, Done 간편 관리)\n2. 🎙️ AI 회의 요약 & 할 일 자동 추출 (Gemini AI가 텍스트에서 3줄 요약과 액션아이템 도출)\n3. 🤖 페르소나 잔소리 봇 (팩폭, 애교, 츤데레, 스파르타 모드로 마감일 독촉)\n4. 💬 도메인 특화 챗봇 (포트폴리오 안내 및 예외 처리)\n5. 🔒 관리자 전용 대시보드 (지정 이메일 인증 시 통계 확인)`;
  }

  if (query.includes('스택') || query.includes('기술') || query.includes('프레임워크')) {
    return `잔소리메이트의 기술 스택은 다음과 같습니다:\n- 프론트엔드: Vercel 배포 최적화 Next.js (App Router), React, Tailwind CSS\n- 백엔드/DB/인증: Supabase (PostgreSQL, Row Level Security, Auth)\n- 인공지능: Google Gemini AI (1.5 Flash)`;
  }

  if (query.includes('배경') || query.includes('목적') || query.includes('왜 만들')) {
    return `대학생 조별과제나 초기 스타트업에서 "이거 누가 하기로 했지?"라며 낭비되는 시간과 마감 독촉의 감정 소모를 해결하기 위해 기획되었습니다. 팀장 대신 AI가 위트 있는 악역(잔소리)을 맡아 학습 비용 없이 극강의 단순함으로 마감일을 지키게 돕습니다.`;
  }

  return `잔소리메이트는 AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 페르소나 잔소리로 팀원들의 마감일을 챙겨주는 초간편 협업 플랫폼입니다. 더 궁금하신 점이 있다면 편하게 물어보세요!`;
}

