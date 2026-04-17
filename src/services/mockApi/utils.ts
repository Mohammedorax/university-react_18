import { STORAGE_KEYS } from './types'

export const getStorageData = <T>(key: keyof typeof STORAGE_KEYS, initial: T): T => {
    const fullKey = STORAGE_KEYS[key];
    const stored = localStorage.getItem(fullKey)
    if (stored) {
        return JSON.parse(stored)
    }
    localStorage.setItem(fullKey, JSON.stringify(initial))
    return initial
}

export const setStorageData = <T>(key: keyof typeof STORAGE_KEYS, data: T) => {
    const fullKey = STORAGE_KEYS[key];
    localStorage.setItem(fullKey, JSON.stringify(data))
}

const DELAY_SCALE = (() => {
    try {
        const env = (import.meta as { env?: Record<string, string | undefined> }).env;
        const raw = env?.VITE_MOCK_DELAY_SCALE;
        if (raw !== undefined) {
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && parsed >= 0) return parsed;
        }
        return env?.DEV ? 0.1 : 0.2;
    } catch {
        return 0.2;
    }
})();

export const delay = (ms: number) => {
    const scaled = Math.max(0, Math.floor(ms * DELAY_SCALE));
    if (scaled === 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, scaled));
};

export const applySearch = <T>(data: T[], query: string, fields: (keyof T)[]): T[] => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter(item => 
        fields.some(field => 
            String(item[field]).toLowerCase().includes(lowerQuery)
        )
    );
};

export const applyPagination = <T>(data: T[], page: number = 1, limit: number = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
        items: data.slice(start, end),
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit)
    };
};

export const calculateGradeLetter = (score: number): { letter: string, points: number } => {
    if (score >= 95) return { letter: 'A+', points: 4.00 };
    if (score >= 90) return { letter: 'A', points: 3.75 };
    if (score >= 85) return { letter: 'B+', points: 3.50 };
    if (score >= 80) return { letter: 'B', points: 3.00 };
    if (score >= 75) return { letter: 'C+', points: 2.50 };
    if (score >= 70) return { letter: 'C', points: 2.00 };
    if (score >= 65) return { letter: 'D+', points: 1.50 };
    if (score >= 60) return { letter: 'D', points: 1.00 };
    return { letter: 'F', points: 0.00 };
};

export const generateId = (prefix: string) => {
    return prefix + Math.random().toString(36).substr(2, 9);
};

export const generateTimestampId = (prefix: string) => {
    return prefix + Date.now().toString(36);
};
