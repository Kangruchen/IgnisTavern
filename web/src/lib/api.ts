import { GameState, DialogueEntry } from './gameState';

export interface ChatRequest {
  gameState: GameState;
  choice?: string;
  diceRoll?: {
    result: number;
    success: boolean;
  };
}

export interface ChatResponse {
  dialogue: DialogueEntry;
  choices?: DialogueEntry['choices'];
  requiresDice?: boolean;
  diceDifficulty?: number;
  characterUpdate?: Partial<GameState['character']>;
  actChange?: number;
}

export interface ChatError {
  error: string;
  code: string;
}

const API_BASE = '/api';

export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json() as ChatError;
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
};

export const sendDiceRoll = async (
  gameState: GameState,
  difficulty: number
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameState,
      diceRoll: gameState.lastDiceRoll,
    }),
  });

  if (!response.ok) {
    const error = await response.json() as ChatError;
    throw new Error(error.error || 'Failed to send dice roll');
  }

  return response.json();
};
