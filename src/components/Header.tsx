'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Bell, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Header() {
  const { user, isAdmin, logout, switchUser } = useAppStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1326]/85 backdrop-blur-xl border-b border-[#171F33] pt-safe">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-neon-yellow">
            <span className="text-black font-extrabold text-base">Z</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                잔소리메이트
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wide">
                Pro
              </span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </span>
              )}
            </div>
            <span className="text-[10px] text-on-muted leading-none">
              AI 마감일 독촉 플랫폼
            </span>
          </div>
        </Link>

        {/* Right Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button
            aria-label="알림"
            className="relative w-9 h-9 rounded-xl bg-surface-high/70 flex items-center justify-center text-on-surface hover:text-primary active:scale-95 transition-all"
            onClick={() => alert('🚨 팩폭봇: 현재 마감 임박한 할 일이 1건 있습니다!')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary animate-pulse" />
          </button>

          {/* Profile Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-xl overflow-hidden border border-primary/30 flex items-center justify-center bg-surface-high active:scale-95 transition-all"
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-on-surface" />
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container border border-surface-high shadow-2xl p-3 z-50">
                <div className="border-b border-surface-high pb-2 mb-2">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.fullName || '게스트 사용자'}
                  </p>
                  <p className="text-[11px] text-on-muted truncate">{user?.email || '로그인 필요'}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isAdmin ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-muted'
                    }`}>
                      {isAdmin ? '🛡️ 관리자 (Admin)' : '👤 일반 팀원'}
                    </span>
                  </div>
                </div>

                {/* Quick Account Switcher for Testing */}
                <div className="space-y-1 text-xs">
                  <p className="text-[10px] text-on-muted font-bold px-1">계정 빠른 전환 (테스트용):</p>
                  <button
                    onClick={() => {
                      switchUser('admin@zansorimate.com', '김지훈 (조장/관리자)');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-high text-on-surface flex items-center justify-between"
                  >
                    <span>🛡️ 관리자 계정</span>
                    {isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUser('sua@startup.com', '이수아 (스타트업 창업자)');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-high text-on-surface flex items-center justify-between"
                  >
                    <span>👤 일반 사용자 계정</span>
                    {!isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </button>
                </div>

                <div className="border-t border-surface-high mt-2 pt-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-prod-crimson/20 text-prod-crimson text-xs flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

