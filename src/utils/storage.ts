import { DEFAULT_CHARACTERS, DEFAULT_PROFILE, DEFAULT_SPONSORS, SEED_LEADERBOARD } from '../data/defaultData';
import { Character, GameSettings, LeaderboardEntry, PlayerProfile, Question, Sponsor } from '../types';

const STORAGE_KEY_PROFILE = 'panjat_pinang_profile_v1';
const STORAGE_KEY_SETTINGS = 'panjat_pinang_settings_v1';
const STORAGE_KEY_LEADERBOARD = 'panjat_pinang_leaderboard_v1';
const STORAGE_KEY_QUESTIONS = 'panjat_pinang_questions_v1';
const STORAGE_KEY_SPONSORS = 'panjat_pinang_sponsors_v1';
const STORAGE_KEY_CHARACTERS = 'panjat_pinang_characters_v1';

export function getStoredProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.name === 'Tomy Bachtiar' || parsed.name === 'Pemain T-Games')) {
        parsed.name = 'Pemain Tamu';
        saveStoredProfile(parsed);
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    soundEnabled: true,
    musicEnabled: true,
    showTimerBar: true,
    vibrationEnabled: true,
    theme: 'merah_putih',
  };
}

export function saveStoredSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_LEADERBOARD;
}

export function saveStoredLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank'>): LeaderboardEntry[] {
  const current = getStoredLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `lb_${Date.now()}`,
    rank: 0,
  };

  const updated = [...current, newEntry];
  updated.sort((a, b) => b.score - a.score);

  // Recalculate ranks
  updated.forEach((item, index) => {
    item.rank = index + 1;
  });

  saveStoredLeaderboard(updated);
  return updated;
}

export function getStoredSponsors(): Sponsor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPONSORS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_SPONSORS;
}

export function saveStoredSponsors(sponsors: Sponsor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SPONSORS, JSON.stringify(sponsors));
  } catch {
    // ignore
  }
}

export function getStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHARACTERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_CHARACTERS;
}

export function saveStoredCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(characters));
  } catch {
    // ignore
  }
}

export function getStoredCustomQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredCustomQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  } catch {
    // ignore
  }
}
