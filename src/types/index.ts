export type TaskStatus = 'todo' | 'inprogress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NaggingPersona = 'fact' | 'aegyo' | 'tsundere' | 'sparta';

export type NaggingIntensity = 'mild' | 'standard' | 'extreme';

export interface Task {
  id: string;
  title: string;
  description?: string;
  meetingSource?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  assigneeAvatar?: string;
  dueDate: string; // ISO string
  naggingMode: NaggingPersona;
  naggingIntensity: NaggingIntensity;
  lastNaggedAt?: string;
  naggingCount: number;
  createdAt: string;
}

export interface MeetingSummary {
  id: string;
  title: string;
  rawText: string;
  summary3Lines: string[];
  keyDecisions: string[];
  tasks: Omit<Task, 'id' | 'createdAt' | 'naggingCount'>[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isNagging?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'member';
  avatarUrl?: string;
}

