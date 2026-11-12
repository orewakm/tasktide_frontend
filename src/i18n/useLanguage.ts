import { useSyncExternalStore } from 'react';
import { en } from './en';
import { tr } from './tr';

export type Language = 'en' | 'tr';
const dictionaries = { en, tr };
const STORAGE_KEY = 'tasktide.lang';
const listeners = new Set<() => void>();

function readLanguage(): Language {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'tr') return saved;
    } catch {}

    return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export function setLanguage(language: Language) {
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // Storage blocked: the choice lasts until the page is reloaded.
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useLanguage() {
    const language = useSyncExternalStore(subscribe, readLanguage, (): Language => 'en');
    return { language, setLanguage, t: dictionaries[language] };
}
