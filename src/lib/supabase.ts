import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 관리자 허용 이메일 목록 확인
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const envAdminEmails = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  // 기본 허용 관리자 이메일 (데모 및 기본값)
  const defaultAdmins = [
    'admin@zansorimate.com',
    'admin@test.com',
    'admin@gmail.com',
    'jihun@example.com'
  ];

  const adminSet = new Set([...envAdminEmails, ...defaultAdmins]);
  return adminSet.has(email.toLowerCase());
}

