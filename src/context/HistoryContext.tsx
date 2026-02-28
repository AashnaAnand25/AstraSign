import React, { createContext, useContext, useState, useCallback } from "react";

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  audioText: string;
  aslTranslation: string;
}

const STORAGE_KEY = "astrasign:history";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { id: string; timestamp: string; audioText: string; aslTranslation: string }[];
    return parsed.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }));
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

type HistoryContextValue = {
  entries: HistoryEntry[];
  addEntry: (audioText: string, aslTranslation: string) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback((audioText: string, aslTranslation: string) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      audioText,
      aslTranslation,
    };
    setEntries((prev) => {
      const next = [entry, ...prev].slice(0, 200);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    saveHistory([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ entries, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
