/**
 * GM Agent System Prompt 构建器
 * 负责组合规则书、世界观、当前剧情状态和场景内容
 */

import { promises as fs } from 'fs';
import { join } from 'path';

// 游戏状态接口（简化版）
interface GameState {
  playerName: string;
  currentLocation: string;
  inventory: string[];
  storyProgress: Record<string, any>;
  characterRelationships: Record<string, number>;
  visitedScenes: string[];
  flags: Record<string, boolean>;
}

// GM 风格配置
interface GMStyle {
  tone: string;
  pacing: string;
  emphasis: string[];
}

/**
 * 构建 GM Agent 的完整 system prompt
 */
export async function buildGMSystemPrompt(
  gameState: GameState,
  userAction?: string
): Promise<string> {
  const parts: string[] = [];

  // 1. 基础身份设定
  parts.push(buildIdentityPrompt());

  // 2. 规则书内容
  parts.push(await loadRulebook());

  // 3. 世界观设定
  parts.push(await loadWorldBuilding());

  // 4. 当前场景内容
  parts.push(await loadCurrentScene(gameState.currentLocation));

  // 5. 剧情状态
  parts.push(buildStoryState(gameState));

  // 6. 当前用户行为（如果有）
  if (userAction) {
    parts.push(`\n【玩家当前行为】\n${userAction}`);
  }

  // 7. 输出格式要求
  parts.push(buildOutputFormat());

  return parts.join('\n\n---\n\n');
}

/**
 * GM 基础身份设定
 */
function buildIdentityPrompt(): string {
  return `【身份设定】
你是《伊格尼斯酒馆》(Ignis Tavern) 的游戏主持人（Game Master）。

你的职责：
1. 引导玩家体验这个美食与悬疑交织的奇幻世界
2. 根据玩家的选择推进剧情发展
3. 管理 NPC 的反应和对话
4. 维护游戏世界的逻辑一致性
5. 营造悬疑氛围，逐步揭示隐藏的秘密

你的风格：
- 语气友好但带有神秘感
- 善于观察细节，给予玩家探索空间
- 对食物描写生动诱人
- 在轻松表面下暗流涌动
- 尊重玩家选择，不强迫剧情走向`;
}

/**
 * 加载规则书（中文版）
 */
async function loadRulebook(): Promise<string> {
  try {
    // 尝试从项目根目录读取
    const rulebookPath = join(process.cwd(), '..', '..', 'rules', 'rulebook_zh.md');
    const content = await fs.readFile(rulebookPath, 'utf-8');
    return `【规则书】\n${content}`;
  } catch {
    // 如果文件不存在，返回默认规则
    return `【规则书】
游戏机制：
- 这是一个基于对话的叙事游戏
- 玩家通过自然语言输入行动
- GM 根据规则和世界设定做出响应
- 没有固定数值系统，重点是叙事和选择
- NPC 有自己的性格和秘密，需要玩家去发现
- 食物在游戏中扮演重要角色，是重要的剧情元素`;
  }
}

/**
 * 加载世界观设定（中文版）
 */
async function loadWorldBuilding(): Promise<string> {
  try {
    const worldPath = join(process.cwd(), '..', '..', 'lore', 'worldbuilding_zh.md');
    const content = await fs.readFile(worldPath, 'utf-8');
    return `【世界观】\n${content}`;
  } catch {
    return `【世界观】
伊格尼斯 (Ignis) —— 美食之城

这是一座以烹饪艺术闻名的城市， Culinary Arts 是这里最崇高的追求。
城市的每个角落都飘散着诱人的香气，从街头小吃到高级餐厅，美食无处不在。
然而，在这看似完美的表象下，隐藏着不为人知的秘密。

关键元素：
- 美食至上：厨艺决定社会地位
- 神秘失踪：近期有人离奇消失
- 食材黑市：稀有食材的地下交易
- 古老食谱：传说中有禁忌的力量`;
  }
}

/**
 * 加载当前场景内容（中文版）
 */
async function loadCurrentScene(location: string): Promise<string> {
  try {
    const scenePath = join(process.cwd(), '..', '..', 'scenes', `${location}_zh.md`);
    const content = await fs.readFile(scenePath, 'utf-8');
    return `【当前场景：${location}】\n${content}`;
  } catch {
    return `【当前场景：${location}】
场景中弥漫着温暖的烛光和各种香料混合的香气。
你可以四处查看，与在场的人交谈，或者品尝正在烹饪中的美食。`;
  }
}

/**
 * 构建剧情状态描述
 */
function buildStoryState(gameState: GameState): string {
  const parts: string[] = ['【剧情状态】'];

  // 玩家信息
  parts.push(`玩家名称：${gameState.playerName || '未设置'}`);
  parts.push(`当前位置：${gameState.currentLocation}`);

  // 背包
  if (gameState.inventory.length > 0) {
    parts.push(`背包物品：${gameState.inventory.join('、')}`);
  }

  // 访问过的场景
  if (gameState.visitedScenes.length > 0) {
    parts.push(`已探索地点：${gameState.visitedScenes.join('、')}`);
  }

  // NPC 关系
  const relationships = Object.entries(gameState.characterRelationships);
  if (relationships.length > 0) {
    parts.push('角色关系：');
    for (const [npc, value] of relationships) {
      const status = value > 50 ? '友好' : value < 0 ? '敌意' : '中立';
      parts.push(`  - ${npc}：${status} (${value})`);
    }
  }

  // 关键进度
  const progress = Object.entries(gameState.storyProgress);
  if (progress.length > 0) {
    parts.push('剧情进度：');
    for (const [key, value] of progress) {
      parts.push(`  - ${key}：${value}`);
    }
  }

  // 标记
  const flags = Object.entries(gameState.flags).filter(([_, v]) => v);
  if (flags.length > 0) {
    parts.push('已获得信息：');
    for (const [flag] of flags) {
      parts.push(`  - ${flag}`);
    }
  }

  return parts.join('\n');
}

/**
 * 输出格式要求
 */
function buildOutputFormat(): string {
  return `【输出格式要求】
请以以下结构回应：

1. 场景描写（2-4句话，营造氛围）
2. NPC反应（如果有NPC在场，描述他们的行动或对话）
3. 发生什么（根据玩家行为推进剧情）
4. 选项提示（列出2-4个明显的行动选择，保持开放性）

规则：
- 不要使用"你来到了..."这种元叙事
- 保持第二人称视角（"你看到了..."）
- 每次回应控制在200-400字
- 给玩家留下探索空间，不要过度引导`;
}

/**
 * 工具函数：获取文件内容（带缓存）
 */
const fileCache = new Map<string, string>();

export async function getFileContent(relativePath: string): Promise<string | null> {
  // 检查缓存
  if (fileCache.has(relativePath)) {
    return fileCache.get(relativePath)!;
  }

  try {
    const fullPath = join(process.cwd(), '..', '..', relativePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    fileCache.set(relativePath, content);
    return content;
  } catch {
    return null;
  }
}

/**
 * 清除文件缓存
 */
export function clearFileCache(): void {
  fileCache.clear();
}
