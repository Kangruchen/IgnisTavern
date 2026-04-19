export type Language = 'zh' | 'en';

export interface Character {
  name: string;
  nameEn: string;
  portrait?: string;
  stats: {
    hp: number;
    maxHp: number;
    luck: number;
    reputation: number;
  };
  inventory: string[];
}

export interface DialogueEntry {
  id: string;
  speaker?: string;
  speakerEn?: string;
  text: string;
  textEn: string;
  choices?: {
    id: string;
    text: string;
    textEn: string;
    nextId?: string;
  }[];
  requiresDice?: boolean;
  diceDifficulty?: number;
}

export interface GameState {
  language: Language;
  currentAct: number;
  currentScene: string;
  dialogue: DialogueEntry[];
  character: Character;
  choices: DialogueEntry['choices'];
  isTyping: boolean;
  lastDiceRoll?: {
    result: number;
    success: boolean;
    difficulty: number;
  };
}

const defaultCharacter: Character = {
  name: '酒馆老板',
  nameEn: 'Tavern Keeper',
  stats: {
    hp: 100,
    maxHp: 100,
    luck: 10,
    reputation: 0,
  },
  inventory: ['一本破旧的账本', '神秘的钥匙'],
};

const initialDialogue: DialogueEntry = {
  id: 'intro',
  speaker: '旁白',
  speakerEn: 'Narrator',
  text: '欢迎来到伊格尼斯——一座以美食闻名的烹饪之都。你继承了这家位于街角的小酒馆，但这座城市似乎隐藏着不为人知的秘密...',
  textEn: 'Welcome to Ignis — a culinary metropolis famous for its cuisine. You\'ve inherited this corner tavern, but this city seems to hide secrets unknown...',
};

export const createInitialGameState = (): GameState => ({
  language: 'zh',
  currentAct: 1,
  currentScene: 'tavern_opening',
  dialogue: [initialDialogue],
  character: { ...defaultCharacter },
  choices: [
    { id: 'check_signboard', text: '查看酒馆招牌', textEn: 'Check the signboard' },
    { id: 'enter_kitchen', text: '走进厨房', textEn: 'Enter the kitchen' },
    { id: 'look_out_window', text: '望向窗外', textEn: 'Look out the window' },
  ],
  isTyping: false,
});

export const gameStateReducer = (
  state: GameState,
  action:
    | { type: 'SET_LANGUAGE'; payload: Language }
    | { type: 'ADD_DIALOGUE'; payload: DialogueEntry }
    | { type: 'SET_CHOICES'; payload: DialogueEntry['choices'] }
    | { type: 'SET_TYPING'; payload: boolean }
    | { type: 'SET_DICE_ROLL'; payload: GameState['lastDiceRoll'] }
    | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
    | { type: 'UPDATE_STATS'; payload: Partial<Character['stats']> }
    | { type: 'SET_ACT'; payload: number }
    | { type: 'RESET_STATE' }
): GameState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'ADD_DIALOGUE':
      return { ...state, dialogue: [...state.dialogue, action.payload] };
    case 'SET_CHOICES':
      return { ...state, choices: action.payload };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_DICE_ROLL':
      return { ...state, lastDiceRoll: action.payload };
    case 'UPDATE_CHARACTER':
      return { ...state, character: { ...state.character, ...action.payload } };
    case 'UPDATE_STATS':
      return {
        ...state,
        character: {
          ...state.character,
          stats: { ...state.character.stats, ...action.payload },
        },
      };
    case 'SET_ACT':
      return { ...state, currentAct: action.payload };
    case 'RESET_STATE':
      return createInitialGameState();
    default:
      return state;
  }
};
