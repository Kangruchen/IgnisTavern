'use client';

import { useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

export default function ApiKeyModal({ isOpen, onClose, language }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [useLocalApi, setUseLocalApi] = useState(true);

  useEffect(() => {
    const settings = loadSettings();
    setApiKey(settings.apiKey || '');
    setUseLocalApi(settings.useLocalApi ?? true);
  }, [isOpen]);

  const handleSave = () => {
    saveSettings({
      language,
      apiKey: apiKey.trim() || undefined,
      useLocalApi,
    });
    onClose();
  };

  if (!isOpen) return null;

  const texts = {
    zh: {
      title: 'API 设置',
      description: '配置游戏使用的 AI API',
      useLocal: '使用本地 API（无需密钥）',
      enterKey: '输入 API Key',
      placeholder: 'sk-...',
      cancel: '取消',
      save: '保存',
      note: '您的密钥仅存储在本地浏览器中',
    },
    en: {
      title: 'API Settings',
      description: 'Configure AI API for the game',
      useLocal: 'Use Local API (no key needed)',
      enterKey: 'Enter API Key',
      placeholder: 'sk-...',
      cancel: 'Cancel',
      save: 'Save',
      note: 'Your key is stored only in your browser',
    },
  };

  const t = texts[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-amber-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-medieval text-amber-400 mb-2">{t.title}</h2>
        <p className="text-amber-200/70 text-sm mb-6">{t.description}</p>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useLocalApi}
              onChange={(e) => setUseLocalApi(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
            <span className="text-amber-100">{t.useLocal}</span>
          </label>

          {!useLocalApi && (
            <div>
              <label className="block text-amber-200/80 text-sm mb-2">
                {t.enterKey}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t.placeholder}
                className="w-full px-4 py-3 bg-slate-800 border border-amber-700/50 rounded-lg
                         text-amber-100 placeholder-amber-700/50
                         focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          <p className="text-xs text-amber-600/60">{t.note}</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-amber-700/50 text-amber-200/70 rounded-lg
                     hover:bg-amber-900/30 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-700 to-orange-600
                     text-white rounded-lg font-medium
                     hover:from-amber-600 hover:to-orange-500
                     transition-all shadow-lg shadow-orange-900/30"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
