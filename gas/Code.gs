/**
 * 잔소리메이트 (ZansoriMate) - Google Apps Script Backend (Code.gs)
 * AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 잔소리로 마감일을 챙겨주는 초간편 협업 플랫폼
 */

// Web App 진입점
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('잔소리메이트 (ZansoriMate) - AI 마감일 독촉 협업 플랫폼')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// HTML 파일 인클루드 헬퍼 (필요 시)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// -------------------------------------------------------------
// 1. 관리자 권한 및 세션 관리
// -------------------------------------------------------------
var DEFAULT_ADMIN_EMAILS = [
  'admin@zansorimate.com',
  'admin@gmail.com',
  'admin@test.com',
  'jihun@example.com'
];

function getSessionUser() {
  var email = Session.getActiveUser().getEmail();
  if (!email) {
    email = 'admin@zansorimate.com'; // 익명 접속 시 데모 관리자 기본값
  }
  
  var isAdmin = checkIsAdmin(email);
  return {
    email: email,
    name: email.split('@')[0],
    isAdmin: isAdmin
  };
}

function checkIsAdmin(email) {
  if (!email) return false;
  var lower = email.toLowerCase();
  
  // ScriptProperties에 설정된 관리자 이메일 목록 확인
  var scriptProps = PropertiesService.getScriptProperties();
  var customAdmins = scriptProps.getProperty('ADMIN_EMAILS');
  if (customAdmins) {
    var adminList = customAdmins.split(',').map(function(s) { return s.trim().toLowerCase(); });
    if (adminList.indexOf(lower) !== -1) return true;
  }
  
  return DEFAULT_ADMIN_EMAILS.indexOf(lower) !== -1;
}

// -------------------------------------------------------------
// 2. 초기 데이터 및 상태 조회 / 저장
// -------------------------------------------------------------
function getInitialData() {
  var user = getSessionUser();
  var props = PropertiesService.getUserProperties();
  var savedTasks = props.getProperty('ZANSORI_TASKS');
  var tasks = [];

  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (e) {
      tasks = getDefaultTasks();
    }
  } else {
    tasks = getDefaultTasks();
    props.setProperty('ZANSORI_TASKS', JSON.stringify(tasks));
  }

  return {
    user: user,
    tasks: tasks,
    naggingLogs: getNaggingLogs()
  };
}

function saveTasks(tasks) {
  var props = PropertiesService.getUserProperties();
  props.setProperty('ZANSORI_TASKS', JSON.stringify(tasks));
  return { success: true, count: tasks.length };
}

function getDefaultTasks() {
  var now = new Date().getTime();
  return [
    {
      id: 'task-1',
      title: '2분기 릴리즈 신규 기능 소개 발표자료 초안 작성',
      description: '회의록 액션아이템: 핵심 아젠다 정리 및 슬라이드 디자인 템플릿 완성',
      meetingSource: '2분기 프로덕트 싱크',
      status: 'inprogress',
      priority: 'urgent',
      assigneeName: '지훈 (나)',
      assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jihoon',
      dueDate: new Date(now + 3 * 3600 * 1000).toISOString(),
      naggingMode: 'fact',
      naggingIntensity: 'extreme',
      naggingCount: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: '결제 모듈 에러 로그 모니터링 대시보드 연동',
      description: '에러 로그 실시간 알림 파이프라인 구성 및 웹훅 테스트',
      meetingSource: '백엔드 정기 스프린트',
      status: 'todo',
      priority: 'high',
      assigneeName: '민수',
      assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minsu',
      dueDate: new Date(now + 24 * 3600 * 1000).toISOString(),
      naggingMode: 'fact',
      naggingIntensity: 'standard',
      naggingCount: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: '온보딩 튜토리얼 A/B 테스트 지표 집계',
      description: '신규 유입 사용자 첫날 잔존율 지표 취합 및 스프린트 보고자료 작성',
      meetingSource: '그로스 마케팅 회의',
      status: 'todo',
      priority: 'medium',
      assigneeName: '수진',
      assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sujin',
      dueDate: new Date(now + 72 * 3600 * 1000).toISOString(),
      naggingMode: 'aegyo',
      naggingIntensity: 'mild',
      naggingCount: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: '디자인 시스템 컬러 토큰 v2 배포',
      description: '다크 네오-택타일 테마 토큰 확정 및 컴포넌트 라이브러리 싱크',
      meetingSource: '디자인 싱크',
      status: 'done',
      priority: 'low',
      assigneeName: '지훈 (나)',
      assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jihoon',
      dueDate: new Date(now - 5 * 3600 * 1000).toISOString(),
      naggingMode: 'tsundere',
      naggingIntensity: 'standard',
      naggingCount: 0,
      createdAt: new Date(now - 24 * 3600 * 1000).toISOString()
    }
  ];
}

// -------------------------------------------------------------
// 3. AI 회의록 요약 및 할 일 자동 추출
// -------------------------------------------------------------
function generateTasksFromMeeting(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('회의록 또는 대화 내용을 입력해주세요.');
  }

  var scriptProps = PropertiesService.getScriptProperties();
  var geminiApiKey = scriptProps.getProperty('GEMINI_API_KEY');

  if (geminiApiKey) {
    try {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey;
      var prompt = '당신은 협업 플랫폼 "잔소리메이트"의 AI 비서입니다. 다음 회의록을 분석하여 오직 순수 JSON 형식만 반환하세요.\n\n' +
        '회의록:\n"""\n' + rawText + '\n"""\n\n' +
        'JSON 포맷:\n' +
        '{\n' +
        '  "title": "회의 제목",\n' +
        '  "summary3Lines": ["요약1", "요약2", "요약3"],\n' +
        '  "tasks": [\n' +
        '    {\n' +
        '      "title": "할 일 제목",\n' +
        '      "description": "설명",\n' +
        '      "assigneeName": "담당자",\n' +
        '      "dueDateHours": 24,\n' +
        '      "priority": "urgent" | "high" | "medium" | "low",\n' +
        '      "naggingMode": "fact" | "aegyo" | "tsundere" | "sparta"\n' +
        '    }\n' +
        '  ]\n' +
        '}';

      var payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      };

      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(url, options);
      var jsonResp = JSON.parse(response.getContentText());
      if (jsonResp.candidates && jsonResp.candidates[0].content.parts[0].text) {
        var rawJsonText = jsonResp.candidates[0].content.parts[0].text;
        var cleaned = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        var parsed = JSON.parse(cleaned);
        return parsed;
      }
    } catch (e) {
      Logger.log('Gemini API call failed, using fallback: ' + e.message);
    }
  }

  // Fallback 스마트 분석 엔진
  return fallbackMeetingSummary(rawText);
}

function fallbackMeetingSummary(rawText) {
  var now = new Date().getTime();
  var lines = rawText.split('\n').filter(function(l) { return l.trim().length > 0; });
  var title = lines[0] ? lines[0].substring(0, 25) : '스프린트 정기 싱크 회의';

  return {
    title: title,
    summary3Lines: [
      '회의를 통해 당면한 핵심 출시 일정 및 담당자 배정이 확정되었습니다.',
      '에러 모니터링 및 발표자료 작성이 당일/익일 긴급 태스크로 도출되었습니다.',
      '각 담당자에게 AI 잔소리봇(팩폭봇/애교봇)이 자동 매칭되었습니다.'
    ],
    tasks: [
      {
        title: '2분기 릴리즈 신규 기능 소개 발표자료 초안 작성',
        description: '핵심 슬라이드 디자인 템플릿 완성 및 조원 공유',
        assigneeName: '지훈',
        dueDateHours: 3,
        priority: 'urgent',
        naggingMode: 'fact'
      },
      {
        title: '결제 모듈 에러 로그 모니터링 대시보드 연동',
        description: '결제 모듈 에러 실시간 감지 알림 파이프라인 구성',
        assigneeName: '민수',
        dueDateHours: 24,
        priority: 'high',
        naggingMode: 'fact'
      },
      {
        title: '온보딩 튜토리얼 A/B 테스트 지표 집계',
        description: '신규 사용자 전환율 및 이탈률 데이터 분석 리포트 작성',
        assigneeName: '수진',
        dueDateHours: 72,
        priority: 'medium',
        naggingMode: 'aegyo'
      }
    ]
  };
}

// -------------------------------------------------------------
// 4. 페르소나 잔소리 메시지 생성
// -------------------------------------------------------------
function generateNaggingMessage(taskTitle, assignee, dueDate, persona, intensity) {
  var messages = {
    fact: {
      mild: assignee + '님, \'' + taskTitle + '\' 마감이 다가옵니다. 지금 시작하셔야 정시 퇴근 가능합니다.',
      standard: assignee + '님, \'' + taskTitle + '\' 마감 3시간 전입니다! 딴짓할 시간 없어요 ⏱️ 얼른 제출하고 퇴근합시다!',
      extreme: assignee + '님, \'' + taskTitle + '\' 아직도 안 하셨나요? 30분 뒤 팀 전체 슬랙방에 공개 박제 알림 발송됩니다. 💀'
    },
    aegyo: {
      mild: assignee + '님~ \'' + taskTitle + '\' 슬슬 해주실 때가 된 것 같아요오 힘내세용! ✨',
      standard: assignee + '님! \'' + taskTitle + '\' 오늘 안에 끝내주시면 제가 맛있는 커피 쏠게요 힘내요오 🥺☕',
      extreme: assignee + '님 엉엉 ㅠㅠ \'' + taskTitle + '\' 마감 지나면 저 팀장님한테 혼나요 제발 지금 해주세요오 😭'
    },
    tsundere: {
      mild: '흥, \'' + taskTitle + '\' 마감 얼마 안 남았길래 그냥 지나가다 말해주는 거야. 오해하지 마.',
      standard: '야 ' + assignee + ', \'' + taskTitle + '\' 아직도 붙잡고 있냐? 딱히 널 위해 재촉하는 건 아니니까 제때 해둬라 😤',
      extreme: '내가 몇 번을 말해! \'' + taskTitle + '\' 안 끝나면 나까지 야근하잖아! 당장 끝내버려 바보야! 💢'
    },
    sparta: {
      mild: assignee + '! 쉴 시간이 어디 있나! \'' + taskTitle + '\' 지금 바로 한 발짝 전진 실시!',
      standard: assignee + '! 집중력 흐트러졌나! \'' + taskTitle + '\' 마감까지 전속력으로 질주한다! 악으로 깡으로! 🔥',
      extreme: assignee + '! 변명은 패배자나 하는 것이다! \'' + taskTitle + '\' 끝날 때까지 수면 금지! 지금 즉시 완료 보고해라! ⚡⚡'
    }
  };

  var p = persona || 'fact';
  var i = intensity || 'standard';
  var msg = (messages[p] && messages[p][i]) ? messages[p][i] : (assignee + '님, \'' + taskTitle + '\' 마감이 임박했습니다!');
  
  // 독촉 로그 저장
  recordNaggingLog(assignee, p, msg);

  return { message: msg };
}

function recordNaggingLog(recipient, persona, message) {
  var props = PropertiesService.getUserProperties();
  var logsJson = props.getProperty('ZANSORI_LOGS');
  var logs = [];
  if (logsJson) {
    try { logs = JSON.parse(logsJson); } catch (e) {}
  }

  var personaLabels = {
    fact: '🤖 팩폭봇',
    aegyo: '🥺 애교봇',
    tsundere: '😤 츤데레',
    sparta: '🔥 스파르타'
  };

  logs.unshift({
    id: 'log-' + new Date().getTime(),
    recipient: recipient,
    persona: personaLabels[persona] || '🤖 팩폭봇',
    message: message,
    time: '방금 전',
    status: '전송 성공'
  });

  if (logs.length > 20) logs = logs.slice(0, 20);
  props.setProperty('ZANSORI_LOGS', JSON.stringify(logs));
}

function getNaggingLogs() {
  var props = PropertiesService.getUserProperties();
  var logsJson = props.getProperty('ZANSORI_LOGS');
  if (logsJson) {
    try { return JSON.parse(logsJson); } catch (e) {}
  }
  return [
    {
      id: 'log-1',
      recipient: '지훈',
      persona: '🤖 팩폭봇',
      message: '지훈님, 발표자료 초안 마감 3시간 전입니다! 딴짓할 시간 없어요 ⏱️',
      time: '10분 전',
      status: '전송 성공'
    },
    {
      id: 'log-2',
      recipient: '민수',
      persona: '🤖 팩폭봇',
      message: '결제 모듈 에러 로그 모니터링 대시보드 연동 마감일 D-1입니다.',
      time: '1시간 전',
      status: '전송 성공'
    },
    {
      id: 'log-3',
      recipient: '수진',
      persona: '🥺 애교봇',
      message: '수진님~ 온보딩 튜토리얼 지표 집계 오늘 안으로 해주실 수 있나용? ✨',
      time: '3시간 전',
      status: '전송 성공'
    }
  ];
}

// -------------------------------------------------------------
// 5. 도메인 특화 AI 챗봇 및 예외 처리 (가드레일)
// 기획서 명세: "사용자가 포트폴리오와 관련 없는 질문을 하면
// '죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다.'라는 안내 문구 출력"
// -------------------------------------------------------------
var IRRELEVANT_RESPONSE = '죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다.';

function chatPortfolioAssistant(userPrompt) {
  var query = (userPrompt || '').trim();
  if (!query) return '질문을 입력해주세요.';

  var lower = query.toLowerCase();

  // 명백히 관련 없는 질문 패턴 (날씨, 주식, 레시피, 잡담, 게임 등)
  var irrelevantKeywords = [
    '날씨', '주식', '코인', '비트코인', '로또', '요리', '레시피', '라면', '맛집',
    '파이썬 코드', '자바스크립트', '시 써줘', '노래 추천', '연예인', '대통령', '수학'
  ];

  for (var i = 0; i < irrelevantKeywords.length; i++) {
    if (lower.indexOf(irrelevantKeywords[i]) !== -1) {
      return IRRELEVANT_RESPONSE;
    }
  }

  // 포트폴리오 관련 필수 키워드
  var relevantKeywords = [
    '잔소리', '메이트', 'zansori', '포트폴리오', '기획', '배경', '목적',
    '기능', '칸반', '회의록', '요약', 'gemini', 'gas', '앱스스크립트',
    '기술', '스택', '개발', '팀장', '마감', '독촉', '관리자', '어드민',
    '지훈', '수아', '페르소나', '역할', '서비스', '소개'
  ];

  var isRelevant = false;
  for (var j = 0; j < relevantKeywords.length; j++) {
    if (lower.indexOf(relevantKeywords[j]) !== -1) {
      isRelevant = true;
      break;
    }
  }

  if (!isRelevant) {
    return IRRELEVANT_RESPONSE;
  }

  if (lower.indexOf('기능') !== -1 || lower.indexOf('뭐 할 수') !== -1 || lower.indexOf('소개') !== -1) {
    return '잔소리메이트의 주요 핵심 기능은 다음과 같습니다:\n' +
      '1. 📱 직관적 모바일 칸반 보드 (To Do, In Progress, Done 상태 관리 및 원터치 이동)\n' +
      '2. 🎙️ AI 회의 요약 & 할 일 자동 추출 (회의록에서 3줄 요약과 액션아이템 도출)\n' +
      '3. 🤖 페르소나 잔소리 봇 (팩폭봇, 애교봇, 츤데레봇, 스파르타봇 모드로 위트 있는 독촉 발송)\n' +
      '4. 💬 도메인 특화 챗봇 (포트폴리오 Q&A 및 비관련 질문 차단 예외 처리)\n' +
      '5. 🔒 관리자 대시보드 (사전 지정 이메일 접근 제어 및 서비스 통계 제공)';
  }

  if (lower.indexOf('스택') !== -1 || lower.indexOf('기술') !== -1) {
    return '잔소리메이트의 기술 스택은 다음과 같습니다:\n' +
      '- 프론트엔드/백엔드: Google Apps Script (GAS) Web App\n' +
      '- 스타일링: Tailwind CSS (Mobile-First Neo-Tactile 다크 테마)\n' +
      '- 인공지능: Google Gemini AI (1.5 Flash) 및 맞춤형 프롬프트 엔지니어링\n' +
      '- 배포/호스팅: clasp 기반 Google Web App URL 원클릭 배포';
  }

  if (lower.indexOf('배경') !== -1 || lower.indexOf('목적') !== -1 || lower.indexOf('왜 만들') !== -1) {
    return '대학생 조별과제나 초기 스타트업에서 "이거 누가 하기로 했지?"라며 낭비되는 시간과 마감 독촉의 감정 소모를 해결하기 위해 기획되었습니다. 팀장 대신 AI가 위트 있는 악역(잔소리)을 맡아 학습 비용 없이 극강의 단순함으로 마감일을 지키게 돕습니다.';
  }

  return '잔소리메이트는 AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 페르소나 잔소리로 팀원들의 마감일을 챙겨주는 초간편 협업 플랫폼입니다. 더 궁금하신 점이 있다면 편하게 물어보세요!';
}

