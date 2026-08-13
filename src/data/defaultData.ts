import { Badge, Character, LeaderboardEntry, PlayerProfile, Sponsor } from '../types';

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char_rizky',
    name: 'Arya Tech',
    gender: 'laki',
    role: 'Remaja Tech & Gamer',
    emoji: '🧑‍💻',
    avatarBg: 'bg-indigo-600',
    unlocked: true,
    costCoins: 0,
    description: 'Remaja digital yang gemar logika matematika dan analisis cepat.',
  },
  {
    id: 'char_nayla',
    name: 'Nayla',
    gender: 'perempuan',
    role: 'Siswi SMA Cerdas',
    emoji: '👩‍🎓',
    avatarBg: 'bg-rose-500',
    unlocked: true,
    costCoins: 0,
    description: 'Siswi SMA berprestasi yang sangat fokus dan cermat menyelesaikan tantangan.',
  },
  {
    id: 'char_kenzie',
    name: 'Kenzie',
    gender: 'laki',
    role: 'Remaja Atletik & Cool',
    emoji: '🧢',
    avatarBg: 'bg-blue-600',
    unlocked: true,
    costCoins: 200,
    description: 'Remaja energik bertopi yang cepat dalam berhitung dan punya refleks tinggi.',
  },
  {
    id: 'char_zahra',
    name: 'Zahra',
    gender: 'perempuan',
    role: 'Mahasiswi Genius Logika',
    emoji: '🕶️',
    avatarBg: 'bg-emerald-600',
    unlocked: false,
    costCoins: 500,
    description: 'Master matematika muda bergaya kasual dengan kemampuan analisis tingkat tinggi.',
  },
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge_pemula',
    title: 'Pemula Smart',
    description: 'Selesaikan tantangan matematika T-Games pertama kali.',
    icon: '🏅',
  },
  {
    id: 'badge_jago_math',
    title: 'Master Logika',
    description: 'Menjawab 10 soal dengan benar tanpa kesalahan.',
    icon: '🧠',
  },
  {
    id: 'badge_raja_pinang',
    title: 'Juara T-Games Challenge',
    description: 'Berhasil mencapai puncak tantangan (Level 10)!',
    icon: '🚩',
  },
  {
    id: 'badge_master',
    title: 'Master Matematika Remaja',
    description: 'Mencapai skor di atas 10.000 poin.',
    icon: '👑',
  },
  {
    id: 'badge_juara_nasional',
    title: 'Top Challenger',
    description: 'Masuk jajaran Top 3 Leaderboard T-Games Smart Challenge.',
    icon: '🏆',
  },
  {
    id: 'badge_patriot',
    title: 'Patriot T-Games',
    description: 'Mengikuti Event Spesial T-Games Smart Challenge.',
    icon: '⚡',
  },
];

export const DEFAULT_PROFILE: PlayerProfile = {
  id: 'player_local_01',
  name: 'Pemain Tamu',
  avatar: '👤',
  school: 'Pemain Tamu',
  selectedCharacterId: 'char_rizky',
  coins: 0,
  playPoints: 10,
  totalGames: 0,
  totalScore: 0,
  highestScore: 0,
  highestLevelReached: 1,
  totalCorrect: 0,
  totalWrong: 0,
  badges: [],
  unlockedCharacters: ['char_rizky', 'char_nayla'],
};

export const SEED_LEADERBOARD: LeaderboardEntry[] = [];

export const DEFAULT_SPONSORS: Sponsor[] = [
  {
    id: 'sp_1',
    name: 'Telkomsel',
    logoText: 'TELKOMSEL',
    slogan: 'Jaringan Terluas Kemerdekaan',
    active: true,
  },
  {
    id: 'sp_2',
    name: 'Indomie',
    logoText: 'INDOMIE',
    slogan: 'Indomie Seleraku',
    active: true,
  },
  {
    id: 'sp_3',
    name: 'Bank BNI',
    logoText: 'BANK BNI',
    slogan: 'Melayani Negeri',
    active: true,
  },
  {
    id: 'sp_4',
    name: 'Kemdikbud',
    logoText: 'KEMDIKBUD',
    slogan: 'Merdeka Belajar Matematika',
    active: true,
  },
];
