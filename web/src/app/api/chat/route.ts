import { NextRequest, NextResponse } from 'next/server';
import { buildGMPrompt } from '@/lib/agents/gm';
import { streamChatCompletion } from '@/lib/llm';
import { ProviderId } from '@/lib/providers';

// ── In-memory daily rate limit (per IP, resets at UTC midnight) ──
const dailyLimit = 10;
const usageMap = new Map<string, { count: number; date: string }>();

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const entry = usageMap.get(ip);

  if (!entry || entry.date !== today) {
    usageMap.set(ip, { count: 1, date: today });
    return { allowed: true, remaining: dailyLimit - 1 };
  }

  if (entry.count >= dailyLimit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: dailyLimit - entry.count };
}

/**
 * Server-side chat API with auto provider fallback + daily rate limit.
 *
 * Priority (no user key):
                  provider: attempt.provider as ProviderId,
 *
 * Rate limit: 10 free requests per IP per day
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      messages?: Array<{ role: string; content: string }>;
      language?: 'zh' | 'en';
      phase?: string;
      provider?: string;
      model?: string;
      userApiKey?: string;
      customApiUrl?: string;
    };
    const { messages, language, phase, provider, model, userApiKey, customApiUrl } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
    }

    // User's own key = no rate limit
    if (!userApiKey) {
      const ip = getClientIp(request);
      const { allowed } = checkRateLimit(ip);
      if (!allowed) {
        return NextResponse.json({
          error: 'daily_limit',
          remaining: 0,
          limit: dailyLimit,
          message: language === 'zh'
            ? `今日免费额度已用完（${dailyLimit}次/天）。请配置自己的 API Key 继续游戏！`
            : `Daily free limit reached (${dailyLimit}/day). Please configure your own API key to continue!`,
        }, { status: 429 });
      }
    }

    // Build system prompt (progressive loading — only includes files relevant to current phase)
    const currentPhase = (phase || 'character_creation') as 'character_creation' | 'opening' | 'act1' | 'act2' | 'act3' | 'ending';
    const systemPrompt = buildGMPrompt(language || 'zh', currentPhase);

    // For the opening phase, inject a scene-trigger user message if this is the first turn
    // after character creation. This gives the model a clear signal to narrate the opening scene.
    const lang = language === 'zh' ? 'zh' : 'en';
    const llmMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Check if this is the very first user message in the opening phase
    // (character creation is now UI-driven, so the first message in opening
    // is always the trigger from the front-end)
    const userMessages = messages.filter(m => m.role === 'user');
    if (currentPhase === 'character_creation' && userMessages.length <= 1) {
      // First turn in character creation — inject welcome trigger
      const trigger = lang === 'zh'
        ? '开始游戏。请输出欢迎词。'
        : 'Start the game. Please output a welcome message.';
      llmMessages.push({ role: 'user', content: trigger });
    } else if (currentPhase === 'opening' && userMessages.length === 0) {
      // First turn in opening phase with no user message — inject scene trigger
      // Note: Frontend now handles context control for player's first choice
      const trigger = lang === 'zh'
        ? '角色已创建完成。请按照场景文件原文，开始第一幕开场叙事。'
        : 'Character creation is complete. Begin the Act I opening scene, using the scene file text verbatim.';
      llmMessages.push({ role: 'user', content: trigger });
    } else {
      // For all other cases, use messages as-is (frontend controls context)
      llmMessages.push(...messages);
    }

    // Determine provider attempts
    const attempts: { apiKey: string; provider: string; model: string; customApiUrl?: string }[] = [];

    if (userApiKey) {
      attempts.push({
        apiKey: userApiKey,
        provider: provider || 'openrouter',
        model: model || 'minimax/minimax-m2.5:free',
        customApiUrl,
      });
    } else {
      const orKey = process.env.FALLBACK_API_KEY_OPENROUTER;
      const sfKey = process.env.FALLBACK_API_KEY_SILICONFLOW;

      if (orKey) {
        attempts.push({
          apiKey: orKey,
          provider: process.env.FALLBACK_PROVIDER || 'openrouter',
          model: process.env.FALLBACK_MODEL || 'minimax/minimax-m2.5:free',
        });
      }
      if (sfKey) {
        attempts.push({
          apiKey: sfKey,
          provider: process.env.FALLBACK_PROVIDER_2 || 'siliconflow',
          model: process.env.FALLBACK_MODEL_2 || 'deepseek-ai/DeepSeek-V3.2',
        });
      }
    }

    if (attempts.length === 0) {
      return NextResponse.json(
        {
          error: 'fallback_unavailable',
          message: language === 'zh'
            ? '当前免费保底模型不可用，请配置自己的 API Key。'
            : 'Fallback free model is currently unavailable. Please configure your own API key.',
        },
        { status: 503 }
      );
    }

    // Try each provider with real-time streaming.
    // Fallback only if an attempt fails before yielding any chunk.
    const encoder = new TextEncoder();
    let lastError = '';

    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < attempts.length; i++) {
          const attempt = attempts[i];
          let hasContent = false;

          try {
            await streamChatCompletion(
              {
                apiKey: attempt.apiKey,
                messages: llmMessages,
                model: attempt.model,
                provider: attempt.provider as ProviderId,
                customApiUrl: attempt.customApiUrl,
                firstResponseTimeoutMs: userApiKey ? 30000 : 12000,
              },
              (chunk) => {
                hasContent = true;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
                );
              },
              () => {}
            );

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
            );
            controller.close();
            return;
          } catch (error: unknown) {
            lastError = error instanceof Error ? error.message : 'Stream error';
            console.log(`Provider ${attempt.provider} failed: ${lastError}. Trying next...`);

            // If streaming already started, do not switch provider mid-response.
            if (hasContent) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: lastError })}\n\n`)
              );
              controller.close();
              return;
            }
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: lastError || 'All providers failed' })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
