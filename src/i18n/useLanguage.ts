import { useSyncExternalStore } from 'react';
import { en } from './en';
import { tr } from './tr';

export type Language = 'en' | 'tr';
const dictionaries = { en, tr };
const STORAGE_KEY = 'tasktide.lang';
const listeners = new Set<() => void>();

// Reads the saved language, or picks one from the browser.
// TR: Kaydedilen dili okur ya da tarayıcıya göre bir dil seçer.
function readLanguage(): Language {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'tr') return saved;
    } catch {}

    return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

// Saves the chosen language and updates every screen.
// TR: Seçilen dili kaydeder ve tüm ekranları günceller.
export function setLanguage(language: Language) {
    try {
        localStorage.setItem(STORAGE_KEY, language);
    } catch {
    }
    listeners.forEach((listener) => listener());
}

// Calls the listener whenever the language changes.
// TR: Dil her değiştiğinde dinleyiciyi çağırır.
function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Returns the current language and its texts.
// TR: Geçerli dili ve metinlerini döndürür.
export function useLanguage() {
    const language = useSyncExternalStore(subscribe, readLanguage, (): Language => 'en');
    return { language, setLanguage, t: dictionaries[language] };
}
