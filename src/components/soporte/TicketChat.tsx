'use client';

import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { IoSendOutline } from 'react-icons/io5';

interface Message {
  id: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  messageText: string;
  createdAt: string;
}

interface Props {
  ticketId: string;
  initialMessages: Message[];
  currentRole: 'CUSTOMER' | 'ADMIN';
  isClosed: boolean;
}

export const TicketChat = ({ ticketId, initialMessages, currentRole, isClosed }: Props) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje cuando cambia la lista
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Polling: actualiza mensajes cada 5 segundos mientras la página está activa
  useEffect(() => {
    if (isClosed) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(
          (data.messages ?? []).map((m: any) => ({
            id: m.id,
            senderType: m.senderType,
            messageText: m.messageText,
            createdAt: m.createdAt,
          }))
        );
      } catch { /* silently ignore polling errors */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [ticketId, isClosed]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: trimmed }),
      });
      if (!res.ok) return;
      const msg = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: msg.id,
          senderType: msg.senderType,
          messageText: msg.messageText,
          createdAt: msg.createdAt,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col" style={{ height: '420px' }}>
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isOwn = msg.senderType === currentRole;
          return (
            <div key={msg.id} className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  isOwn
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                )}
              >
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1 text-primary">
                    {msg.senderType === 'ADMIN' ? 'Soporte Teslo' : 'Tú'}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.messageText}</p>
                <p className={clsx('text-xs mt-1', isOwn ? 'text-primary-light' : 'text-gray-400')}>
                  {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-400">
          Esta consulta ha sido resuelta y está cerrada.
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100 flex gap-2 items-end">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Escribe tu mensaje... (Enter para enviar)"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="bg-primary hover:bg-primary-medium text-white p-2.5 rounded-xl transition-colors disabled:opacity-40 shrink-0"
            aria-label="Enviar"
          >
            <IoSendOutline size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
