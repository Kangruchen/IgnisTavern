import { NextRequest, NextResponse } from 'next/server';
import { GameState } from '@/lib/gameState';

export interface ChatRequest {
  gameState: GameState;
  choice?: string;
  diceRoll?: {
    result: number;
    success: boolean;
  };
}

export interface ChatResponse {
  dialogue: {
    id: string;
    speaker?: string;
    speakerEn?: string;
    text: string;
    textEn: string;
  };
  choices?: {
    id: string;
    text: string;
    textEn: string;
    nextId?: string;
  }[];
  requiresDice?: boolean;
  diceDifficulty?: number;
  characterUpdate?: Partial<GameState['character']>;
  actChange?: number;
}

// Simple story progression for MVP
const storyNodes: Record<string, ChatResponse> = {
  intro: {
    dialogue: {
      id: 'intro-resp',
      text: '酒馆的门上挂着褪色的木牌，写着"伊格尼斯酒馆"。厨房里传出香料的气味，但你注意到案板旁有一本奇怪的食谱，封面已经泛黄发脆。',
      textEn: 'A faded wooden sign hangs on the tavern door: "Ignis Tavern." The smell of spices drifts from the kitchen, but you notice a peculiar cookbook beside the cutting board, its cover yellowed and brittle.',
    },
    choices: [
      { id: 'check_signboard', text: '查看酒馆招牌', textEn: 'Check the signboard' },
      { id: 'enter_kitchen', text: '走进厨房', textEn: 'Enter the kitchen' },
      { id: 'look_recipe', text: '翻看食谱', textEn: 'Check the recipe book' },
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { gameState, choice, diceRoll } = body;

    // Simple mock response for MVP
    // In production, this would call an LLM API
    
    if (diceRoll) {
      // Handle dice roll response
      return NextResponse.json({
        dialogue: {
          id: Date.now().toString(),
          speaker: '系统',
          speakerEn: 'System',
          text: diceRoll.success 
            ? `你掷出了 ${diceRoll.result}，成功了！`
            : `你掷出了 ${diceRoll.result}，失败...`,
          textEn: diceRoll.success
            ? `You rolled ${diceRoll.result}, success!`
            : `You rolled ${diceRoll.result}, failure...`,
        },
        choices: gameState.choices,
      });
    }

    // Generate response based on choice
    const responses: Record<string, Partial<ChatResponse>> = {
      check_signboard: {
        dialogue: {
          id: 'signboard',
          text: '木牌上的字迹有些斑驳："伊格尼斯酒馆 - 自 1847 年经营至今"。你发现木牌的右下角刻着一行小字："记忆的味道"。',
          textEn: 'The letters on the wooden sign are a bit worn: "Ignis Tavern - Established 1847." You notice a small inscription in the corner: "The taste of memory."',
        },
      },
      enter_kitchen: {
        dialogue: {
          id: 'kitchen',
          text: '厨房里蒸汽缭绕，大锅里的炖菜咕嘟作响。一位戴着高帽的红发厨师背对着你，正在专注地搅拌着什么。',
          textEn: 'Steam fills the kitchen, the stew in the great pot bubbling away. A tall, red-hat chef with fiery hair has their back to you, stirring something intently.',
        },
      },
      look_recipe: {
        dialogue: {
          id: 'recipe',
          text: '食谱的纸张已经泛黄，前几页记录着常见的菜品，但越往后翻，配料表越让人不安。",最后一页夹着一张纸条："真正的食材...在街头。"',
          textEn: 'The recipe pages are yellowed. The first few pages contain common dishes, but as you flip further, the ingredient lists become more unsettling. In the last page, a note: "The true ingredients... are on the streets."',
        },
        requiresDice: true,
        diceDifficulty: 12,
      },
    };

    const response = choice && responses[choice] ? responses[choice] : storyNodes.intro;

    // Ensure dialogue has all required fields
    const fullResponse: ChatResponse = {
      dialogue: {
        id: response.dialogue?.id || Date.now().toString(),
        speaker: response.dialogue?.speaker,
        speakerEn: response.dialogue?.speakerEn,
        text: response.dialogue?.text || '...',
        textEn: response.dialogue?.textEn || '...',
      },
      choices: response.choices || gameState.choices,
      requiresDice: response.requiresDice,
      diceDifficulty: response.diceDifficulty,
      characterUpdate: response.characterUpdate,
      actChange: response.actChange,
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(fullResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
