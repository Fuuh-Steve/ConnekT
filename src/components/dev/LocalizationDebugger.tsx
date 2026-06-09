'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useMessages } from 'next-intl';
import { Globe, Search, Copy, Check, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type MessageValue = string | { [key: string]: MessageValue };

const flattenMessages = (messages: MessageValue, prefix = ''): { key: string; value: string }[] => {
  if (typeof messages === 'string') {
    return [{ key: prefix, value: messages }];
  }
  return Object.entries(messages).flatMap(([key, value]) =>
    flattenMessages(value, prefix ? `${prefix}.${key}` : key)
  );
};

const TreeNode = ({
  label,
  value,
  query,
  onCopy,
  copiedKey,
  fullKey,
}: {
  label: string;
  value: MessageValue;
  query: string;
  onCopy: (key: string, value: string) => void;
  copiedKey: string | null;
  fullKey: string;
}) => {
  const [isOpen, setIsOpen] = useState(Boolean(query));

  if (typeof value === 'string') {
    return (
      <div className="flex items-start justify-between gap-2 py-1 pl-4 group">
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-[rgb(var(--text-muted))] truncate">{fullKey}</p>
          <p className="text-xs text-[rgb(var(--text-main))] break-words">{value}</p>
        </div>
        <button
          onClick={() => onCopy(fullKey, value)}
          className="shrink-0 p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] hover:bg-[rgb(var(--bg-side))] opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`Copy ${fullKey}`}
        >
          {copiedKey === fullKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="border-l border-[rgb(var(--border))] ml-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 py-1 pl-2 text-xs font-bold text-[rgb(var(--text-main))] hover:text-[rgb(var(--accent))] transition-colors"
      >
        <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-90')} />
        {label}
      </button>
      {isOpen && (
        <div className="pl-2">
          {Object.entries(value).map(([key, child]) => (
            <TreeNode
              key={key}
              label={key}
              value={child}
              query={query}
              onCopy={onCopy}
              copiedKey={copiedKey}
              fullKey={fullKey ? `${fullKey}.${key}` : key}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LocalizationDebugger = () => {
  const locale = useLocale();
  const messages = useMessages() as unknown as MessageValue;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const lower = query.trim().toLowerCase();
    return flattenMessages(messages).filter(
      ({ key, value }) => key.toLowerCase().includes(lower) || value.toLowerCase().includes(lower)
    );
  }, [messages, query]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-6 right-6 z-200 font-sans">
      {isOpen ? (
        <div className="w-90 max-w-[90vw] h-120 max-h-[70vh] bg-[rgb(var(--bg-main))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-side))]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[rgb(var(--accent))]" />
              <span className="text-xs font-bold uppercase tracking-widest">Messages — {locale}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close localization debugger"
              className="p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] hover:bg-[rgb(var(--bg-main))] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-[rgb(var(--border))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--text-muted))]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keys or values..."
                className="w-full bg-[rgb(var(--bg-side))] border border-[rgb(var(--border))] rounded-lg py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-[rgb(var(--accent))] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {searchResults ? (
              searchResults.length > 0 ? (
                searchResults.map(({ key, value }) => (
                  <div key={key} className="flex items-start justify-between gap-2 py-1.5 group">
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-[rgb(var(--text-muted))] truncate">{key}</p>
                      <p className="text-xs text-[rgb(var(--text-main))] break-words">{value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(key, value)}
                      className="shrink-0 p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-main))] hover:bg-[rgb(var(--bg-side))] opacity-0 group-hover:opacity-100 transition-all"
                      aria-label={`Copy ${key}`}
                    >
                      {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[rgb(var(--text-muted))] text-center py-6">No matches found.</p>
              )
            ) : (
              Object.entries(messages).map(([key, value]) => (
                <TreeNode
                  key={key}
                  label={key}
                  value={value}
                  query={query}
                  onCopy={handleCopy}
                  copiedKey={copiedKey}
                  fullKey={key}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open localization debugger"
          className="w-12 h-12 rounded-full bg-[rgb(var(--accent))] text-white shadow-xl shadow-[rgb(var(--accent))]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Globe className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
