'use client';

import { useState, useEffect } from 'react';
import { Task, UserProfile } from '@/types';
import { isAdminEmail, supabase, isSupabaseConfigured } from './supabase';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: '2분기 릴리즈 신규 기능 소개 발표자료 초안 작성',
    description: '회의록 액션아이템: 핵심 아젠다 정리 및 슬라이드 디자인 템플릿 완성',
    meetingSource: '2분기 프로덕트 싱크',
    status: 'inprogress',
    priority: 'urgent',
    assigneeName: '지훈 (나)',
    assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jihoon',
    dueDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    naggingMode: 'fact',
    naggingIntensity: 'extreme',
    naggingCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: '결제 모듈 에러 로그 모니터링 대시보드 연동',
    description: 'Sentry 및 Supabase 에러 로그 실시간 알림 웹훅 파이프라인 연동',
    meetingSource: '백엔드 정기 스프린트',
    status: 'todo',
    priority: 'high',
    assigneeName: '민수',
    assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Minsu',
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    naggingMode: 'fact',
    naggingIntensity: 'standard',
    naggingCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: '온보딩 튜토리얼 A/B 테스트 지표 집계',
    description: '신규 사용자 첫날 잔존율 지표 취합 및 스프린트 보고자료 작성',
    meetingSource: '그로스 마케팅 회의',
    status: 'todo',
    priority: 'medium',
    assigneeName: '수진',
    assigneeAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sujin',
    dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
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
    dueDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    naggingMode: 'tsundere',
    naggingIntensity: 'standard',
    naggingCount: 0,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_USER: UserProfile = {
  id: 'user-demo-1',
  email: 'admin@zansorimate.com',
  fullName: '김지훈 (조장/관리자)',
  role: 'admin',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminJihoon'
};

export function useAppStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [globalIntensity, setGlobalIntensity] = useState<'mild' | 'standard' | 'extreme'>('standard');

  // LocalStorage 및 Supabase 세션 초기화
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('zansori_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(INITIAL_TASKS);
        localStorage.setItem('zansori_tasks', JSON.stringify(INITIAL_TASKS));
      }

      const savedUser = localStorage.getItem('zansori_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // 기본값: 김지훈 (관리자)
        setUser(DEFAULT_USER);
        localStorage.setItem('zansori_user', JSON.stringify(DEFAULT_USER));
      }

      const savedIntensity = localStorage.getItem('zansori_intensity');
      if (savedIntensity) {
        setGlobalIntensity(savedIntensity as any);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
      setTasks(INITIAL_TASKS);
      setUser(DEFAULT_USER);
    } finally {
      setIsLoaded(true);
    }

    // Supabase Auth 세션 청취 (설정되어 있는 경우)
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || '';
          const role = isAdminEmail(email) ? 'admin' : 'member';
          const profile: UserProfile = {
            id: session.user.id,
            email,
            fullName: session.user.user_metadata?.full_name || email.split('@')[0],
            role,
            avatarUrl: session.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + email
          };
          setUser(profile);
          localStorage.setItem('zansori_user', JSON.stringify(profile));
        }
      });
    }
  }, []);

  // 할 일 상태 변경 (To Do -> In Progress -> Done)
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t));
      try {
        localStorage.setItem('zansori_tasks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // 새 할 일 추가
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'naggingCount'>) => {
    const task: Task = {
      ...newTask,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      naggingCount: 0
    };

    setTasks(prev => {
      const next = [task, ...prev];
      try {
        localStorage.setItem('zansori_tasks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // 잔소리 횟수 증가 및 타임스탬프 갱신 (콕 찌르기)
  const incrementNagging = (taskId: string) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              naggingCount: (t.naggingCount || 0) + 1,
              lastNaggedAt: new Date().toISOString()
            }
          : t
      );
      try {
        localStorage.setItem('zansori_tasks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // 잔소리 수위 변경
  const changeGlobalIntensity = (intensity: 'mild' | 'standard' | 'extreme') => {
    setGlobalIntensity(intensity);
    try {
      localStorage.setItem('zansori_intensity', intensity);
    } catch (e) {}
  };

  // 사용자 로그인/로그아웃 헬퍼
  const switchUser = (email: string, name?: string) => {
    const role = isAdminEmail(email) ? 'admin' : 'member';
    const profile: UserProfile = {
      id: 'user-' + Date.now(),
      email,
      fullName: name || email.split('@')[0],
      role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
    };
    setUser(profile);
    try {
      localStorage.setItem('zansori_user', JSON.stringify(profile));
    } catch (e) {}
    return profile;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('zansori_user');
    } catch (e) {}
    if (supabase && isSupabaseConfigured) {
      supabase.auth.signOut();
    }
  };

  return {
    tasks,
    user,
    isAdmin: user?.role === 'admin' || isAdminEmail(user?.email),
    isLoaded,
    globalIntensity,
    updateTaskStatus,
    addTask,
    incrementNagging,
    changeGlobalIntensity,
    switchUser,
    logout
  };
}

