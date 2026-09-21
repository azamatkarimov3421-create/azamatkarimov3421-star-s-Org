// =====================================================
// NUR SHAXMAT 100 — Foydalanuvchi Profili va Yutuqlar (Achievements)
// =====================================================

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  rating: number;
  league: string;
  avatar: string;
  avatarUrl?: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  onlineGames: number;
  isGoogleLinked: boolean;
  googleId?: string;
  lastLoginAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  unlocked: boolean;
}

export interface RecentGame {
  id: string;
  date: string; // ISO string
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  gameMode: 'vsAI' | 'online' | 'pvp' | 'aiVsAi';
  myColor: 'white' | 'black';
  totalMoves: number;
  reason?: string;
}

export const DEFAULT_UNLINKED_PROFILE: UserProfile = {
  name: 'Azamat Karimov',
  email: 'karimovazamat3421@gmail.com',
  rating: 1202,
  league: 'Bronza liga',
  avatar: 'A',
  avatarUrl: undefined,
  gamesPlayed: 1,
  wins: 0,
  draws: 1,
  losses: 0,
  onlineGames: 1,
  isGoogleLinked: true,
};

const DEFAULT_PROFILE = DEFAULT_UNLINKED_PROFILE;

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'Birinchi gʻalaba',
    description: '1 ta oʻyinda gʻalaba qozoning',
    icon: '🏆',
    current: 1,
    target: 1,
    unlocked: true,
  },
  {
    id: '10_games',
    title: '10 ta oʻyin',
    description: '10 ta oʻyin oʻynang',
    icon: '🥈',
    current: 10,
    target: 10,
    unlocked: true,
  },
  {
    id: 'master_50',
    title: 'Usta',
    description: '50 ta gʻalaba qozoning',
    icon: '👑',
    current: 78,
    target: 50,
    unlocked: true,
  },
  {
    id: 'online_player',
    title: 'Onlayn oʻyinchi',
    description: 'Onlayn 10 ta oʻyin oʻynang',
    icon: '🌐',
    current: 6,
    target: 10,
    unlocked: false,
  },
  {
    id: 'tournament_entry',
    title: 'Turnir ishtirokchisi',
    description: 'Turnirda qatnashing',
    icon: '🎖️',
    current: 0,
    target: 1,
    unlocked: false,
  },
  {
    id: 'rating_2000',
    title: 'Reyting 2000+',
    description: '2000 reytingga erishing',
    icon: '💎',
    current: 1480,
    target: 2000,
    unlocked: false,
  },
];

const PROFILE_KEY = 'nurchess_profile_v1';
const ACHIEVEMENTS_KEY = 'nurchess_achievements_v1';

export function getUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Agar eski mehmon holatida bo'lsa, Azamat Karimov profiliga yangilash
      if (!parsed.name || parsed.name === 'Mehmon Oʻyinchi' || !parsed.email) {
        const upgraded: UserProfile = {
          ...DEFAULT_PROFILE,
          ...parsed,
          name: 'Azamat Karimov',
          email: 'karimovazamat3421@gmail.com',
          rating: parsed.rating && parsed.rating >= 1200 ? parsed.rating : 1202,
          league: parsed.league || 'Bronza liga',
          isGoogleLinked: true,
        };
        saveUserProfile(upgraded);
        return upgraded;
      }
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        isGoogleLinked: Boolean(parsed.isGoogleLinked && parsed.email),
      };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function isGoogleUser(): boolean {
  const p = getUserProfile();
  return Boolean(p.isGoogleLinked && p.email);
}

export function linkGoogleAccount(data: {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  googleId?: string;
}): UserProfile {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    id: data.id || current.id || `user_${Date.now()}`,
    name: data.name.trim() || 'Google Oʻyinchi',
    email: data.email.trim(),
    avatarUrl: data.avatarUrl || current.avatarUrl,
    googleId: data.googleId || data.id,
    isGoogleLinked: true,
    lastLoginAt: new Date().toISOString(),
    // Preserve or initialize rating
    rating: current.rating >= 1000 ? current.rating : 1200,
    league: current.league || 'Boshlangʻich liga',
  };
  saveUserProfile(updated);
  return updated;
}

export function unlinkGoogleAccount(): UserProfile {
  const current = getUserProfile();
  const reset: UserProfile = {
    ...DEFAULT_UNLINKED_PROFILE,
    rating: 1200,
    gamesPlayed: current.gamesPlayed,
    wins: current.wins,
    draws: current.draws,
    losses: current.losses,
    onlineGames: current.onlineGames,
    isGoogleLinked: false,
    email: undefined,
    avatarUrl: undefined,
    id: undefined,
    googleId: undefined,
  };
  saveUserProfile(reset);
  return reset;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return DEFAULT_ACHIEVEMENTS;
}

export function saveAchievements(list: Achievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Standart Elo reytingini hisoblash
 * Raqibning kuchi va o'yin natijasiga qarab reyting ballining o'zgarishini aniqlaydi
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw',
  kFactor: number = 32
): number {
  const actualScore = result === 'win' ? 1.0 : result === 'draw' ? 0.5 : 0.0;
  const exponent = (opponentRating - playerRating) / 400;
  const expectedScore = 1 / (1 + Math.pow(10, exponent));

  const rawDelta = kFactor * (actualScore - expectedScore);
  let delta = Math.round(rawDelta);

  // G'alabada kamida +1, mag'lubiyatda kamida -1 ta'minlash
  if (result === 'win' && delta < 1) delta = 1;
  if (result === 'loss' && delta > -1) delta = -1;

  return delta;
}

export function recordGameFinished(
  result: 'win' | 'loss' | 'draw',
  isOnline: boolean,
  opponentRating?: number
): UserProfile & { deltaRating: number } {
  const profile = getUserProfile();
  profile.gamesPlayed += 1;

  let delta = 0;
  if (typeof opponentRating === 'number' && opponentRating > 0) {
    delta = calculateEloChange(profile.rating, opponentRating, result, isOnline ? 32 : 24);
  } else {
    // Standart fallback
    if (result === 'win') delta = 15;
    else if (result === 'loss') delta = -12;
    else delta = 2;
  }

  if (result === 'win') {
    profile.wins += 1;
  } else if (result === 'loss') {
    profile.losses += 1;
  } else {
    profile.draws += 1;
  }

  profile.rating = Math.max(100, profile.rating + delta);

  if (isOnline) {
    profile.onlineGames += 1;
  }

  // Ligani hisoblash
  if (profile.rating >= 2200) profile.league = 'Grossmeyster liga';
  else if (profile.rating >= 1900) profile.league = 'Oltin liga';
  else if (profile.rating >= 1600) profile.league = 'Kumush liga';
  else profile.league = 'Bronza liga';

  saveUserProfile(profile);

  // Yutuqlarni yangilash
  const achievements = getAchievements();
  achievements.forEach((ach) => {
    if (ach.id === 'first_win') {
      ach.current = profile.wins;
      if (profile.wins >= 1) ach.unlocked = true;
    } else if (ach.id === '10_games') {
      ach.current = profile.gamesPlayed;
      if (profile.gamesPlayed >= 10) ach.unlocked = true;
    } else if (ach.id === 'master_50') {
      ach.current = profile.wins;
      if (profile.wins >= 50) ach.unlocked = true;
    } else if (ach.id === 'online_player') {
      ach.current = profile.onlineGames;
      if (profile.onlineGames >= 10) ach.unlocked = true;
    } else if (ach.id === 'rating_2000') {
      ach.current = profile.rating;
      if (profile.rating >= 2000) ach.unlocked = true;
    }
  });
  saveAchievements(achievements);

  return Object.assign(profile, { deltaRating: delta });
}

const RECENT_GAMES_KEY = 'nurchess_recent_games_v1';

const DEFAULT_RECENT_GAMES: RecentGame[] = [
  {
    id: 'game_init_1',
    date: '2026-09-20T21:22:00.000Z',
    result: 'draw',
    opponent: 'Onlayn (#35139)',
    gameMode: 'online',
    myColor: 'black',
    totalMoves: 8,
    reason: 'Durang',
  },
];

export function getRecentGames(): RecentGame[] {
  try {
    const data = localStorage.getItem(RECENT_GAMES_KEY);
    if (data) {
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}
  return DEFAULT_RECENT_GAMES;
}

export function saveRecentGame(game: Omit<RecentGame, 'id' | 'date'>): RecentGame[] {
  try {
    const existing = getRecentGames();
    const newEntry: RecentGame = {
      ...game,
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
    };
    // Keep up to 20 games in history (latest first)
    const updated = [newEntry, ...existing].slice(0, 20);
    localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

