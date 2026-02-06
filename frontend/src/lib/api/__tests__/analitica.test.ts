import { describe, expect, it, vi } from 'vitest';

import { sendAnalyticsChat } from '@/lib/api/analitica';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
}));

describe('sendAnalyticsChat', () => {
  /**
   * Verifica respuesta ok; sirve para validar parseo exitoso.
   */
  async function testOkResponse() {
    const mockResponse = new Response(JSON.stringify({ ok: true, reply: 'Hola' }), {
      status: 200,
    });
    vi.mocked(api).mockResolvedValue(mockResponse);

    const result = await sendAnalyticsChat({ message: 'Hola' });

    expect(result.ok).toBe(true);
    expect(result.reply).toBe('Hola');
  }

  /**
   * Verifica error 503; sirve para validar el manejo de detalle.
   */
  async function testErrorResponse() {
    const mockResponse = new Response(
      JSON.stringify({ ok: false, error: 'llm_unavailable', detail: 'LLM no configurado' }),
      { status: 503 }
    );
    vi.mocked(api).mockResolvedValue(mockResponse);

    await expect(sendAnalyticsChat({ message: 'Hola' })).rejects.toThrow('LLM no configurado');
  }

  it('retorna respuesta ok cuando el backend responde 200', testOkResponse);
  it('lanza error cuando el backend responde 503 con detalle', testErrorResponse);
});
