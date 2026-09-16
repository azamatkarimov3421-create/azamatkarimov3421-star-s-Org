// =====================================================
// NUR SHAXMAT 100 — Foydalanuvchi Profili va Yutuqlar (Achievements)
// =====================================================

export interface UserProfile {
  name: string;
  rating: number;
  league: string;
  avatar: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  onlineGames: number;
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

const DEFAULT_PROFILE: UserProfile = {
  name: 'Azamat Karimov',
  rating: 1480,
  league: 'Bronza liga',
  avatar: '👤',
  gamesPlayed: 124,
  wins: 78,
  draws: 20,
  losses: 26,
  onlineGames: 6,
};

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
    if (data) return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
  } catch {}
  return DEFAULT_PROFILE;
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

export function recordGameFinished(result: 'win' | 'loss' | 'draw', isOnline: boolean): UserProfile {
  const profile = getUserProfile();
  profile.gamesPlayed += 1;
  if (result === 'win') {
    profile.wins += 1;
    profile.rating += 15;
  } else if (result === 'loss') {
    profile.losses += 1;
    profile.rating = Math.max(1000, profile.rating - 12);
  } else {
    profile.draws += 1;
    profile.rating += 2;
  }
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

  return profile;
}
