# Ignis Tavern / 伊格尼斯酒馆

> **An AI-powered tabletop RPG experience set in the culinary metropolis of Ignis.**
> 一款以美食之城伊格尼斯为背景的 AI 驱动桌面角色扮演游戏。

🔗 **Play now: [ignis-tavern.vercel.app](https://ignis-tavern.vercel.app/)**

---

## English

### What is Ignis Tavern?

**Ignis Tavern** is an AI-driven tabletop roleplaying game available in two formats:
- **Web App** — Browser-based experience with front-end driven game mechanics, deployed on Vercel
- **OpenClaw Skill** — Play directly in your OpenClaw chat (skill version)

Players take on the role of a new tavern owner in the bustling city of **Ignis** — a massive neutral city-state famous for its endless culinary delights, thriving night markets, and the eternal "Sacred Flame" that never goes out.

### The Story

Your tavern is failing. Three eccentric employees are already here — on probation, deciding whether you're worth staying for. You must earn their trust, revive the business, discover the dark truth behind the city's prosperity, and ultimately face an impossible moral dilemma that will test the bonds of friendship itself.

### Features

- **AI Dungeon Master** — Dynamic storytelling powered by large language models
- **Front-End Driven Mechanics** — Character creation, dice checks, and inventory managed by UI (web version)
- **Dice State Machine** — `idle → awaiting_roll → roll_resolved`, prevents DM from peeking at results before the player rolls
- **Inline Cards** — Game events (dice checks, item changes, HP) appear as embedded cards in the chat flow
- **Progressive Prompt Loading** — Only the context needed for the current phase is injected (opening phase reduced from ~12k to ~4.4k tokens, -63%)
- **Character Customization** — Template selection or quiz-based generation
- **Branching Narrative** — Choices matter; your decisions shape the story across three acts and seven endings
- **Save/Load System** — Save progress to JSON files (Skill version) or local storage + file export (Web version)
- **Bilingual** — Full Chinese (中文) and English support

### The Three-Act Structure

| Act | Theme | Synopsis |
|-----|-------|----------|
| **Act I** | Comedy / Slice-of-Life | Earn your team's loyalty, revive your tavern, qualify for the Sacred Flame Gourmet Festival |
| **Act II** | Dark Revelation | Uncover that the city's prosperity is built on a demonic bargain |
| **Act III** | Moral Climax | Face the Trolley Problem — save your family or save the city. Seven endings |

---

## 中文

### 什么是伊格尼斯酒馆？

**伊格尼斯酒馆** 是一款 AI 驱动的桌面角色扮演游戏，提供两种游玩方式：
- **Web 版** — 基于浏览器的独立体验，前端驱动的游戏机制，已部署在 Vercel
- **OpenClaw Skill** — 在 OpenClaw 对话中直接游玩

玩家扮演"炉火之都"伊格尼斯城中一家濒临倒闭的酒馆的新老板，在这个以无尽美食、繁华夜市和永不熄灭的"圣焰"闻名的巨大中立城邦中展开冒险。

### 故事简介

酒馆生意惨淡。三位古怪的"员工"已经在酒馆里等着——他们在试用期，正在评估你这个新老板靠不靠谱。你必须赢得他们的信任，振兴酒馆，挖掘城市繁荣背后的黑暗真相，并最终面对一个考验友情羁绊的艰难抉择。

### 核心功能

- **AI 主持人（DM）** — 大语言模型驱动的动态叙事
- **前端驱动机制** — 角色创建、骰子检定、背包管理由 UI 控制（Web 版）
- **骰子状态机** — `idle → awaiting_roll → roll_resolved`，防止 DM 在玩家投骰前偷看结果
- **内嵌卡片** — 游戏事件（检定、物品变化、HP）以卡片形式嵌入聊天流
- **渐进式 Prompt 加载** — 只注入当前阶段所需上下文（开场阶段从 ~12k 降至 ~4.4k tokens，-63%）
- **角色创建** — 预设模板选择或问答生成
- **分支剧情** — 选择会影响剧情走向，三幕七个结局
- **存档系统** — 保存进度到 JSON 文件（Skill 版）或本地存储 + 文件导出（Web 版）
- **双语支持** — 中文 / English

### 三幕结构

| 幕 | 主题 | 简介 |
|----|------|------|
| **第一幕** | 喜剧 / 日常 | 赢得员工信任、振兴酒馆、获得圣焰美食大赏参赛资格 |
| **第二幕** | 黑暗真相 | 发现城市繁荣建立在恶魔交易之上 |
| **第三幕** | 道德高潮 | 面对电车难题——救家人还是救城市。七个结局 |

---

## Quick Start / 快速开始

### Web 版 / Web Version

👉 **直接游玩 / Play now**: [ignis-tavern.vercel.app](https://ignis-tavern.vercel.app/)

- 无需安装，打开即玩 / No installation required
- 内置免费额度（10次/天），也可配置自己的 API Key / Built-in free quota (10/day) or bring your own API key
- 点击右上角 🔑 配置 API Key / Click 🔑 to configure

<details>
<summary>本地开发 / Local Development</summary>

```bash
cd web && npm install
cp web/.env.example web/.env.local   # optional, for custom fallback keys
cd web && npm run dev
```

Open http://localhost:3000

</details>

### Skill 版 / Skill Version

1. **下载仓库** Clone the repository:
   ```bash
   git clone https://github.com/Kangruchen/IgnisTavern.git
   ```

2. **复制到 skills 目录** Copy to OpenClaw's workspace skills directory:
   ```bash
   # Windows
   xcopy /E /I IgnisTavern %USERPROFILE%\.openclaw\workspace\skills\ignis-tavern

   # macOS / Linux
   cp -r IgnisTavern ~/.openclaw/workspace/skills/ignis-tavern
   ```

3. **开始游戏** Start the game by saying:
   ```
   玩伊格尼斯酒馆
   ```
   or: `play Ignis Tavern`

---

## 游戏流程 / Game Flow

### Web 版流程

1. **欢迎词** — DM 输出伊格尼斯城介绍
2. **角色创建** — 前端内嵌卡片，选择模板或问答生成
3. **开场叙事** — DM 按场景文件逐字照搬第一幕开场
4. **游戏循环** — 玩家行动 → DM 叙事 → `[CHAR:...]` 标签自动解析 → 骰子/物品/HP 内嵌卡片 → 继续
5. **阶段推进** — DM 输出 `[PHASE_TRANSITION:xxx]` → 前端检测并切换阶段 → `buildGMPrompt()` 重新构建对应 prompt
6. **三幕完整** — 第一幕经营 → 第二幕调查/揭露 → 第三幕对峙 → 七个结局

### Skill 版流程

1. **选择语言** — 中文 / English
2. **创建角色** — DM 引导选择模板或问答
3. **第一幕** — 经营酒馆，赢得三位员工的信任，通过资格确认
4. **第二幕** — 调查城市真相，三条路线（档案馆/黑市/圣焰广场），揭露黑暗秘密
5. **第三幕** — 面对最终抉择，七个不同结局
6. **保存进度** — 随时说"保存"生成存档文件，上传存档即可继续游戏

---

## Prompt Architecture / Prompt 架构

### Skill 版：LLM 驱动，文件按需读取

The AI DM reads `SKILL.md` as the entry point and follows the session flow template, loading scene/prompt files directly during conversation. No code builds the prompt — the DM is the one who "fetches" the content.

```
SKILL.md (session flow template)
  → references scene file paths
  → DM reads files manually as needed
  → character creation guided via dm_behavior + phases/
```

**Delivery**: The DM controls the pace, reads files on-demand, and guides character creation through multi-turn dialogue.

### Web 版：代码驱动，渐进式注入

The `buildGMPrompt(language, phase)` function in `route.ts` runs server-side, composes the system prompt based on the current phase, and sends it to the LLM. Character creation is handled entirely by the front-end UI — the DM never touches that flow.

```
buildGMPrompt(language, phase)
  ├── Always: system + dm_behavior + web_dm_rules
  ├── Conditional by phase:
  │   ├── character_creation → phases/character_creation only
  │   ├── opening → phases/opening + scene (self-contained)
  │   └── act1+ → world + characters + rules + scene (full)
  └── Phase-closing reminder injected at end
```

| Phase | Loaded Content | Token Reduction |
|-------|---------------|-----------------|
| `character_creation` | system + dm_behavior + web_dm_rules + phases/character_creation | — |
| `opening` | above + phases/opening + act1_opening scene | ~4.4k (-63% vs old ~12k) |
| `act1+` | full: + world + characters + rules + scene | full context for mechanics |

**Delivery**: Code reads files with `fs.readFileSync`, composes the complete system prompt in one shot. The front-end detects `[PHASE_TRANSITION:xxx]` tags and `[CHAR:...]` DM tags to update game state.

**Key Difference**: Skill = DM reads files. Web = Code builds and feeds files.

---

## 💾 Save/Load / 存档系统

### Web 版 / Web Version

- **自动保存** — 每 30 秒自动保存到浏览器本地存储 / Auto-saves to local storage every 30 seconds
- **导出存档** — 点击"导出存档"下载 JSON 文件 / Click "Export Save" to download a JSON file
- **导入存档** — 点击"导入存档"上传之前的 JSON 文件恢复进度 / Click "Import Save" to restore from a JSON file

### Skill 版 / Skill Version

**保存游戏 / Save Progress**:
- 说 `save` 或 `保存` — AI 会生成一个 JSON 存档文件附件
- Download the file and keep it safe / 下载文件并妥善保存

**加载游戏 / Load Progress**:
- 直接上传之前保存的 JSON 文件 — AI 会自动读取并恢复游戏状态
- Upload your previously saved JSON file — AI will automatically restore the game state

**存档内容 / Save Data Includes**:
- Character stats, HP, XP, skills / 角色属性、生命值、经验、技能
- Current scene and day count / 当前场景和游戏天数
- NPC relationships and satisfaction / NPC 关系和满意度
- Inventory items / 背包物品
- Story progress and choices / 剧情进度和选择

**自动保存触发点 / Auto-save Triggers**:
- After character creation / 角色创建完成后
- End of each in-game day / 每天结束时
- Act transitions / 幕间切换时
- Before major choices / 重大选择前

---

## 项目结构 / Project Structure

```
ignis-tavern/
├── SKILL.md                       # OpenClaw skill entry point
├── README.md                      # This file
├── src/                           # Shared game data (single source of truth)
│   ├── prompts/                   # AI prompts & world-building
│   │   ├── system_zh/en.md        # DM system prompt
│   │   ├── dm_behavior_zh/en.md   # DM behavior rules (profanity, pacing, options)
│   │   ├── web_dm_rules_zh/en.md  # Web DM rules ([CHAR:...] tag protocol)
│   │   ├── world_zh/en.md         # World setting
│   │   ├── characters/            # NPC profiles
│   │   │   ├── yu_zh/en.md        #   Yu (雨) — Head Chef
│   │   │   ├── huan_zh/en.md      #   Huan (焕) — Fighter
│   │   │   └── licht_zh/en.md     #   Licht (利希特) — Paladin / Guardian
│   │   └── phases/                # Phase-specific instructions
│   │       ├── character_creation_zh/en.md
│   │       ├── opening_zh/en.md
│   │       ├── act1_zh/en.md
│   │       ├── act2_zh/en.md
│   │       └── act3_zh/en.md
│   ├── scenes/                    # Scene scripts (per-act, per-language)
│   │   ├── act1_opening_zh/en.md
│   │   ├── act1_tavern_management_zh/en.md
│   │   ├── act1_qualification_zh/en.md
│   │   ├── act2_investigation_zh/en.md
│   │   ├── act2_revelation_zh/en.md
│   │   ├── act3_opening_zh/en.md
│   │   ├── act3_confrontation_zh/en.md
│   │   ├── act3_endings_zh/en.md
│   │   └── shared/                # Act II/III shared scenes
│   │       ├── act2_main_zh/en.md
│   │       └── act3_main_zh/en.md
│   ├── rules/
│   │   └── RULES_zh/en.md         # Game rules (d20, attributes, skills)
│   ├── npc/                       # NPC deep dialogue (Act II)
│   │   ├── huan/dialogue/act2_revelation_zh/en.md
│   │   ├── licht/dialogue/act2_licht_sense_zh/en.md
│   │   └── yu/dialogue/act2_yu_reaction_zh/en.md
│   └── schemas/
│       ├── savegame.json          # Save game JSON schema
│       ├── savegame_example.json  # Example save (Chinese)
│       └── savegame_example_en.json # Example save (English)
├── web/                           # Web app (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/chat/route.ts  # Server-side chat API with provider fallback
│   │   │   └── game/page.tsx      # Game page (main game logic)
│   │   ├── components/
│   │   │   ├── InlineCharacterCreation.tsx  # UI-driven character creation card
│   │   │   ├── InlineDiceCheck.tsx          # Inline dice roll card (3-stage)
│   │   │   ├── InlineNotification.tsx       # Item/HP/XP notification cards
│   │   │   ├── CharacterSheet.tsx           # Side panel character sheet
│   │   │   ├── CharacterPortrait.tsx        # NPC portraits
│   │   │   ├── SaveLoadButtons.tsx          # Save/load with file export/import
│   │   │   ├── ApiKeyModal.tsx              # API key configuration
│   │   │   ├── ChatInput.tsx                # Chat input with auto-resize
│   │   │   ├── DiceRoller.tsx               # Standalone dice roller
│   │   │   ├── StreamingText.tsx            # Typewriter effect
│   │   │   └── LanguageSelector.tsx         # CN/EN toggle
│   │   ├── lib/
│   │   │   ├── agents/
│   │   │   │   ├── gm.ts         # Progressive prompt builder (buildGMPrompt)
│   │   │   │   ├── narrator.ts   # Narrator agent system prompt
│   │   │   │   └── npc.ts        # NPC agent system prompt builder
│   │   │   ├── gameState.ts      # Reducer-based game state + [CHAR:...] tag patch
│   │   │   ├── diceMachine.ts    # Dice state machine + DC parsing
│   │   │   ├── api.ts            # Streaming chat API client
│   │   │   ├── llm.ts            # Multi-provider LLM streaming
│   │   │   ├── providers.ts      # 8 provider configs + model lists
│   │   │   ├── fetchModels.ts    # Dynamic model list fetching
│   │   │   ├── storage.ts        # Browser save/load
│   │   │   └── settings.ts       # Settings persistence
│   │   └── data/                 # Web version data (synced from src/)
│   │       ├── prompts/          # Same structure as src/prompts/
│   │       ├── scenes/           # Same as src/scenes/ (no shared/ subfolder)
│   │       ├── rules/            # Same as src/rules/
│   │       └── npc/              # Same as src/npc/
│   └── package.json
└── LICENSE                        # MIT License
```

### 两版差异 / Version Differences

| Feature | Skill 版 | Web 版 |
|---------|---------|--------|
| **角色创建** | LLM 引导（多轮对话） | 前端 UI 驱动（内嵌卡片） |
| **骰子检定** | 纯文本描述结果 | 状态机 + 动画 + 公式展示 |
| **状态追踪** | DM 纯文本标注（`HP: 4/5`） | `[CHAR:...]` 标签自动解析 |
| **物品/技能** | DM 叙事描述 | 内嵌通知卡片 |
| **存档系统** | JSON 文件附件上传/下载 | 浏览器本地存储 + 文件导出/导入 |
| **阶段推进** | DM 按流程切换 | `[PHASE_TRANSITION:xxx]` 标签检测 |
| **Prompt 构建** | DM 按需读文件 | `buildGMPrompt()` 代码组合注入 |
| **API 限制** | 无（用用户的 key） | 免费 10 次/天 + 自带 key |
| **多模型** | 用户的模型 | 8 个 provider 自动 fallback |

---

## 核心机制 / Core Mechanics

| 机制 | 说明 |
|------|------|
| **d20 检定** | 属性修正 + d20 vs DC，前端骰子组件（Web）/ 纯文本（Skill） |
| **暗骰** | NPC 态度/声誉变化 DM 暗投，只通过行为表现传达，绝不展示数字 |
| **[CHAR:...] 标签协议** | DM 输出标签（如 `[CHAR:hp=4/6]` `[CHAR:item+=生锈钥匙]`），前端自动解析为状态更新和内嵌卡片（Web 版） |
| **角色亮点 XP** | 精彩 RP 行为奖励 XP，DM 主动宣布 |
| **NPC 满意度** | 玩家行为影响满意度（0-100），阈值：>70 积极 / 40-70 正常 / 20-40 抱怨 / <20 威胁离开 |
| **营收目标** | 每日营收目标 100 金，连续 3 天达标解锁资格 |
| **HP 系统** | 基础 5 + 体魄修正（STR modifier），受伤/恢复，HP=0 不死亡而是后果选项 |

---

## Contributors / 贡献者

- **Kaci** ([@Kangruchen](https://github.com/Kangruchen)) — Project lead, game design, web front-end, prompt engineering
- **SilbernerW** ([@Zhexi7777777](https://github.com/Zhexi7777777)) — Web front-end, save/load system, skill version content
- **Zhexi** — Web front-end, language switching, CharacterSheet, bug fixes

---

## License / 许可证

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

本项目采用 **MIT 许可证**。详情请参阅 [LICENSE](LICENSE)。
