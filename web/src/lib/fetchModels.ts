/**
 * Dynamic model list fetching.
 * Fetches real-time models from provider APIs (OpenRouter, SiliconFlow, etc.)
 * Falls back to static lists if API is unavailable.
 */

export interface ModelInfo {
  id: string;
  name: string;
  free?: boolean;
}

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

/**
 * Fetch models from OpenRouter API — returns all available models.
 * This gives us real-time, always-up-to-date model lists.
 */
export async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch(OPENROUTER_API);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || [])
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        free: m.pricing?.prompt === '0' && m.pricing?.completion === '0',
      }))
      .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

/**
 * Fetch models for a specific provider.
 * For OpenRouter: fetches from API (comprehensive list).
 * For others: returns provider-specific models via their APIs if available,
 * otherwise falls back to static lists from providers.ts.
 */
export async function fetchModels(
  providerId: string,
  apiKey: string,
  customApiUrl?: string
): Promise<ModelInfo[]> {
  if (providerId === 'openrouter') {
    return fetchOpenRouterModels();
  }

  // For non-OpenRouter providers, try their /models endpoint if they have an API key
  if (apiKey) {
    try {
      const { PROVIDERS } = require('./providers');
      const provider = PROVIDERS[providerId as any];
      if (!provider || providerId === 'custom') return [];

      // Most OpenAI-compatible providers support /v1/models
      const baseUrl = providerId === 'custom' && customApiUrl
        ? customApiUrl.replace(/\/chat\/completions\/?$/, '')
        : provider.apiUrl.replace(/\/chat\/completions\/?$/, '');
      const modelsUrl = `${baseUrl}/models`;

      const response = await fetch(modelsUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.data || data.models || [];
        if (models.length > 0) {
          return models.map((m: any) => ({
            id: m.id || m.model || m,
            name: m.name || m.id || m.model || m,
          }));
        }
      }
    } catch {
      // Fall through to static list
    }
  }

  // Fallback: return static models from providers.ts
  try {
    const { PROVIDERS } = require('./providers');
    const provider = PROVIDERS[providerId as any];
    if (provider?.models?.length) {
      return provider.models.map((id: string) => ({ id, name: id }));
    }
  } catch {}

  return [];
}
