import React, { useState, useEffect, useRef } from 'react';
import { fetchAssistantHistory, sendAssistantMessage } from '../api';

export default function AssistantScreen({ patient, onTriggerSos }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chips, setChips] = useState([
    'What medication should I take today?',
    'When is my next doctor appointment?',
    'Check my latest blood pressure',
    'Tips for knee stiffness & osteoarthritis'
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const res = await fetchAssistantHistory(patient?.id || 'P-001');
      if (res.success && res.messages?.length > 0) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Error loading assistant chat:', err);
    }
  };

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || sending) return;

    const trimmed = text.trim();
    setInput('');
    setSending(true);

    // Optimistically append user message
    const tempUserMsg = {
      id: 'TEMP-' + Date.now(),
      sender: 'user',
      message: trimmed,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await sendAssistantMessage(patient?.id || 'P-001', trimmed);
      if (res.success) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          res.user_message,
          res.assistant_message
        ]);

        if (res.assistant_message?.suggested_chips) {
          setChips(res.assistant_message.suggested_chips);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] bg-white rounded-3xl border border-[#DDF5E3] shadow-card overflow-hidden animate-fade-in">
      {/* 1. BulbaCare Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#F0F9F3] to-[#DDF5E3] border-b border-[#C2ECCC] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#136A34] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-leaf-green rounded-full border-2 border-white ring-1 ring-[#C2ECCC] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-[#1D3025]">BulbaCare Health AI</h1>
              <span className="text-[10px] font-bold text-[#15803D] bg-white px-2 py-0.5 rounded-full border border-[#C2ECCC]">
                Online
              </span>
            </div>
            <p className="text-[11px] text-[#404940]">
              Personalized for {patient?.first_name || 'Eleanor'} • Clinical EHR Active
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSos}
          type="button"
          className="text-[11px] font-bold text-error bg-white px-2.5 py-1 rounded-xl border border-error/30 hover:bg-error hover:text-white transition-colors"
        >
          Emergency SOS
        </button>
      </div>

      {/* 2. Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAFDF8]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const isCritical = m.category === 'CRITICAL';
          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#136A34] text-white flex items-center justify-center text-xs shrink-0 shadow-xs mb-1">
                  🌿
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-primary text-white rounded-br-xs'
                    : isCritical
                    ? 'bg-[#FEF2F2] border-2 border-error text-[#991B1B] rounded-bl-xs font-medium'
                    : 'bg-white border border-[#DDF5E3] text-[#1D3025] rounded-bl-xs'
                }`}
              >
                {/* Formatted Message Content */}
                <div className="whitespace-pre-wrap">{m.message}</div>

                <div
                  className={`mt-1.5 text-[10px] font-mono flex items-center justify-end ${
                    isUser ? 'text-white/70' : 'text-[#68796C]'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-[#68796C] italic pt-1">
            <div className="w-5 h-5 rounded-full bg-[#136A34] text-white flex items-center justify-center text-[10px]">
              🌿
            </div>
            <span>BulbaCare is reviewing your clinical record...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Reply Chips */}
      {chips.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-[#F1F5ED] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-[#68796C] shrink-0">Ask:</span>
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              type="button"
              className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#F1F5ED] text-[#214D38] border border-[#DDF5E3] hover:bg-[#DDF5E3] hover:border-primary/40 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* 4. Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-[#DDF5E3] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask BulbaCare about symptoms, pills, visits..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#DDF5E3] bg-[#F7FBF3] text-xs sm:text-sm text-[#1D3025] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-container disabled:opacity-40 transition-all shrink-0 shadow-xs"
          title="Send message"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
}
