'use client';

import { GameState } from '@/lib/gameState';
import { saveGame, loadGame, hasSave } from '@/lib/storage';

interface SaveLoadButtonsProps {
  gameState: GameState;
  onLoad: (state: Partial<GameState>) => void;
  language: 'zh' | 'en';
}

export default function SaveLoadButtons({ gameState, onLoad, language }: SaveLoadButtonsProps) {
  const t = {
    zh: {
      save: '保存游戏',
      load: '读取游戏',
      export: '导出存档',
      import: '导入存档',
      noSave: '无存档',
      saveSuccess: '已保存到浏览器',
      exportSuccess: '已导出文件',
      importSuccess: '已导入存档',
      importError: '导入失败',
    },
    en: {
      save: 'Save Game',
      load: 'Load Game',
      export: 'Export Save',
      import: 'Import Save',
      noSave: 'No Save',
      saveSuccess: 'Saved to browser',
      exportSuccess: 'Exported file',
      importSuccess: 'Save imported',
      importError: 'Import failed',
    },
  };

  const text = t[language];

  const handleSave = () => {
    const ok = saveGame(gameState);
    alert(ok ? text.saveSuccess : 'Error');
  };

  const handleLoad = () => {
    const saved = loadGame();
    if (saved) {
      onLoad(saved);
      alert(text.importSuccess);
    } else {
      alert(text.noSave);
    }
  };

  const handleExport = () => {
    const saveData = {
      ...gameState,
      isTyping: false,
      isStreaming: false,
      displayedText: '',
      savedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ignis_tavern_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert(text.exportSuccess);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onLoad(data);
          alert(text.importSuccess);
        } catch {
          alert(text.importError);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2 bg-amber-900/40 border border-amber-700/40 rounded-lg text-amber-400/80 text-sm hover:bg-amber-900/60 hover:text-amber-300 transition-all"
        >
          💾 {text.save}
        </button>
        <button
          onClick={handleLoad}
          className="flex-1 px-3 py-2 bg-slate-800/60 border border-amber-700/30 rounded-lg text-amber-400/70 text-sm hover:bg-slate-700/60 hover:text-amber-300 transition-all"
        >
          📂 {text.load}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 px-3 py-2 bg-slate-800/40 border border-amber-700/30 rounded-lg text-amber-400/60 text-xs hover:bg-slate-700/40 hover:text-amber-300 transition-all"
        >
          ⬇️ {text.export}
        </button>
        <button
          onClick={handleImport}
          className="flex-1 px-3 py-2 bg-slate-800/40 border border-amber-700/30 rounded-lg text-amber-400/60 text-xs hover:bg-slate-700/40 hover:text-amber-300 transition-all"
        >
          ⬆️ {text.import}
        </button>
      </div>
    </div>
  );
}
