import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, LeaderboardEntry, Question, Sponsor, Character } from '../types';

// Read and sanitize env variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL || '';
const rawKey = env.VITE_SUPABASE_ANON_KEY || '';

// Clean accidental quotes or whitespace from environment variables
const cleanUrl = String(rawUrl).trim().replace(/^["']|["']$/g, '');
const cleanAnonKey = String(rawKey).trim().replace(/^["']|["']$/g, '');

// Check if credentials are valid
export const isSupabaseConfigured = Boolean(
  cleanUrl && 
  cleanAnonKey && 
  (cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://'))
);

// Initialize Supabase Client safely
export const supabase = (() => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(cleanUrl, cleanAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Error saat inisialisasi Supabase client:', err);
    return null;
  }
})();

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
        selected_character_id: profile.selectedCharacterId,
        unlocked_characters: profile.unlockedCharacters,
        coins: profile.coins,
        play_points: profile.playPoints ?? 10,
        subscription_type: profile.subscriptionType ?? 'free',
        subscription_expires_at: profile.subscriptionExpiresAt ?? null,
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

// FETCH CLOUD QUESTIONS
export async function fetchCloudQuestions(): Promise<Question[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('custom_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      category: item.category,
      difficulty: 'normal',
      questionText: item.question_text,
      options: item.options || [],
      correctAnswerIndex: item.correct_answer_index,
      explanation: item.explanation || '',
      points: item.points || 100,
      durationSeconds: 15,
    }));
  } catch {
    return [];
  }
}

// PUSH QUESTION TO SUPABASE CLOUD
export async function pushQuestionToCloud(q: Question): Promise<string | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('custom_questions').insert([
      {
        category: q.category,
        question_text: q.questionText,
        options: q.options,
        correct_answer_index: q.correctAnswerIndex,
        explanation: q.explanation,
        points: q.points || 100,
      },
    ]).select().single();

    if (error) {
      console.error('Error pushing custom question to cloud:', error.message);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error pushing custom question to cloud:', err);
    return null;
  }
}

// UPDATE QUESTION IN SUPABASE CLOUD
export async function updateQuestionInCloud(q: Question) {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('custom_questions')
      .update({
        category: q.category,
        question_text: q.questionText,
        options: q.options,
        correct_answer_index: q.correctAnswerIndex,
        explanation: q.explanation,
        points: q.points || 100,
      })
      .eq('id', q.id);

    if (error) {
      console.error('Error updating question in cloud:', error.message);
    }
  } catch (err) {
    console.error('Catched error updating question:', err);
  }
}

// DELETE QUESTION FROM SUPABASE CLOUD
export async function deleteQuestionFromCloud(question: Question | string) {
  if (!supabase) return;

  const questionId = typeof question === 'string' ? question : question.id;
  const questionText = typeof question === 'object' ? question.questionText : null;

  try {
    // 1. Try delete by ID
    const { error: errId } = await supabase
      .from('custom_questions')
      .delete()
      .eq('id', questionId);

    if (errId) {
      console.warn('Delete by ID error or fallback:', errId.message);
    }

    // 2. Also delete by question_text if available
    if (questionText) {
      const { error: errText } = await supabase
        .from('custom_questions')
        .delete()
        .eq('question_text', questionText);

      if (errText) {
        console.warn('Delete by question_text error:', errText.message);
      }
    }
  } catch (err) {
    console.error('Catched error deleting question:', err);
  }
}

// ADMIN EMAIL WHITELIST & WHATSAPP NUMBER
export const ADMIN_EMAILS = [
  'tomybachtiar284@gmail.com',
];

export const ADMIN_WHATSAPP_NUMBER = '6285241476413'; // WA Admin: 085241476413
export const ADMIN_EMAIL = 'tomybachtiar284@gmail.com'; // Email Admin
export const ADMIN_NAME = 'Tomy Bachtiar'; // Nama admin untuk pesan WA


export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionType = 'free' | 'basic' | 'premium';

/** Cek apakah pemain memiliki langganan aktif (basic atau premium, belum expired) */
export function isActiveSubscriber(subscriptionType?: SubscriptionType, subscriptionExpiresAt?: string | null): boolean {
  if (!subscriptionType || subscriptionType === 'free') return false;
  if (!subscriptionExpiresAt) return false;
  return new Date(subscriptionExpiresAt) >= new Date();
}

/** Cek apakah pemain berlangganan premium aktif (token tidak dipotong saat bermain) */
export function isPremiumSubscriber(subscriptionType?: SubscriptionType, subscriptionExpiresAt?: string | null): boolean {
  return subscriptionType === 'premium' && isActiveSubscriber(subscriptionType, subscriptionExpiresAt);
}

/** Hitung sisa hari langganan. Negatif = sudah kedaluwarsa. */
export function getSubscriptionDaysRemaining(subscriptionExpiresAt?: string | null): number {
  if (!subscriptionExpiresAt) return 0;
  const now = new Date();
  const expires = new Date(subscriptionExpiresAt);
  const diffMs = expires.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ADMIN FUNCTION: SET / UPGRADE / RENEW SUBSCRIPTION FOR A USER BY EMAIL
export async function setUserSubscription(
  targetEmail: string,
  type: SubscriptionType,
  durationDays: number,
  bonusPoints: number = 0
): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: 'Supabase belum terhubung.' };

  try {
    const { data: targetProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', targetEmail.trim())
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return { success: false, message: `Pengguna dengan email "${targetEmail}" tidak ditemukan.` };
    }

    const now = new Date();
    // Perpanjang dari sisa waktu jika masih aktif, atau mulai baru
    const existingExpires = targetProfile.subscription_expires_at ? new Date(targetProfile.subscription_expires_at) : null;
    const baseDate = existingExpires && existingExpires > now ? existingExpires : now;
    const newExpires = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const currentPoints = targetProfile.play_points ?? 10;
    const newPoints = currentPoints + bonusPoints;

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        subscription_type: type,
        subscription_expires_at: newExpires.toISOString(),
        subscription_started_at: now.toISOString(),
        play_points: newPoints,
      })
      .eq('id', targetProfile.id);

    if (updateErr) {
      return { success: false, message: `Gagal update langganan: ${updateErr.message}` };
    }

    const expiresStr = newExpires.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const typeLabel = type === 'premium' ? '🥇 PREMIUM (Unlimited)' : '🥈 BASIC (+Token)';
    return {
      success: true,
      message: `✅ Berhasil! ${targetProfile.name} kini ${typeLabel} — aktif hingga ${expiresStr}.${bonusPoints > 0 ? ` +${bonusPoints} Token ditambahkan (total: ${newPoints}).` : ''}`,
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message || 'Terjadi kesalahan'}` };
  }
}


export async function addPlayPointsByEmail(targetEmail: string, pointsToAdd: number): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: 'Supabase belum terhubung.' };

  try {
    const { data: targetProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', targetEmail.trim())
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return { success: false, message: `Pengguna dengan email "${targetEmail}" tidak ditemukan.` };
    }

    const currentPoints = targetProfile.play_points ?? 10;
    const newPoints = currentPoints + pointsToAdd;

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ play_points: newPoints })
      .eq('id', targetProfile.id);

    if (updateErr) {
      return { success: false, message: `Gagal memperbarui poin: ${updateErr.message}` };
    }

    return { success: true, message: `Berhasil menambahkan ${pointsToAdd} Poin! Total poin ${targetProfile.name} sekarang: ${newPoints}` };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message || 'Terjadi kesalahan'}` };
  }
}

// ADMIN FUNCTION: FETCH ALL PROFILES WITH TOKEN BALANCES
export async function fetchCloudAllProfiles(): Promise<Array<{ id: string; name: string; email?: string; play_points: number; coins: number; updated_at?: string }>> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, play_points, coins, updated_at')
      .order('updated_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// SYSTEM STATS FROM CLOUD DATABASE
export interface SystemStats {
  totalPlayers: number;
  activePlayers: number;
  totalQuestionsAnswered: number;
  averageAccuracy: number;
}

export async function fetchCloudSystemStats(): Promise<SystemStats> {
  if (!supabase) {
    return {
      totalPlayers: 0,
      activePlayers: 0,
      totalQuestionsAnswered: 0,
      averageAccuracy: 0,
    };
  }

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('updated_at, total_correct, total_wrong');

    if (error || !profiles || profiles.length === 0) {
      // Fallback: check leaderboard_entries count if profiles table empty
      const { data: lb } = await supabase.from('leaderboard_entries').select('id');
      const count = lb?.length || 0;
      return {
        totalPlayers: count,
        activePlayers: count,
        totalQuestionsAnswered: 0,
        averageAccuracy: 0,
      };
    }

    const totalPlayers = profiles.length;

    // Active in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeCount = profiles.filter(
      (p) => p.updated_at && new Date(p.updated_at) >= sevenDaysAgo
    ).length;

    let totalCorrect = 0;
    let totalWrong = 0;

    profiles.forEach((p) => {
      totalCorrect += p.total_correct || 0;
      totalWrong += p.total_wrong || 0;
    });

    const totalQuestionsAnswered = totalCorrect + totalWrong;
    const averageAccuracy =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 1000) / 10
        : 0;

    return {
      totalPlayers,
      activePlayers: activeCount || totalPlayers,
      totalQuestionsAnswered,
      averageAccuracy,
    };
  } catch (err) {
    console.error('Error fetching cloud stats:', err);
    return {
      totalPlayers: 0,
      activePlayers: 0,
      totalQuestionsAnswered: 0,
      averageAccuracy: 0,
    };
  }
}

// FETCH CLOUD SPONSORS
export async function fetchCloudSponsors(): Promise<Sponsor[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      logoUrl: item.logo_url || undefined,
      logoText: item.logo_text,
      slogan: item.slogan || '',
      active: item.active ?? true,
    }));
  } catch {
    return [];
  }
}

// UPDATE SPONSORS IN CLOUD
export async function updateSponsorsInCloud(sponsors: Sponsor[]): Promise<void> {
  if (!supabase) return;

  try {
    for (const sp of sponsors) {
      await supabase.from('sponsors').upsert({
        id: sp.id,
        name: sp.name,
        logo_url: sp.logoUrl || null,
        logo_text: sp.logoText,
        slogan: sp.slogan,
        active: sp.active,
      });
    }
  } catch (err) {
    console.error('Error updating sponsors in cloud:', err);
  }
}

// FETCH CLOUD CHARACTERS
export async function fetchCloudCharacters(): Promise<Character[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('cost_coins', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      gender: (item.gender as 'laki' | 'perempuan') || 'laki',
      role: item.role || 'Remaja Smart',
      emoji: item.emoji,
      avatarBg: item.avatar_bg || 'bg-indigo-600',
      unlocked: item.unlocked ?? false,
      costCoins: item.cost_coins ?? 0,
      description: item.description || '',
    }));
  } catch {
    return [];
  }
}


