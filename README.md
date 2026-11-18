# 잔소리메이트 (ZansoriMate) 🤖🔥

> **"이거 누가 하기로 했지?"**  
> AI가 회의록을 요약해 할 일을 쪼개주고, 맵고 달달한 페르소나 잔소리로 팀원들의 마감일을 챙겨주는 초간편 협업 플랫폼.

---

## 🌟 주요 기능
1. **모바일 최우선 직관적 칸반 보드 (Mobile Kanban)**:
   - 할 일(To Do), 진행 중(In Progress), 완료(Done) 탭 필터 및 실시간 상태 전환
   - 마감일 카운트다운 D-Day 실시간 뱃지
   - 카드별 잔소리 강도 태그 (🔥🔥🔥 극대노, ⚡⚡ 보통, 🌱 순한맛)
   - 원클릭 "대신 콕 찌르기" AI 독촉 발송 기능
2. **AI 회의록 요약 & 할 일 자동 추출 (AI Meeting Note)**:
   - 카카오톡 단톡방 대화나 회의록 텍스트를 붙여넣으면 Gemini AI가 핵심 3줄 요약과 실행 액션아이템 도출
   - 담당자 배정, 마감 기한, 우선순위 자동 설정 후 칸반 보드로 일괄 전송
3. **페르소나 잔소리 봇 (Nagging Persona)**:
   - 🤖 팩폭봇: 냉철하고 뼈 때리는 팩트 기반 독촉
   - 🥺 애교봇: 귀엽게 부탁하며 거절 못하게 만드는 독촉
   - 😤 츤데레봇: 툴툴대면서도 챙겨주는 독촉
   - 🔥 스파르타봇: 열정과 패기로 즉시 실행하게 만드는 독촉
4. **도메인 특화 AI 챗봇 및 예외 처리 (Domain Guardrail)**:
   - 잔소리메이트 기획 의도, 포트폴리오, 기술 스택 질의응답
   - **예외 처리 가드레일**: 포트폴리오와 무관한 질문 시 *"죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다."* 안내 문구 출력
5. **관리자 전용 대시보드 (Admin Dashboard)**:
   - 사전에 지정된 이메일(`admin@zansorimate.com`, `admin@gmail.com` 등) 로그인 시에만 접근 허용
   - 서비스 통계(생성된 할 일, 잔소리 발송 수, 회의록 수, 활성 팀원) 및 AI 독촉 실시간 로그 모니터링

---

## 🛠️ 기술 스택
- **프론트엔드**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **백엔드/인증/DB**: Supabase (PostgreSQL, Row Level Security, Auth)
- **인공지능**: Google Gemini AI (1.5 Flash / Pro)
- **UI/UX 디자인**: Stitch MCP ("Nagging Pulse" 다크 네오-택타일 테마)
- **배포 인프라**: Vercel

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local)
# .env.example을 복사하여 .env.local 생성 후 필요한 키 입력
cp .env.example .env.local

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 📁 Supabase DB 스키마
`supabase/schema.sql` 파일을 Supabase 대시보드의 SQL Editor에 실행하여 테이블과 RLS 정책을 생성할 수 있습니다.

