export type Language = 'zh' | 'en';

export interface Character {
  name: string;
  nameEn: string;
  portrait?: string;
  stats: {
    str: number;
    dex: number;
    int: number;
    cha: number;
    hp: number;
    maxHp: number;
  };
  skills: string[];
  inventory: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface NPCRelation {
  name: string;       // 'yu' | 'huan' | 'licht'
  satisfaction: number; // 0-100, hidden from player
  status: 'active' | 'left'; // whether NPC is still at tavern
}

export interface GameMechanics {
  dayNumber: number;           // Current in-game day
  consecutiveRevenueDays: number; // Days hitting revenue target
  revenueTarget: number;       // Daily revenue target
  todayRevenue: number;        // Today's revenue so far
  xp: number;                  // Experience points
  inspectionPassed: boolean;   // Whether inspection was passed
}

export type DiceState = 'idle' | 'awaiting_roll' | 'roll_resolved';

export interface GameState {
  language: Language;
  currentAct: number;
  currentScene: string;
  messages: ChatMessage[];         // Full conversation history for LLM context
  displayedText: string;           // Currently displayed assistant text (for typewriter)
  character: Character;
  isTyping: boolean;
  isStreaming: boolean;
  lastDiceRoll?: {
    result: number;
    success: boolean;
    difficulty: number;
  };
  userApiKey?: string;
  provider?: string;
  model?: string;
  customApiUrl?: string;
  apiMode?: 'default' | 'custom';
  npcRelations: NPCRelation[];
  mechanics: GameMechanics;
  diceState: DiceState;
  currentCheck?: {
    attribute: string;  // 'str' | 'dex' | 'int' | 'cha'
    dc: number;
    label: string;      // e.g. '体魄' or 'STR'
  };
  // Inline events: cards embedded in the chat flow
  inlineEvents: InlineEvent[];
  showCharacterCreation: boolean;  // whether character creation card should show
}

export interface InlineEvent {
  id: string;
  type: 'item_add' | 'item_remove' | 'hp_change' | 'skill_add' | 'xp' | 'day_change' | 'revenue_change';
  value: string | number;
  afterMessageIndex: number;  // show after this message index
}

export interface DmTagPatch {
  hp?: number;
  maxHp?: number;
  addItems?: string[];
  removeItems?: string[];
  addSkills?: string[];
  xpGain?: number;
  npcDeltas?: Array<{ npcName: string; delta: number }>;
  name?: string;
  nameEn?: string;
  stats?: Partial<Pick<Character['stats'], 'str' | 'dex' | 'int' | 'cha'>>;
  dayNumber?: number;  // Set specific day number
  addRevenue?: number;  // Add to today's revenue
}

const defaultCharacter: Character = {
  name: '',
  nameEn: '',
  stats: {
    str: 0,
    dex: 0,
    int: 0,
    cha: 0,
    hp: 0,
    maxHp: 0,
  },
  skills: [],
  inventory: [],
};

const defaultNPCRelations: NPCRelation[] = [
  { name: 'yu', satisfaction: 50, status: 'active' },
  { name: 'huan', satisfaction: 50, status: 'active' },
  { name: 'licht', satisfaction: 50, status: 'active' },
];

const defaultGameMechanics: GameMechanics = {
  dayNumber: 1,
  consecutiveRevenueDays: 0,
  revenueTarget: 100,
  todayRevenue: 0,
  xp: 0,
  inspectionPassed: false,
};

export const createInitialGameState = (): GameState => ({
  language: 'zh',
  currentAct: 1,
  currentScene: 'language_select',
  messages: [],
  displayedText: '',
  character: { ...defaultCharacter },
  isTyping: false,
  isStreaming: false,
  npcRelations: [...defaultNPCRelations],
  mechanics: { ...defaultGameMechanics },
  diceState: 'idle',
  currentCheck: undefined,
  inlineEvents: [],
  showCharacterCreation: true,
});

export const gameStateReducer = (
  state: GameState,
  action:
    | { type: 'SET_LANGUAGE'; payload: Language }
    | { type: 'ADD_USER_MESSAGE'; payload: string }
    | { type: 'ADD_ASSISTANT_MESSAGE'; payload: string }
    | { type: 'APPEND_STREAMING_TEXT'; payload: string }
    | { type: 'FINISH_STREAMING'; payload: string }
    | { type: 'SET_TYPING'; payload: boolean }
    | { type: 'SET_STREAMING'; payload: boolean }
    | { type: 'SET_DICE_ROLL'; payload: GameState['lastDiceRoll'] }
    | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
    | { type: 'SET_ACT'; payload: number }
    | { type: 'SET_SCENE'; payload: string }
    | { type: 'SET_API_KEY'; payload: string }
    | { type: 'SET_PROVIDER'; payload: string }
    | { type: 'SET_MODEL'; payload: string }
    | { type: 'SET_CUSTOM_API_URL'; payload: string }
    | { type: 'SET_API_MODE'; payload: 'default' | 'custom' }
    | { type: 'UPDATE_CHARACTER_STATS'; payload: Partial<Character['stats']> }
    | { type: 'UPDATE_CHARACTER_SKILLS'; payload: string[] }
    | { type: 'ADD_CHARACTER_SKILL'; payload: string }
    | { type: 'UPDATE_CHARACTER_INVENTORY'; payload: string[] }
    | { type: 'ADD_INVENTORY_ITEM'; payload: string }
    | { type: 'REMOVE_INVENTORY_ITEM'; payload: string }
    | { type: 'SET_CHARACTER_NAME'; payload: { name: string; nameEn: string } }
    | { type: 'SET_NPC_SATISFACTION'; payload: { npcName: string; satisfaction: number } }
    | { type: 'SET_NPC_STATUS'; payload: { npcName: string; status: 'active' | 'left' } }
    | { type: 'SET_DICE_STATE'; payload: DiceState }
    | { type: 'SET_CURRENT_CHECK'; payload: { attribute: string; dc: number; label: string } | null }
    | { type: 'ADVANCE_DAY' }
    | { type: 'ADD_REVENUE'; payload: number }
    | { type: 'ADD_XP'; payload: number }
    | { type: 'SET_INSPECTION_PASSED'; payload: boolean }
    | { type: 'HEAL_CHARACTER'; payload: number }
    | { type: 'DAMAGE_CHARACTER'; payload: number }
    | { type: 'ADD_INLINE_EVENT'; payload: InlineEvent }
    | { type: 'CLEAR_INLINE_EVENTS' }
    | { type: 'SET_SHOW_CHARACTER_CREATION'; payload: boolean }
    | { type: 'APPLY_DM_TAG_PATCH'; payload: { patch: DmTagPatch; messageIndex: number } }
    | { type: 'LOAD_STATE'; payload: Partial<GameState> }
    | { type: 'RESET_STATE' }
): GameState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.payload }],
      };
    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'assistant', content: action.payload }],
      };
    case 'APPEND_STREAMING_TEXT':
      return {
        ...state,
        displayedText: state.displayedText + action.payload,
      };
    case 'FINISH_STREAMING':
      return {
        ...state,
        isStreaming: false,
        displayedText: '',
        messages: [...state.messages, { role: 'assistant', content: action.payload }],
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };
    case 'SET_DICE_ROLL':
      return { ...state, lastDiceRoll: action.payload };
    case 'UPDATE_CHARACTER':
      return { ...state, character: { ...state.character, ...action.payload } };
    case 'SET_ACT':
      return { ...state, currentAct: action.payload };
    case 'SET_SCENE':
      return { ...state, currentScene: action.payload };
    case 'SET_API_KEY':
      return { ...state, userApiKey: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_CUSTOM_API_URL':
      return { ...state, customApiUrl: action.payload };
    case 'SET_API_MODE':
      return { ...state, apiMode: action.payload };
    case 'UPDATE_CHARACTER_STATS':
      return { ...state, character: { ...state.character, stats: { ...state.character.stats, ...action.payload } } };
    case 'UPDATE_CHARACTER_SKILLS':
      return { ...state, character: { ...state.character, skills: action.payload } };
    case 'ADD_CHARACTER_SKILL':
      if (state.character.skills.includes(action.payload)) return state;
      return { ...state, character: { ...state.character, skills: [...state.character.skills, action.payload] } };
    case 'UPDATE_CHARACTER_INVENTORY':
      return { ...state, character: { ...state.character, inventory: action.payload } };
    case 'ADD_INVENTORY_ITEM':
      if (state.character.inventory.includes(action.payload)) return state;
      return { ...state, character: { ...state.character, inventory: [...state.character.inventory, action.payload] } };
    case 'REMOVE_INVENTORY_ITEM':
      return { ...state, character: { ...state.character, inventory: state.character.inventory.filter(i => i !== action.payload) } };
    case 'SET_CHARACTER_NAME':
      return { ...state, character: { ...state.character, name: action.payload.name, nameEn: action.payload.nameEn } };
    case 'SET_NPC_SATISFACTION':
      return {
        ...state,
        npcRelations: state.npcRelations.map(npc =>
          npc.name === action.payload.npcName
            ? { ...npc, satisfaction: Math.max(0, Math.min(100, action.payload.satisfaction)) }
            : npc
        ),
      };
    case 'SET_NPC_STATUS':
      return {
        ...state,
        npcRelations: state.npcRelations.map(npc =>
          npc.name === action.payload.npcName
            ? { ...npc, status: action.payload.status }
            : npc
        ),
      };
    case 'SET_DICE_STATE':
      return { ...state, diceState: action.payload };
    case 'SET_CURRENT_CHECK':
      return { ...state, currentCheck: action.payload ?? undefined };
    case 'ADVANCE_DAY':
      return {
        ...state,
        mechanics: {
          ...state.mechanics,
          dayNumber: state.mechanics.dayNumber + 1,
          todayRevenue: 0,
        },
      };
    case 'ADD_REVENUE': {
      const newRevenue = state.mechanics.todayRevenue + action.payload;
      const targetMet = newRevenue >= state.mechanics.revenueTarget;
      const wasTargetMetToday = state.mechanics.todayRevenue >= state.mechanics.revenueTarget;
      return {
        ...state,
        mechanics: {
          ...state.mechanics,
          todayRevenue: newRevenue,
          consecutiveRevenueDays: targetMet
            ? wasTargetMetToday
              ? state.mechanics.consecutiveRevenueDays
              : state.mechanics.consecutiveRevenueDays + 1
            : 0,
        },
      };
    }
    case 'ADD_XP':
      return {
        ...state,
        mechanics: { ...state.mechanics, xp: state.mechanics.xp + action.payload },
      };
    case 'SET_INSPECTION_PASSED':
      return {
        ...state,
        mechanics: { ...state.mechanics, inspectionPassed: action.payload },
      };
    case 'HEAL_CHARACTER':
      return {
        ...state,
        character: {
          ...state.character,
          stats: {
            ...state.character.stats,
            hp: Math.min(state.character.stats.maxHp, state.character.stats.hp + action.payload),
          },
        },
      };
    case 'DAMAGE_CHARACTER':
      return {
        ...state,
        character: {
          ...state.character,
          stats: {
            ...state.character.stats,
            hp: Math.max(0, state.character.stats.hp - action.payload),
          },
        },
      };
    case 'RESET_STATE':
      return createInitialGameState();
    case 'ADD_INLINE_EVENT':
      return { ...state, inlineEvents: [...state.inlineEvents, action.payload] };
    case 'CLEAR_INLINE_EVENTS':
      return { ...state, inlineEvents: [] };
    case 'SET_SHOW_CHARACTER_CREATION':
      return { ...state, showCharacterCreation: action.payload };
    case 'APPLY_DM_TAG_PATCH': {
      const { patch, messageIndex } = action.payload;
      let character = state.character;
      let mechanics = state.mechanics;
      let npcRelations = state.npcRelations;
      let inlineEvents = state.inlineEvents;

      const pushInlineEvent = (type: InlineEvent['type'], value: string | number) => {
        const event: InlineEvent = {
          id: `${type}-${messageIndex}-${inlineEvents.length}`,
          type,
          value,
          afterMessageIndex: messageIndex,
        };
        inlineEvents = [...inlineEvents, event];
      };

      if (patch.hp !== undefined || patch.maxHp !== undefined) {
        const nextHp = patch.hp ?? character.stats.hp;
        const nextMaxHp = patch.maxHp ?? character.stats.maxHp;
        const clampedHp = Math.max(0, Math.min(nextMaxHp, nextHp));
        if (clampedHp !== character.stats.hp || nextMaxHp !== character.stats.maxHp) {
          const prevHp = character.stats.hp;
          character = {
            ...character,
            stats: {
              ...character.stats,
              hp: clampedHp,
              maxHp: nextMaxHp,
            },
          };
          if (clampedHp !== prevHp) {
            pushInlineEvent('hp_change', `${prevHp} -> ${clampedHp}`);
          }
        }
      }

      if (patch.addItems && patch.addItems.length > 0) {
        let nextInventory = character.inventory;
        for (const item of patch.addItems) {
          if (!nextInventory.includes(item)) {
            nextInventory = [...nextInventory, item];
            pushInlineEvent('item_add', item);
          }
        }
        if (nextInventory !== character.inventory) {
          character = { ...character, inventory: nextInventory };
        }
      }

      if (patch.removeItems && patch.removeItems.length > 0) {
        let nextInventory = character.inventory;
        for (const item of patch.removeItems) {
          if (nextInventory.includes(item)) {
            nextInventory = nextInventory.filter(i => i !== item);
            pushInlineEvent('item_remove', item);
          }
        }
        if (nextInventory !== character.inventory) {
          character = { ...character, inventory: nextInventory };
        }
      }

      if (patch.addSkills && patch.addSkills.length > 0) {
        let nextSkills = character.skills;
        for (const skill of patch.addSkills) {
          if (!nextSkills.includes(skill)) {
            nextSkills = [...nextSkills, skill];
            pushInlineEvent('skill_add', skill);
          }
        }
        if (nextSkills !== character.skills) {
          character = { ...character, skills: nextSkills };
        }
      }

      if (patch.xpGain && patch.xpGain > 0) {
        mechanics = { ...mechanics, xp: mechanics.xp + patch.xpGain };
        pushInlineEvent('xp', patch.xpGain);
      }

      if (patch.dayNumber !== undefined && patch.dayNumber > 0) {
        mechanics = { ...mechanics, dayNumber: patch.dayNumber, todayRevenue: 0 };
        pushInlineEvent('day_change', patch.dayNumber);
      }

      if (patch.addRevenue !== undefined && patch.addRevenue !== 0) {
        const newRevenue = mechanics.todayRevenue + patch.addRevenue;
        const targetMet = newRevenue >= mechanics.revenueTarget;
        const wasTargetMetToday = mechanics.todayRevenue >= mechanics.revenueTarget;
        mechanics = {
          ...mechanics,
          todayRevenue: Math.max(0, newRevenue),
          consecutiveRevenueDays: targetMet
            ? wasTargetMetToday
              ? mechanics.consecutiveRevenueDays
              : mechanics.consecutiveRevenueDays + 1
            : 0,
        };
        pushInlineEvent('revenue_change', patch.addRevenue);
      }

      if (patch.npcDeltas && patch.npcDeltas.length > 0) {
        const deltaMap = new Map<string, number>();
        for (const { npcName, delta } of patch.npcDeltas) {
          deltaMap.set(npcName, (deltaMap.get(npcName) ?? 0) + delta);
        }
        npcRelations = npcRelations.map(npc => {
          const delta = deltaMap.get(npc.name);
          if (delta === undefined) return npc;
          return {
            ...npc,
            satisfaction: Math.max(0, Math.min(100, npc.satisfaction + delta)),
          };
        });
      }

      if (patch.name !== undefined || patch.nameEn !== undefined || (patch.stats && Object.keys(patch.stats).length > 0)) {
        character = {
          ...character,
          name: patch.name ?? character.name,
          nameEn: patch.nameEn ?? character.nameEn,
          stats: patch.stats && Object.keys(patch.stats).length > 0
            ? { ...character.stats, ...patch.stats }
            : character.stats,
        };
      }

      return {
        ...state,
        character,
        mechanics,
        npcRelations,
        inlineEvents,
      };
    }
    case 'LOAD_STATE': {
      const loaded = action.payload;
      return {
        ...state,
        ...loaded,
        character: {
          ...state.character,
          ...loaded.character,
          stats: {
            ...state.character.stats,
            ...(loaded.character?.stats ?? {}),
          },
        },
        mechanics: {
          ...state.mechanics,
          ...(loaded.mechanics ?? {}),
        },
        npcRelations: loaded.npcRelations ?? state.npcRelations,
        inlineEvents: loaded.inlineEvents ?? state.inlineEvents,
        messages: loaded.messages ?? state.messages,
        currentCheck: loaded.currentCheck ?? state.currentCheck,
      };
    }
    default:
      return state;
  }
};
