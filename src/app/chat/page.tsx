'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '@/types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    content: `안녕하세요! '잔소리메이트 (ZansoriMate)' 포트폴리오 전용 AI 도우미입니다. 🤖

서비스의 기획 배경, 핵심 기능, 기술 스택(Vercel, Supabase, Gemini AI), 문제 해결 과정 등에 대해 무엇이든 물어보세요!

⚠️ 안내: 본 챗봇은 기획서 정책에 따라 포트폴리오와 관련된 질문에만 응답할 수 있습니다.`,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
  },
];

const SUGGESTED_QUESTIONS = [
  '잔소리메이트 기획 배경과 목적이 뭐야?',
  '어떤 기술 스택으로 개발되었나요?',
  'AI 회의록 요약과 잔소리봇 원리가 궁금해',
  '오늘 서울 날씨 어때? (예외 처리 테스트)',
  '파이썬으로 로또 번호 추출기 짜줘 (예외 처리 테스트)'
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const replyText = data.reply || '답변을 불러오지 못했습니다.';

      const isIrrelevant = replyText.includes('죄송합니다. 포트폴리오와 관련된 질문에만 답변할 수 있습니다.');

      const botMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isNagging: isIrrelevant,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] py-2">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-high">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span>도메인 특화 AI 챗봇</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-[10px] text-on-muted">포트폴리오 Q&A 및 도메인 가드레일 적용</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-surface-high hover:bg-surface-variant text-on-muted hover:text-white"
          title="대화 초기화"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="py-2 overflow-x-auto flex items-center gap-1.5 border-b border-surface-high/50">
        <span className="text-[10px] text-on-muted font-bold shrink-0">추천 질문:</span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-high border border-surface-high text-[11px] text-on-muted hover:text-white transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-secondary text-white'
                    : msg.isNagging
                    ? 'bg-prod-alert/30 text-prod-crimson border border-prod-crimson/40'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-keep ${
                  isUser
                    ? 'bg-secondary text-white font-medium rounded-tr-none'
                    : msg.isNagging
                    ? 'bg-prod-alert/20 border border-prod-crimson/50 text-prod-crimson font-bold rounded-tl-none shadow-neon-red'
                    : 'bg-surface-container border border-surface-high text-white font-normal rounded-tl-none shadow-md'
                }`}
              >
                {msg.isNagging && (
                  <div className="flex items-center gap-1 mb-1 text-[10px] text-prod-crimson font-extrabold uppercase">
                    <AlertCircle className="w-3 h-3" />
                    <span>예외 처리 가드레일 발동</span>
                  </div>
                )}
                {msg.content}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-white/70' : 'text-on-muted'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-primary font-bold">
            <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin text-primary" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-none bg-surface-container border border-surface-high text-xs text-on-muted flex items-center gap-1.5">
              <span>질문 도메인 판별 및 답변 생성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={e => setInputPrompt(e.target.value)}
          placeholder="포트폴리오 질문을 입력하세요 (예외 처리 테스트 가능)..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl bg-surface-container border border-surface-high text-xs text-white placeholder-on-muted/60 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="w-11 h-11 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-40 text-black flex items-center justify-center shrink-0 shadow-neon-yellow active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

