'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  Flame,
  FileText,
  BarChart3,
  Lock,
  ArrowRight,
  Database,
  Server,
  Activity
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const { user, isAdmin, tasks, switchUser } = useAppStore();
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // 비관리자 접근 제어 화면
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-prod-alert/20 border border-prod-crimson/40 text-prod-crimson flex items-center justify-center shadow-neon-red mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-lg font-extrabold text-white mb-2">관리자 권한이 필요합니다</h1>
        <p className="text-xs text-on-muted leading-relaxed max-w-xs mb-6">
          현재 로그인된 계정(<strong>{user?.email || '게스트'}</strong>)은 관리자 전용 대시보드 접근 권한이 없습니다. 사전에 지정된 관리자 이메일로 로그인해 주세요.
        </p>

        {/* Quick Demo Switch to Admin */}
        <div className="w-full max-w-xs p-4 rounded-3xl bg-surface-container border border-surface-high flex flex-col gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Lock className="w-4 h-4" />
            <span>관리자 계정 즉시 전환 (검증용):</span>
          </div>
          <button
            onClick={() => switchUser('admin@zansorimate.com', '김지훈 (조장/관리자)')}
            className="w-full py-3 rounded-2xl bg-primary text-black font-extrabold text-xs shadow-neon-yellow active:scale-95 transition-all"
          >
            🛡️ admin@zansorimate.com 으로 전환
          </button>
          <Link
            href="/"
            className="text-xs text-on-muted hover:text-white underline pt-1"
          >
            ← 홈 보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 통계 계산
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const totalNaggingSent = tasks.reduce((acc, cur) => acc + (cur.naggingCount || 0), 5);

  const naggingLogs = [
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

  return (
    <div className="flex flex-col gap-4 py-2 pb-8">
      {/* Admin Header */}
      <section className="flex items-center justify-between pb-2 border-b border-surface-high">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-neon-yellow">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base text-white">관리자 대시보드</h1>
              <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                Admin Authorized
              </span>
            </div>
            <p className="text-[10px] text-on-muted truncate max-w-[200px]">
              접속자: {user?.email} ({user?.fullName})
            </p>
          </div>
        </div>

        <button
          onClick={() => switchUser('sua@startup.com', '이수아 (일반 멤버)')}
          className="px-2.5 py-1.5 rounded-xl bg-surface-high hover:bg-surface-variant text-[11px] font-bold text-on-muted hover:text-white"
        >
          일반 유저로 변경
        </button>
      </section>

      {/* 1. 핵심 서비스 통계 그리드 */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-high flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-on-muted">
            <span className="text-xs font-semibold">총 생성 할 일</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-extrabold text-white">{totalTasks}개</span>
          <span className="text-[10px] text-emerald-400">완료율 {Math.round((completedTasks / (totalTasks || 1)) * 100)}%</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-high flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-on-muted">
            <span className="text-xs font-semibold">AI 잔소리 발송</span>
            <Flame className="w-4 h-4 text-secondary animate-pulse" />
          </div>
          <span className="text-xl font-extrabold text-secondary">{totalNaggingSent}회</span>
          <span className="text-[10px] text-on-muted">평균 마감 준수 88%</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-high flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-on-muted">
            <span className="text-xs font-semibold">요약된 회의록</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-extrabold text-white">12건</span>
          <span className="text-[10px] text-on-muted">Gemini AI 처리</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container border border-surface-high flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-on-muted">
            <span className="text-xs font-semibold">활성 팀원 수</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-extrabold text-white">4명</span>
          <span className="text-[10px] text-emerald-400">전원 활동 중</span>
        </div>
      </section>

      {/* 2. 최근 발송된 잔소리 봇 실시간 로그 */}
      <section className="rounded-3xl bg-surface-container border border-surface-high p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-secondary" />
            <h2 className="font-bold text-xs text-white">최근 AI 독촉 발송 로그</h2>
          </div>
          <span className="text-[10px] text-on-muted">실시간 스트림</span>
        </div>

        <div className="flex flex-col gap-2">
          {naggingLogs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-surface-low border border-surface-high/50 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-secondary">{log.persona}</span>
                  <span className="text-on-muted">→</span>
                  <span className="text-white">{log.recipient}</span>
                </div>
                <span className="text-[10px] text-on-muted">{log.time}</span>
              </div>
              <p className="text-xs text-on-muted leading-relaxed truncate">
                “{log.message}”
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-emerald-400 font-bold">✓ {log.status}</span>
                <span className="text-on-muted">Slack / In-App Push</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 시스템 연동 인프라 상태 (Vercel, Supabase, Gemini AI) */}
      <section className="rounded-3xl bg-surface-container border border-surface-high p-4 flex flex-col gap-2.5 shadow-md">
        <h2 className="font-bold text-xs text-white flex items-center gap-1.5">
          <Server className="w-4 h-4 text-primary" />
          <span>기술 스택 인프라 상태</span>
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-surface-low border border-surface-high/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">Vercel Frontend</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Edge Network Ready</span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-low border border-surface-high/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">Supabase DB & RLS</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Schema Active</span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-low border border-surface-high/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">Google Gemini AI</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">1.5 Flash Connected</span>
          </div>
        </div>
      </section>
    </div>
  );
}

