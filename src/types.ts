export type Difficulty = 'mudah' | 'normal' | 'sulit';

export type MathCategory = 
  | 'penjumlahan'
  | 'pengurangan'
  | 'perkalian'
  | 'pembagian'
  | 'pecahan'
  | 'persentase'
  | 'bangun_datar'
  | 'bangun_ruang'
  | 'logika'
  | 'campuran';

export interface Question {
  id: string;
  category: MathCategory;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0..3
  explanation?: string;
  points: number;
  durationSeconds: number;
}

export interface Character {
  id: string;
  name: string;
  gender: 'laki' | 'perempuan';
  role: string;
  emoji: string;
  avatarBg: string;
  unlocked: boolean;
  costCoins: number;
  description: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  school: string;
  selectedCharacterId: string;
  coins: number;
  totalGames: number;
  totalScore: number;
  highestScore: number;
  highestLevelReached: number;
  totalCorrect: number;
  totalWrong: number;
  badges: string[]; // badge IDs
  unlockedCharacters: string[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  school: string;
  score: number;
  level: number;
  category: string;
  avatar: string;
  date: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  logoText: string;
  slogan: string;
  active: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  showTimerBar: boolean;
  vibrationEnabled: boolean;
  theme: 'merah_putih' | 'dark' | 'retro';
}

export interface ActiveGameState {
  currentLevel: number; // 1 to 10
  targetLevel: number; // 10 = Puncak
  score: number;
  lives: number;
  maxLives: number;
  comboCount: number;
  maxCombo: number;
  questionsAnswered: number;
  correctCount: number;
  wrongCount: number;
  startTime: number;
  timeSpentSeconds: number;
  difficulty: Difficulty;
  category: MathCategory;
  mode: 'campaign' | 'custom';
}
