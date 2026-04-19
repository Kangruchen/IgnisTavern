/**
 * LLM 调用封装模块
 * 统一的 chatCompletion 函数，支持 DeepSeek API 格式
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  timeout?: number; // 毫秒
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message?: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 统一的 chatCompletion 函数
 * 支持 DeepSeek API，含超时处理
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const {
    messages,
    apiKey,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
    timeout = 30000, // 默认30秒
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API 请求失败: HTTP ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`;
      }

      if (response.status === 401) {
        throw new Error('API Key 无效或已过期');
      } else if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后重试');
      } else if (response.status >= 500) {
        throw new Error('服务器内部错误，请稍后重试');
      }

      throw new Error(errorMessage);
    }

    const data: ChatCompletionResponse = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接');
      }
      throw error;
    }

    throw new Error('未知的网络错误');
  }
}

/**
 * 流式 chatCompletion 函数
 * 返回一个 ReadableStream，用于 SSE
 */
export async function chatCompletionStream(
  options: Omit<ChatCompletionOptions, 'stream'>
): Promise<ReadableStream<Uint8Array>> {
  const {
    messages,
    apiKey,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
    timeout = 30000,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API 请求失败: HTTP ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      if (errorText) errorMessage += ` - ${errorText}`;
    }

    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

  return response.body;
}

/**
 * 解析流式响应
 * 将 SSE 格式转换为纯文本流
 */
export function parseChatStream(stream: ReadableStream<Uint8Array>): ReadableStream<string> {
  let buffer = '';
  
  return stream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buffer += new TextDecoder().decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '') continue;
          if (trimmed === 'data: [DONE]') {
            controller.terminate();
            return;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      },
      flush(controller) {
        // 处理剩余缓冲区
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            } catch {
              // 忽略
            }
          }
        }
        controller.terminate();
      },
    })
  );
}
