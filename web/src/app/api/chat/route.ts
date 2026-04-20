import { NextRequest, NextResponse } from 'next/server';
import { buildGMPrompt } from '@/lib/agents/gm';
import { streamChatCompletion } from '@/lib/llm';
import { PROVIDERS, ProviderId } from '@/lib/providers';

/**
 * Server-side chat API.
 * Handles BOTH fallback (server key) and user-provided keys.
 * User keys are received from browser, used for this request only, never stored.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, language, phase, provider, model, userApiKey, customApiUrl } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid messages' },
        { status: 400 }
      );
    }

    // Use user's key if provided, otherwise fallback to server key
    const apiKey = userApiKey || process.env.FALLBACK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key available. Please provide your own API key.' },
        { status: 401 }
      );
    }

    const providerId = (provider as ProviderId) || (process.env.FALLBACK_PROVIDER as ProviderId) || 'siliconflow';
    const modelName = model || process.env.FALLBACK_MODEL || PROVIDERS[providerId]?.defaultModel || 'Qwen/Qwen3.5-4B';

    // Build system prompt using the SAME server-side logic as fallback
    const systemPrompt = buildGMPrompt(language || 'zh', (phase || 'character_creation') as any);

    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatCompletion(
            {
              apiKey,
              messages: llmMessages,
              model: modelName,
              provider: providerId,
              customApiUrl,
            },
            (chunk) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            },
            () => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
              );
              controller.close();
            }
          );
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || 'Stream error' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
