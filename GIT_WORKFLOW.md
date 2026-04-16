# Git 协作指南

## 基本原则

1. **不直接 push 到 main** — 所有人通过 PR 合入
2. **不修改别人的文件** — 每人只动自己的 NPC 目录
3. **先拉取，再开发** — 每天开始前 `git pull origin main`
4. **改完后先汇报，再 push** — 遵循小希定的工作流

---

## 每日工作流

### 早上：同步代码

```bash
git checkout main
git pull origin main          # 拉最新代码
git checkout -b npc/yu       # 创建自己的分支（第一次）
git checkout npc/yu            # 之后直接切到自己的分支
```

### 开发：改自己的 NPC 目录

```bash
# 只改自己的目录
src/npc/yu/dialogue/act2_xxx.md
src/npc/yu/backstory/xxx.md
```

### 完成后：提交 PR

```bash
git add src/npc/yu/
git commit -m "feat(npc/yu): Act II dialogue - 事件名"
git push origin npc/yu
```

然后在 GitHub 发起 Pull Request，通知 Kaci 合入。

---

## 分支命名建议

| 人员 | 分支名 |
|------|--------|
| 组员 A（雨）| `npc/yu` |
| 组员 B（利希特）| `npc/licht` |
| 组员 C（焕）| `npc/huan` |
| 统筹（你）| `main` 或 `feat/act2-framework` |

---

## 冲突预防

**最关键的规则：每人只改自己的目录。**

如果真的出现冲突（几乎不会发生）：
1. `git stash` 暂存自己的修改
2. `git pull origin main --rebase` 拉最新
3. `git stash pop` 恢复修改
4. 手动解决冲突（通常只是你的新文件 vs 更新的框架文件）

---

## Commit 信息格式

参考：

```
feat(npc/yu): Act II - 雨的真相揭示对话
fix(npc/licht): Act II - 利希特感知描写修正
feat(npc/huan): Act III - 焕的结局A对话
docs(npc): add NPC contribution guide
```

---

## 紧急情况

如果 main 分支有重大更新（如 SKILL.md 改了），Kaci 会在群里通知，其他两人当天拉取最新即可。
