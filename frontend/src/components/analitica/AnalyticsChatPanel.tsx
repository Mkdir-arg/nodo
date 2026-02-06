'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MessageSquareText, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { canUseAnalytics } from '@/lib/permissions';
import { useAnalyticsChatStore } from '@/lib/store/useAnalyticsChatStore';
import { useAnalyticsContextStore } from '@/lib/store/useAnalyticsContextStore';
import { sendAnalyticsChat } from '@/lib/api/analitica';

type ChatMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'error';
  content: string;
};

/**
 * Panel flotante del chat analitico; sirve para mostrar el input libre sin depender de una URL.
 */
export default function AnalyticsChatPanel() {
  const { open, closePanel } = useAnalyticsChatStore();
  const { user, isLoading } = useAuth();
  const hasAccess = canUseAnalytics(user);
  const { plantillaId: contextPlantillaId, source: contextSource } = useAnalyticsContextStore();
  const lastPayloadRef = useRef<{
    message: string;
    context: { plantillaId: string | null; source: string | null };
  } | null>(null);
  const [inputText, setInputText] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'system-1',
      role: 'system' as const,
      content: 'Escribe una consulta en lenguaje natural para iniciar.',
    },
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !hasAccess) {
      closePanel();
    }
  }, [isLoading, user, hasAccess, closePanel]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, closePanel]);

  /**
   * Genera un id simple; sirve para identificar mensajes en la UI.
   */
  const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  /**
   * Agrega un mensaje al historial; sirve para mostrar el dialogo del chat.
   */
  const appendMessage = (role: ChatMessage['role'], content: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role, content }]);
  };

  /**
   * Maneja el envio; sirve para capturar input libre y preparar el payload futuro del LLM.
   */
  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isBusy) return;
    setIsBusy(true);
    appendMessage('user', trimmed);
    setInputText('');

    const payload = {
      message: trimmed,
      context: {
        plantillaId: contextPlantillaId ?? null,
        source: contextSource ?? null,
      },
    };
    lastPayloadRef.current = payload;

    try {
      const response = await sendAnalyticsChat(payload);
      if (response.ok && response.reply) {
        appendMessage('assistant', response.reply);
      } else if (response.detail || response.error) {
        appendMessage('assistant', response.detail || response.error || 'Respuesta sin detalle.');
      } else {
        appendMessage('assistant', 'Respuesta recibida.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado en el chat.';
      appendMessage('error', message);
    } finally {
      setIsBusy(false);
    }
  };

  /**
   * Envia con Enter; sirve para mejorar la experiencia del input libre.
   */
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleSend();
  };

  if (!open || isLoading || !user || !hasAccess) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20"
        onClick={closePanel}
        aria-hidden
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Chat analitico"
        className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-foreground" aria-hidden />
            <div>
              <div className="text-sm font-semibold text-foreground">Chat analitico</div>
              <div className="text-xs text-muted-foreground">Input libre</div>
            </div>
          </div>
          <button
            onClick={closePanel}
            aria-label="Cerrar chat analitico"
            className="rounded-md p-2 hover:bg-muted text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex h-[420px] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm text-foreground">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl border border-border p-3 ${
                  message.role === 'error'
                    ? 'bg-red-50 text-red-900'
                    : message.role === 'user'
                    ? 'bg-muted/40'
                    : message.role === 'assistant'
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'bg-background'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Escribe tu consulta..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                disabled={isBusy}
              />
              <button
                onClick={handleSend}
                disabled={isBusy || !inputText.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs text-background hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-4 w-4" aria-hidden />
                Enviar
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Este chat solo procesa lectura y usara el LLM cuando este integrado.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
