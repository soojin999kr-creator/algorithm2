'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Mic,
  Plus,
  Sliders,
  CheckCircle2,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Task, TaskStatus, NaggingIntensity } from '@/types';
import KanbanCard from '@/components/KanbanCard';
import NaggingModal from '@/components/NaggingModal';

export default function HomeBoardPage() {
  const {
    tasks,
    updateTaskStatus,
    addTask,
    incrementNagging,
    globalIntensity,
    changeGlobalIntensity,
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'all' | TaskStatus>('all');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('나');
  const [newHours, setNewHours] = useState('24');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'inprogress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      assigneeName: newAssignee.trim() || '나',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + Number(newHours) * 3600 * 1000).toISOString(),
      naggingMode: 'fact',
      naggingIntensity: globalIntensity,
      meetingSource: '직접 등록',
    });

    setNewTitle('');
    setShowAddModal(false);
    showToast('✨ 새 할 일이 칸반 보드에 추가되었습니다!');
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-secondary text-white font-bold text-xs shadow-neon-orange animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 1. 위트있는 AI 페르소나 독촉 배너 (Nagging Alert Banner) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container to-surface-low p-4 border border-secondary/40 shadow-neon-orange">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-primary/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-white font-bold text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>🔥 마감사냥꾼 팩폭봇 Lv.3</span>
            </div>
            <div className="flex items-center gap-1 text-secondary font-bold text-xs">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>마감 임박 03:00:00</span>
            </div>
          </div>

          {/* Speech Bubble */}
          <div className="p-3.5 rounded-2xl bg-surface-high border border-surface-high/60 shadow-inner flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-secondary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-white text-sm leading-snug">
                “지훈님, 발표자료 초안 마감 3시간 전입니다! 딴짓할 시간 없어요 ⏱️”
              </p>
              <p className="text-xs text-on-muted mt-1 leading-relaxed">
                팀장님이 회의록에 등록하신 필수 액션아이템이에요. 얼른 제출하고 퇴근합시다!
              </p>
            </div>
          </div>

          {/* Banner Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
              📢 30분 뒤 팀 슬랙 자동 재촉 발동
            </span>
            <button
              onClick={() => {
                const urgentTask = tasks.find(t => t.id === 'task-1') || tasks[0];
                if (urgentTask) updateTaskStatus(urgentTask.id, 'done');
                showToast('🎉 마감 직전 제출 완료! 잔소리봇이 칭찬 모드로 전환되었습니다.');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-black font-extrabold text-xs shadow-neon-yellow active:scale-95 transition-all"
            >
              <span>지금 바로 제출</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. AI 회의록 간편 자동 추출 액션 바 (AI Quick Action Card) */}
      <section className="rounded-3xl bg-surface-container border border-surface-high p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white">방금 끝난 회의가 있나요?</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
            ⚡ AI Instant Sync
          </span>
        </div>

        <Link
          href="/summary"
          className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-container text-black font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-neon-yellow active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black animate-spin" />
            <span>AI 회의록 자동 추출 및 할 일 생성</span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-black text-primary text-[11px] font-bold">
            10초 완성
          </span>
        </Link>

        {/* 최근 요약 히스토리 스니펫 */}
        <div className="p-2.5 rounded-xl bg-surface-low border border-surface-high/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-on-muted block">오늘 10:30 싱크 요약 완료</span>
              <span className="font-medium text-white truncate">[2분기 프로덕트 릴리즈 싱크]</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-high text-secondary text-[10px] font-bold shrink-0">
            +4 액션 발굴
          </span>
        </div>
      </section>

      {/* 3. 직관적인 모바일 칸반 보드 (Mobile Kanban Section) */}
      <section className="flex flex-col gap-3">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-white tracking-tight">마감 추적 보드</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-high text-primary text-xs font-bold">
              {tasks.length}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-surface-high hover:bg-surface-variant text-on-surface text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>할 일 추가</span>
          </button>
        </div>

        {/* Filter Tabs (Horizontal Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: '전체', count: tasks.length },
            { id: 'todo', label: '할 일 To Do', count: todoCount },
            { id: 'inprogress', label: '진행 중 In Progress', count: inProgressCount },
            { id: 'done', label: '완료 Done', count: doneCount },
          ].map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-primary text-black shadow-neon-yellow scale-[1.02]'
                    : 'bg-surface-high text-on-muted hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                    isActive ? 'bg-black text-primary' : 'bg-surface-variant text-on-surface'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Task Cards List */}
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-surface-container border border-dashed border-surface-high text-on-muted text-xs">
              해당 상태의 할 일이 없습니다.
            </div>
          ) : (
            filteredTasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onOpenNaggingModal={t => setSelectedTaskForModal(t)}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. 하단 잔소리 수위 조절 미니 바 (Nagging Intensity Switcher) */}
      <section className="p-4 rounded-3xl bg-surface-container border border-surface-high flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs text-white">잔소리 메이트 강도 설정</h3>
          </div>
          <span className="text-xs font-bold text-secondary">
            {globalIntensity === 'extreme'
              ? '🔥 극대노 (팀 슬랙 공개박제)'
              : globalIntensity === 'standard'
              ? '⚡ 표준 팩폭 (적당히 재촉)'
              : '🌱 순한맛 (칭찬 중심)'}
          </span>
        </div>

        {/* 3단계 스위처 */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface-low border border-surface-high/50">
          {[
            { id: 'mild', label: '🌱 순한맛' },
            { id: 'standard', label: '⚡ 표준 팩폭' },
            { id: 'extreme', label: '🔥 극대노 모드' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => {
                changeGlobalIntensity(lvl.id as NaggingIntensity);
                showToast(`잔소리 강도가 [${lvl.label}]으로 변경되었습니다.`);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                globalIntensity === lvl.id
                  ? 'bg-primary text-black shadow-neon-yellow'
                  : 'text-on-muted hover:text-white'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </section>

      {/* AI Nagging Modal */}
      {selectedTaskForModal && (
        <NaggingModal
          task={selectedTaskForModal}
          onClose={() => setSelectedTaskForModal(null)}
          onSend={(taskId, msg) => {
            incrementNagging(taskId);
            showToast(`📨 '${selectedTaskForModal.assigneeName}' 님에게 잔소리 발송 완료!`);
          }}
        />
      )}

      {/* Quick Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container border border-surface-high rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-high">
              <h3 className="font-bold text-base text-white">새 할 일 직접 추가</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-surface-high flex items-center justify-center text-on-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-on-muted font-bold block mb-1">할 일 제목 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="예: 2차 스프린트 기획서 검토"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-low border border-surface-high text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-on-muted font-bold block mb-1">담당자</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    placeholder="지훈 / 민수 / 수진"
                    className="w-full px-3 py-2 rounded-xl bg-surface-low border border-surface-high text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-muted font-bold block mb-1">마감 기한</label>
                  <select
                    value={newHours}
                    onChange={e => setNewHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-low border border-surface-high text-white text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="3">3시간 뒤 (초긴급)</option>
                    <option value="12">12시간 뒤</option>
                    <option value="24">1일 뒤 (내일)</option>
                    <option value="72">3일 뒤</option>
                    <option value="168">1주일 뒤</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3 rounded-xl bg-primary text-black font-extrabold text-xs shadow-neon-yellow active:scale-95 transition-all"
              >
                할 일 카드 생성하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

