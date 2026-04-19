import { GameState } from './gameState';

const SAVE_KEY = 'ignis-tavern-save';
const SETTINGS_KEY = 'ignis-tavern-settings';

export interface GameSettings {
  language: 'zh' | 'en';
  apiKey?: string;
  useLocalApi: boolean;
}

export const saveGame = (gameState: GameState): boolean => {
  try {
    const saveData = {
      ...gameState,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

export const loadGame = (): (GameState & { savedAt?: string }) | null => {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const hasSave = (): boolean => {
  return localStorage.getItem(SAVE_KEY) !== null;
};

export const deleteSave = (): void => {
  localStorage.removeItem(SAVE_KEY);
};

export const saveSettings = (settings: GameSettings): boolean => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

export const loadSettings = (): GameSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        language: 'zh',
        useLocalApi: false,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      language: 'zh',
      useLocalApi: false,
    };
  }
};

export const exportSave = (): string => {
  const save = loadGame();
  if (!save) return '';
  return btoa(JSON.stringify(save));
};

export const importSave = (base64Data: string): boolean => {
  try {
    const data = JSON.parse(atob(base64Data));
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
};
