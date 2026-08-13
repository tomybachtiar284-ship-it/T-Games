import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, LeaderboardEntry } from '../types';

// Read env variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are present
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Initialize Supabase Client (if configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// GOOGLE SIGN IN OAUTH
export async function signInWithGoogle() {
  if (!supabase) {
    console.warn('Supabase belum dikonfigurasi. Silakan isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env.local');
    alert('Koneksi Supabase belum dikonfigurasi. Silakan isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env.local');
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Gagal Sign in dengan Google:', error.message);
    alert(`Gagal Sign In Google: ${error.message}`);
  }
}

// SIGN OUT
export async function signOutUser() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Gagal Sign Out:', error.message);
  }
}

// SYNC PROFILE TO SUPABASE CLOUD
export async function syncProfileToCloud(profile: PlayerProfile) {
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: profile.name,
        email: user.email,
        avatar: profile.avatar,
        school: profile.school,
        coins: profile.coins,
        total_score: profile.totalScore,
        highest_score: profile.highestScore,
        highest_level: profile.highestLevelReached,
        total_correct: profile.totalCorrect,
        total_wrong: profile.totalWrong,
        badges: profile.badges,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error sync profile to Supabase:', error.message);
    }
  } catch (err) {
    console.error('Catched error sync profile:', err);
  }
}

// FETCH CLOUD LEADERBOARD ENTRIES
export async function fetchCloudLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((item, idx) => ({
      id: item.id,
      rank: idx + 1,
      name: item.name,
      school: item.school || 'Komunitas T-Games Digital',
      score: item.score,
      level: item.level,
      category: item.category || 'Master',
      avatar: item.avatar || '🧑‍💻',
      date: new Date(item.created_at).toISOString().split('T')[0],
    }));
  } catch {
    return [];
  }
}

// PUSH LEADERBOARD ENTRY TO SUPABASE
export async function pushLeaderboardToCloud(entry: {
  name: string;
  school: string;
  score: number;
  level: number;
  category: string;
  avatar: string;
}) {
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id || null;

  try {
    await supabase.from('leaderboard_entries').insert([
      {
        user_id: userId,
        name: entry.name,
        school: entry.school,
        score: entry.score,
        level: entry.level,
        category: entry.category,
        avatar: entry.avatar,
      },
    ]);
  } catch (err) {
    console.error('Error push leaderboard entry:', err);
  }
}
