'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Flame, Heart, Swords, Smile, Copy, Check } from 'lucide-react';
import { Task, NaggingPersona, NaggingIntensity } from '@/types';

interface NaggingModalProps {
  task: Task | null;
  onClose: () => void;
  onSend: (taskId: string, message: string) => void;
}

export default function NaggingModal({ task, onClose, onSend }: NaggingModalProps) {
  const [selectedPersona, setSelectedPersona] = useState<NaggingPersona>('fact');
  const [selectedIntensity, setSelectedIntensity] = useState<NaggingIntensity>('standard');
  const [naggingMessage, setNaggingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (task) {
      setSelectedPersona(task.naggingMode || 'fact');
      setSelectedIntensity(task.naggingIntensity || 'standard');
      fetchNagging(task.naggingMode || 'fact', task.naggingIntensity || 'standard');
    }
  }, [task]);

  const fetchNagging = async (persona: NaggingPersona, intensity: NaggingIntensity) => {
    if (!task) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/nag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          assignee: task.assigneeName,
          dueDate: task.dueDate,
          persona,
          intensity,
        }),
      });
      const data = await res.json();
      setNaggingMessage(data.message || '마감이 얼마 남지 않았습니다!');
    } catch (e) {
      console.error(e);
      setNaggingMessage(`${task.assigneeName}님, '${task.title}' 마감 기한을 확인해주세요!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaChange = (persona: NaggingPersona) => {
    setSelectedPersona(persona);
    fetchNagging(persona, selectedIntensity);
  };

  const handleIntensityChange = (intensity: NaggingIntensity) => {
    setSelectedIntensity(intensity);
    fetchNagging(selectedPersona, intensity);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(naggingMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-container border border-surface-high rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-high">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-secondary/20 text-secondary">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">AI 페르소나 잔소리 콕 찌르기</h3>
              <p className="text-xs text-on-muted">팀장 대신 AI가 위트 있게 재촉해드립니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center text-on-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Info */}
        <div className="p-3 rounded-2xl bg-surface-low border border-surface-high/50 flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-muted">대상: <strong className="text-primary">{task.assigneeName}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[11px] font-bold">
              {task.meetingSource || '회의록 태스크'}
            </span>
          </div>
          <p className="text-sm font-semibold text-white line-clamp-1">{task.title}</p>
        </div>

        {/* Persona Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-muted">잔소리 페르소나 선택:</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'fact', label: '🤖 팩폭봇', icon: Swords },
              { id: 'aegyo', label: '🥺 애교봇', icon: Heart },
              { id: 'tsundere', label: '😤 츤데레', icon: Smile },
              { id: 'sparta', label: '🔥 스파르타', icon: Flame },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id as NaggingPersona)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                  selectedPersona === p.id
                    ? 'bg-primary text-black shadow-neon-yellow scale-[1.02]'
                    : 'bg-surface-high text-on-muted hover:text-white'
                }`}
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-muted">잔소리 강도 수위:</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-low">
            {[
              { id: 'mild', label: '🌱 순한맛' },
              { id: 'standard', label: '⚡ 표준 팩폭' },
              { id: 'extreme', label: '🔥 극대노' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleIntensityChange(item.id as NaggingIntensity)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedIntensity === item.id
                    ? 'bg-secondary text-white shadow-neon-orange'
                    : 'text-on-muted hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Nagging Message Box */}
        <div className="relative p-4 rounded-2xl bg-surface-high border border-primary/30 min-h-[90px] flex items-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 w-full text-xs text-primary font-bold">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Gemini AI가 가장 찰진 잔소리를 짓는 중...</span>
            </div>
          ) : (
            <p className="text-sm text-white font-medium leading-relaxed break-keep">
              “{naggingMessage}”
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-surface-high hover:bg-surface-variant text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사 완료!' : '문구 복사'}</span>
          </button>

          <button
            onClick={() => {
              onSend(task.id, naggingMessage);
              onClose();
            }}
            className="flex-[2] py-3 rounded-xl bg-primary hover:bg-primary-container text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-neon-yellow active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>콕 찌르기 발송 (+알림)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

