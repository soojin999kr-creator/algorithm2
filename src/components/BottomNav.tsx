'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KanbanSquare, FileText, Bot, ShieldCheck } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: '홈 보드', href: '/', icon: KanbanSquare },
    { label: '회의록 요약', href: '/summary', icon: FileText },
    { label: '잔소리봇', href: '/chat', icon: Bot },
    { label: '관리자', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060E20]/95 backdrop-blur-xl border-t border-[#171F33] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-muted hover:text-on-surface'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

