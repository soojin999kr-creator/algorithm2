'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { NaggingPersona } from '@/types';

const SAMPLE_TRANSCRIPT = `[오늘 오전 10:30 스프린트 회의록 요약]
참여자: 지훈(팀장), 민수(백엔드), 수진(마케팅)

지훈: 다들 오셨죠? 2분기 프로덕트 릴리즈 관련해서 업무 싱크 맞추겠습니다.
민수: 결제 모듈에서 간헐적으로 에러 로그가 찍히는데 모니터링 대시보드 연동 작업이 급선무입니다. 내일 오후 6시까지 핫픽스 배포하겠습니다.
수진: 온보딩 튜토리얼 A/B 테스트 지표 집계는 목요일 스프린트 전까지 취합해서 슬랙에 공유하겠습니다.
지훈: 좋습니다. 저는 오늘 당장 3시간 뒤까지 2분기 신규 기능 소개 발표자료 초안 작성 끝내서 팀에 올리겠습니다.
지훈: 다들 마감 시간 꼭 지켜주세요! 안 지키면 잔소리봇 가동합니다.`;

interface ExtractedTaskItem {
  title: string;
  description?: string;
  assigneeName: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  selected: boolean;
}

export default function SummaryPage() {
  const router = useRouter();
  const { addTask } = useAppStore();

  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI 분석 결과 상태
  const [analysisResult, setAnalysisResult] = useState<{
    title: string;
    summary3Lines: string[];
    keyDecisions: string[];
    tasks: ExtractedTaskItem[];
  } | null>(null);

  const [selectedPersona, setSelectedPersona] = useState<NaggingPersona>('fact');
  const [copied, setCopied] = useState(false);

  // 예시 불러오기
  const handleLoadSample = () => {
    setRawText(SAMPLE_TRANSCRIPT);
    setErrorMsg(null);
  };

  // AI 요약 호출
  const handleSummarize = async () => {
    if (!rawText.trim()) {
      setErrorMsg('회의록이나 단톡방 대화 텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      if (!res.ok) {
        throw new Error('AI 요약 요청에 실패했습니다.');
      }

      const data = await res.json();
      setAnalysisResult({
        title: data.title || '회의 요약 및 액션아이템',
        summary3Lines: data.summary3Lines || [],
        keyDecisions: data.keyDecisions || [],
        tasks: (data.tasks || []).map((t: any) => ({
          ...t,
          selected: true,
        })),
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI 요약 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 할 일 선택 토글
  const toggleTaskSelection = (index: number) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      tasks: analysisResult.tasks.map((t, i) =>
        i === index ? { ...t, selected: !t.selected } : t
      ),
    });
  };

  // 칸반 보드로 전송
  const handleTransferToKanban = () => {
    if (!analysisResult) return;
    const selectedTasks = analysisResult.tasks.filter(t => t.selected);

    if (selectedTasks.length === 0) {
      alert('최소 1개 이상의 할 일을 선택해주세요.');
      return;
    }

    selectedTasks.forEach(task => {
      addTask({
        title: task.title,
        description: task.description || '',
        meetingSource: analysisResult.title,
        status: 'todo',
        priority: task.priority || 'medium',
        assigneeName: task.assigneeName || '팀원',
        dueDate: task.dueDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        naggingMode: selectedPersona,
        naggingIntensity: 'standard',
      });
    });

    alert(`🎉 ${selectedTasks.length}개의 할 일이 칸반 보드에 성공적으로 등록되었습니다!`);
    router.push('/');
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const textToCopy = `[${analysisResult.title}]\n\n📌 3줄 요약:\n${analysisResult.summary3Lines.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n✅ 실행 할 일:\n${analysisResult.tasks.map(t => `- [${t.assigneeName}] ${t.title}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 py-2 pb-6">
      {/* 1. 상단 타이틀 및 상태 헤더 */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="font-extrabold text-lg text-white">회의록 AI 분석기</h1>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold">
            Gemini AI 탑재
          </span>
        </div>
        <p className="text-xs text-on-muted leading-relaxed">
          카톡 대화나 회의록을 넣으면 AI가 핵심을 요약하고 잔소리와 함께 할 일을 쪼개드립니다.
        </p>
      </section>

      {/* 2. 회의록 원문 입력 영역 */}
      <section className="rounded-3xl bg-surface-container border border-surface-high p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>회의록 / 단톡방 텍스트</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1 rounded-lg bg-surface-high hover:bg-surface-variant text-primary text-[11px] font-bold active:scale-95 transition-all"
            >
              예시 불러오기
            </button>
            {rawText && (
              <button
                onClick={() => setRawText('')}
                className="p-1 rounded-lg bg-surface-high hover:bg-prod-crimson/20 text-on-muted hover:text-prod-crimson"
                title="지우기"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={7}
            placeholder="카카오톡 대화 내용, 슬랙 스레드, 회의 녹취록 텍스트를 그대로 붙여넣어 보세요..."
            className="w-full p-3.5 rounded-2xl bg-surface-low border border-surface-high text-xs sm:text-sm text-white placeholder-on-muted/60 focus:outline-none focus:border-primary resize-none leading-relaxed"
          />
          <div className="text-right text-[10px] text-on-muted mt-1">
            {rawText.length.toLocaleString()}자 입력됨
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-prod-alert/20 border border-prod-crimson/40 text-prod-crimson text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Summarize CTA Button */}
        <button
          onClick={handleSummarize}
          disabled={isLoading || !rawText.trim()}
          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-neon-yellow active:scale-95 transition-all"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-black" />
              <span>Gemini AI가 핵심 요약 및 할 일을 쪼개는 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>✨ Gemini AI로 핵심 요약 및 할일 쪼개기</span>
            </>
          )}
        </button>
      </section>

      {/* 3. AI 분석 결과 미리보기 영역 */}
      {analysisResult && (
        <section className="flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <h2 className="font-extrabold text-sm text-white">
                ✨ AI 실시간 분석 결과
              </h2>
            </div>
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1 rounded-xl bg-surface-high text-on-surface text-xs font-bold flex items-center gap-1 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '결과 복사'}</span>
            </button>
          </div>

          {/* [A] 핵심 3줄 요약 카드 */}
          <div className="p-4 rounded-3xl bg-surface-container border border-surface-high flex flex-col gap-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-primary">📌 핵심 브리핑 (3줄 요약)</span>
              <span className="text-[10px] text-on-muted">{analysisResult.title}</span>
            </div>
            <ul className="flex flex-col gap-2 mt-1">
              {analysisResult.summary3Lines.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-white leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* [B] 자동 생성된 실행 할 일 (Action Items) 카드 리스트 */}
          <div className="p-4 rounded-3xl bg-surface-container border border-surface-high flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-secondary">
                ✅ 자동 추출된 할 일 ({analysisResult.tasks.filter(t => t.selected).length}/{analysisResult.tasks.length}개 선택)
              </span>
              <span className="text-[10px] text-on-muted">체크 후 전송 가능</span>
            </div>

            <div className="flex flex-col gap-2">
              {analysisResult.tasks.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleTaskSelection(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    task.selected
                      ? 'bg-surface-high border-secondary/40 shadow-sm'
                      : 'bg-surface-low border-surface-high/40 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.selected}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white leading-tight">
                        {task.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold shrink-0">
                        {task.priority === 'urgent'
                          ? '긴급 🔥'
                          : task.priority === 'high'
                          ? '높음 ⚡'
                          : '보통'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-on-muted">
                      <span>담당자: <strong className="text-primary">{task.assigneeName}</strong></span>
                      <span>•</span>
                      <span>마감: {new Date(task.dueDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* [C] 잔소리 페르소나 설정 라디오 */}
          <div className="p-4 rounded-3xl bg-surface-container border border-surface-high flex flex-col gap-2.5 shadow-md">
            <span className="font-bold text-xs text-white">전송할 잔소리 톤앤매너 설정</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'fact', label: '🤖 팩폭봇', desc: '마감 안 지키면 박제' },
                { id: 'aegyo', label: '🥺 애교봇', desc: '커피 쏠게요 힘내요' },
                { id: 'tsundere', label: '😤 츤데레', desc: '제때 해둬라 바보야' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id as NaggingPersona)}
                  className={`p-2 rounded-2xl text-left flex flex-col gap-0.5 transition-all ${
                    selectedPersona === p.id
                      ? 'bg-secondary text-white shadow-neon-orange'
                      : 'bg-surface-high text-on-muted hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] opacity-80 truncate">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* [D] 최종 전송 액션 */}
          <button
            onClick={handleTransferToKanban}
            className="w-full py-4 rounded-2xl bg-secondary hover:bg-secondary-container text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-neon-orange active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>🚀 칸반 보드로 할 일 전송 (+독촉봇 연동)</span>
          </button>
        </section>
      )}
    </div>
  );
}

