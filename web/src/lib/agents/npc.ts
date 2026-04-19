/**
 * NPC Agent System Prompt 构建器
 * 根据角色名返回对应的 system prompt
 */

import { promises as fs } from 'fs';
import { join } from 'path';

// NPC 基础性格类型
interface NPCPersonality {
  traits: string[];
  speechPattern: string;
  agenda: string;
  secret: string;
}

// 已知角色配置
const knownNPCs: Record<string, NPCPersonality> = {
  elara: {
    traits: ['优雅', '神秘', '观察力敏锐', '有所保留'],
    speechPattern: '说话轻缓，常用隐喻，偶尔停顿像是在权衡该说什么',
    agenda: '保护酒馆的某些秘密，同时观察外来者',
    secret: '知道一些关于失踪事件的信息，但不完全信任玩家',
  },
  marcus: {
    traits: ['热情', '健谈', '爱炫耀', '略显焦虑'],
    speechPattern: '语速快，经常自夸厨艺，但提到某些话题会突然沉默',
    agenda: '想证明自己的厨艺是最好的，同时掩盖自己的债务问题',
    secret: '欠了黑市的钱，不得不为他们处理一些"特殊食材"',
  },
  freya: {
    traits: ['直率', '警惕', '街头智慧', '忠诚'],
    speechPattern: '用词直接，带有城市底层口音，不信任花言巧语',
    agenda: '保护弱势群体，调查失踪事件',
    secret: '她知道谁在幕后操纵，但缺乏证据',
  },
  silas: {
    traits: ['苍老', '慈祥', '健忘', '睿智'],
    speechPattern: '语速缓慢，经常回忆往事，偶尔说出意味深长的话',
    agenda: '维持酒馆的传统和秩序',
    secret: '知道古老食谱的真相，曾亲眼见过其力量',
  },
  liam: {
    traits: ['年轻', '好奇', '紧张', '求知若渴'],
    speechPattern: '急切，经常打断自己，对新事物充满好奇',
    agenda: '学习厨艺，但真正的目的是寻找失踪的妹妹',
    secret: '妹妹的失踪与某个高级餐厅有关',
  },
};

/**
 * 构建指定 NPC 的 system prompt
 */
export async function buildNPCSystemPrompt(
  npcName: string,
  relationship: number = 0 // -100 到 100，负数敌对，正数友好
): Promise<string> {
  const lowerName = npcName.toLowerCase();
  
  // 尝试从文件加载角色卡
  const characterCard = await loadCharacterCard(lowerName);
  
  if (characterCard) {
    return buildPromptFromCard(characterCard, relationship);
  }
  
  // 使用内置角色配置
  if (knownNPCs[lowerName]) {
    return buildPromptFromConfig(lowerName, knownNPCs[lowerName], relationship);
  }
  
  // 未知角色，生成通用配置
  return buildGenericNPCPrompt(npcName, relationship);
}

/**
 * 从文件加载角色卡
 */
async function loadCharacterCard(npcName: string): Promise<string | null> {
  try {
    const cardPath = join(process.cwd(), '..', '..', 'characters', `${npcName}_zh.md`);
    const content = await fs.readFile(cardPath, 'utf-8');
    return content;
  } catch {
    return null;
  }
}

/**
 * 从角色卡构建 prompt
 */
function buildPromptFromCard(cardContent: string, relationship: number): string {
  const relationPrompt = getRelationshipPrompt(relationship);
  
  return `【NPC 角色卡】
${cardContent}

【当前关系】
${relationPrompt}

【扮演规则】
1. 完全代入这个角色，用你的性格、知识和目标说话
2. 你有秘密，不会在没有信任的情况下透露
3. 根据对话推进，可以逐渐改变对玩家的态度
4. 使用你的说话方式，保持一致性
5. 不要跳出角色解释"我为什么这么说"
6. 必要时可以主动提供信息、提问或拒绝回答
7. 回应应该自然，长度适中（2-5句话）`;
}

/**
 * 从配置构建 prompt
 */
function buildPromptFromConfig(
  name: string,
  config: NPCPersonality,
  relationship: number
): string {
  const relationPrompt = getRelationshipPrompt(relationship);
  
  return `【角色设定：${name}】

性格特质：
${config.traits.map(t => `- ${t}`).join('\n')}

说话方式：
${config.speechPattern}

目标/动机：
${config.agenda}

秘密（不会主动透露）：
${config.secret}

【当前关系】
${relationPrompt}

【扮演规则】
1. 完全代入这个角色，用你的性格、知识和目标说话
2. 你有秘密，不会在没有信任的情况下透露
3. 根据对话推进，可以逐渐改变对玩家的态度
4. 使用你的说话方式，保持一致性
5. 不要跳出角色解释"我为什么这么说"
6. 必要时可以主动提供信息、提问或拒绝回答
7. 回应应该自然，长度适中（2-5句话）`;
}

/**
 * 为未知角色生成通用 prompt
 */
function buildGenericNPCPrompt(name: string, relationship: number): string {
  const relationPrompt = getRelationshipPrompt(relationship);
  
  return `【角色设定：${name}】

你是《伊格尼斯酒馆》中的一个角色。

背景：
- 你是这座美食之城的居民
- 你在这个场景中做着符合身份的事情
- 你有自己的生活、秘密和烦恼
- 你听说过一些关于近期失踪事件的传言

性格：
- 根据场景和对话自然展现性格
- 保持神秘，不是所有事情都会告诉陌生人
- 对食物的品味能反映一个人的层次

【当前关系】
${relationPrompt}

【扮演规则】
1. 完全代入这个角色，自然回应
2. 你是一个有血有肉的人，有自己的立场
3. 可以用食物、天气等话题开启对话
4. 回应应该自然，长度适中（2-5句话）`;
}

/**
 * 根据关系值生成关系描述
 */
function getRelationshipPrompt(relationship: number): string {
  if (relationship <= -50) {
    return '你对玩家抱有敌意或不信任。你不会主动帮助，可能在找机会捉弄或阻碍。';
  } else if (relationship < 0) {
    return '你对玩家持怀疑态度。你会礼貌回应，但有所保留。';
  } else if (relationship === 0) {
    return '你对玩家是陌生人态度。中立、好奇、观望。';
  } else if (relationship < 50) {
    return '你对玩家有一定好感。愿意提供信息和帮助，但仍有所保留。';
  } else {
    return '你信任玩家，视其为朋友。可能愿意分享秘密或提供重要协助。';
  }
}

/**
 * 批量获取多个 NPC 的 prompts
 */
export async function buildMultipleNPCPrompts(
  npcs: { name: string; relationship: number }[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  for (const npc of npcs) {
    results[npc.name] = await buildNPCSystemPrompt(npc.name, npc.relationship);
  }
  
  return results;
}
