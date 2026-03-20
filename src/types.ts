export interface Habit {
    id: string;
    label: string;
    category: string;
    type: string;
    description: string;
    defaultDuration?: number;
    unit?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    status: 'active' | 'sleep' | 'deprecated'; // Handles the "put to sleep" requirement
}

export interface TrackerSettings {
    dailyNotesFolder: string;
    categories: string[];
    habitTypes: Record<string, { bg: string, border: string, text: string, shadow: string, label: string }>;
    habits: Habit[];
}

export const DEFAULT_SETTINGS: TrackerSettings = {
    dailyNotesFolder: 'Journal/Daily Notes',
    categories: ['Before Fajr', 'Fajr', 'Shuruq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
    habitTypes: {
        dua: { bg: 'rgba(46, 204, 113, 0.25)', border: '#2ecc71', text: '#2ecc71', shadow: '0 0 10px rgba(46, 204, 113, 0.3)', label: 'Dua' },
        // ... (add other default types here)
    },
    habits: [] // Users will add these via settings
}