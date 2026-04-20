import { ChatMessage } from './gameState';

const API_BASE = '/api';

/**
 * Send a message to the LLM.
 * ALL requests go through the server API route, which uses the same
 * server-side prompt builder (gm.ts) for consistent behavior.
 * User API keys are passed to the server for this request only, never stored.
 */
export async function* streamChatMessage(
  messages: ChatMessage[],
  language: string,
  userApiKey?: string,
  phase?: string,
  provider?: string,
  model?: string,
  customApiUrl?: string
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      language,
      phase,
      provider,
      model,
      userApiKey, // Passed to server, used for this request only
      customApiUrl,
    }),
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const error = await response.json();
      errorMsg = error.error || error.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.done) return;
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.content) yield parsed.content;
        } catch (e) {
          if (e instanceof Error && !e.message.includes('JSON')) throw e;
        }
      }
    }
  }
}

/**
 * Non-streaming version
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  language: string,
  userApiKey?: string,
  phase?: string,
  provider?: string,
  model?: string,
  customApiUrl?: string
): Promise<string> {
  let fullText = '';
  for await (const chunk of streamChatMessage(messages, language, userApiKey, phase, provider, model, customApiUrl)) {
    fullText += chunk;
  }
  return fullText;
}
