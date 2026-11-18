'use client';

import React from 'react';
import { Clock, Send, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';

interface KanbanCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onOpenNaggingModal: (task: Task) => void;
}

export default function KanbanCard({
  task,
  onStatusChange,
  onOpenNaggingModal,
}: KanbanCardProps) {
  // D-Day 및 남은 시간 포맷 계산
  const getDueBadge = () => {
    if (task.status === 'done') {
      return {
        label: '독촉 해제됨 🎉',
        style: 'bg-surface-high text-on-muted',
      };
    }

    const now = new Date().getTime();
    const due = new Date(task.dueDate).getTime();
    const diffHours = Math.round((due - now) / (1000 * 3600));

    if (diffHours <= 0) {
      return {
        label: '🚨 마감 초과!',
        style: 'bg-prod-crimson/20 text-prod-crimson border border-prod-crimson/40 animate-pulse',
      };
    } else if (diffHours <= 3) {
      return {
        label: `D-Day ${diffHours}시간 전`,
        style: 'bg-secondary/20 text-secondary border border-secondary/40 animate-pulse',
      };
    } else if (diffHours <= 24) {
      return {
        label: 'D-1 (내일 마감)',
        style: 'bg-primary/20 text-primary border border-primary/40',
      };
    } else {
      const days = Math.ceil(diffHours / 24);
      return {
        label: `D-${days}`,
        style: 'bg-surface-high text-on-muted',
      };
    }
  };

  const getIntensityBadge = () => {
    switch (task.naggingIntensity) {
      case 'extreme':
        return { label: '🔥🔥🔥 극대노', style: 'text-secondary font-bold' };
      case 'standard':
        return { label: '⚡⚡ 보통', style: 'text-primary font-bold' };
      case 'mild':
      default:
        return { label: '🌱 순한맛', style: 'text-on-muted' };
    }
  };

  const dueBadge = getDueBadge();
  const intensityBadge = getIntensityBadge();
  const isDone = task.status === 'done';

  return (
    <article
      className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-200 ${
        task.status === 'inprogress'
          ? 'bg-surface-container border-secondary/30 shadow-neon-orange'
          : isDone
          ? 'bg-surface-container/60 border-surface-high/40 opacity-75'
          : 'bg-surface-container border-surface-high shadow-md'
      }`}
    >
      {/* Top Header Tags */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold truncate ${
              task.status === 'inprogress'
                ? 'bg-secondary text-white'
                : isDone
                ? 'bg-surface-high text-on-muted'
                : 'bg-surface-high text-on-surface'
            }`}
          >
            {task.status === 'todo'
              ? '할 일'
              : task.status === 'inprogress'
              ? '진행 중'
              : '완료'}
          </span>
          {task.meetingSource && (
            <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-muted text-[11px] font-medium truncate max-w-[130px]">
              📋 {task.meetingSource}
            </span>
          )}
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${dueBadge.style}`}>
          <Clock className="w-3 h-3" />
          {dueBadge.label}
        </span>
      </div>

      {/* Task Title */}
      <h3
        className={`mt-2.5 font-bold text-sm sm:text-base leading-snug ${
          isDone ? 'line-through text-on-muted' : 'text-white'
        }`}
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1 text-xs text-on-muted leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Nagging Intensity & Status Snippet */}
      <div className="mt-3 p-2.5 rounded-xl bg-surface-high/60 border border-surface-high/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-on-muted">잔소리 강도:</span>
          <span className={intensityBadge.style}>{intensityBadge.label}</span>
        </div>
        <div className="text-[11px] text-on-muted">
          {isDone
            ? '정시 완료 달성! 🎉'
            : task.naggingCount > 0
            ? `총 ${task.naggingCount}회 독촉됨`
            : '자동 독촉 대기 중'}
        </div>
      </div>

      {/* Card Footer: Assignee & Action Buttons */}
      <div className="mt-4 pt-2 border-t border-surface-high/50 flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-high border border-primary/20">
            {task.assigneeAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                {task.assigneeName.slice(0, 1)}
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-white truncate max-w-[80px]">
            {task.assigneeName}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {!isDone && (
            <button
              onClick={() => onOpenNaggingModal(task)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-variant hover:bg-secondary/20 hover:text-secondary text-on-surface text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-secondary" />
              <span>콕 찌르기</span>
            </button>
          )}

          {task.status === 'todo' && (
            <button
              onClick={() => onStatusChange(task.id, 'inprogress')}
              className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold active:scale-95 transition-all"
            >
              시작
            </button>
          )}

          {task.status === 'inprogress' && (
            <button
              onClick={() => onStatusChange(task.id, 'done')}
              className="px-2.5 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-black text-xs font-extrabold active:scale-95 transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              완료
            </button>
          )}

          {isDone && (
            <button
              onClick={() => onStatusChange(task.id, 'inprogress')}
              className="px-2 py-1.5 rounded-xl bg-surface-high hover:bg-surface-variant text-on-muted text-xs font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              되돌리기
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

