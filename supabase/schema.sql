-- 잔소리메이트 (ZansoriMate) Supabase Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Meetings Table (회의록 및 AI 요약)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  raw_transcript TEXT NOT NULL,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks Table (칸반 보드 할 일)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_name TEXT NOT NULL DEFAULT '나',
  assignee_avatar TEXT,
  due_date TIMESTAMPTZ,
  nagging_mode TEXT DEFAULT 'fact' CHECK (nagging_mode IN ('fact', 'aegyo', 'tsundere', 'sparta')),
  nagging_intensity TEXT DEFAULT 'standard' CHECK (nagging_intensity IN ('mild', 'standard', 'extreme')),
  last_nagged_at TIMESTAMPTZ,
  nagging_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Nagging Logs Table (독촉 발송 이력)
CREATE TABLE IF NOT EXISTS public.nagging_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  persona TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nagging_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Any authenticated user can read profiles; user can update own profile
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Meetings: Users can CRUD own meetings
CREATE POLICY "Users can read own meetings" ON public.meetings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tasks: Users can CRUD own tasks
CREATE POLICY "Users can read own tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Nagging Logs: Read logs related to user's tasks
CREATE POLICY "Users can read own task logs" ON public.nagging_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = nagging_logs.task_id AND tasks.user_id = auth.uid())
);
CREATE POLICY "Users can insert own task logs" ON public.nagging_logs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = nagging_logs.task_id AND tasks.user_id = auth.uid())
);

