// =====================================================
// NUR SHAXMAT 100 — Do'stlar Tizimi va Do'stlar Reytingi (Friends Store)
// Har bir foydalanuvchi maksimal 10 tagacha do'st qo'shishi mumkin
// =====================================================

import { UserProfile } from './userProfileStore';

export interface FriendItem {
  id: string;
  name: string;
  email?: string;
  rating: number;
  avatarUrl?: string;
  avatarLetter?: string;
  addedAt: string;
}

export interface RankedFriend {
  rank: number;
  id: string;
  name: string;
  email?: string;
  rating: number;
  avatarUrl?: string;
  avatarLetter: string;
  isMe: boolean;
  onlineStatus: 'online' | 'in_game' | 'offline';
  addedAt?: string;
}

export const MAX_FRIENDS_LIMIT = 10;

const FRIENDS_STORAGE_PREFIX = 'nur_chess_friends_v2_';

function getStorageKey(userEmail?: string): string {
  if (userEmail && userEmail.trim()) {
    return `${FRIENDS_STORAGE_PREFIX}${userEmail.trim().toLowerCase()}`;
  }
  return `${FRIENDS_STORAGE_PREFIX}default`;
}

let listeners = new Set<(friends: FriendItem[]) => void>();

function notifyListeners(friends: FriendItem[]) {
  listeners.forEach((cb) => {
    try {
      cb(friends);
    } catch {}
  });
}

/**
 * Foydalanuvchining do'stlari ro'yxatini olish (Faqat haqiqiy qo'shilgan do'stlar)
 */
export function getFriends(userEmail?: string): FriendItem[] {
  try {
    const key = getStorageKey(userEmail);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Eski demo do'stlarni (f_nodirbek, f_javohir, f_rustam) tozalash
        const filtered = parsed.filter(
          (f) => f && f.id !== 'f_nodirbek' && f.id !== 'f_javohir' && f.id !== 'f_rustam'
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
        }
        return filtered.slice(0, MAX_FRIENDS_LIMIT);
      }
    }
  } catch {}

  return [];
}

/**
 * Do'stlar ro'yxatini saqlash
 */
export function saveFriends(friends: FriendItem[], userEmail?: string): void {
  try {
    const key = getStorageKey(userEmail);
    const sliced = friends.slice(0, MAX_FRIENDS_LIMIT);
    localStorage.setItem(key, JSON.stringify(sliced));
    notifyListeners(sliced);
  } catch (e) {
    console.error('Do\'stlarni saqlashda xato:', e);
  }
}

/**
 * Yangi do'st qo'shish (Maksimal 10 ta)
 */
export function addFriend(
  friend: {
    id?: string;
    name: string;
    email?: string;
    rating?: number;
    avatarUrl?: string;
  },
  currentUserEmail?: string
): { success: boolean; message: string; friends: FriendItem[] } {
  const current = getFriends(currentUserEmail);

  if (current.length >= MAX_FRIENDS_LIMIT) {
    return {
      success: false,
      message: `Maksimal ${MAX_FRIENDS_LIMIT} tagacha doʻst qoʻshish mumkin! Yangi doʻst qoʻshish uchun mavjudlaridan birini oʻchiring.`,
      friends: current,
    };
  }

  const cleanName = friend.name ? friend.name.trim() : '';
  if (!cleanName) {
    return {
      success: false,
      message: 'Doʻstning ismi yoki pochtasi kiritilishi shart!',
      friends: current,
    };
  }

  const cleanEmail = friend.email ? friend.email.trim().toLowerCase() : undefined;

  // O'zini o'zi qo'shishni oldini olish
  if (currentUserEmail && cleanEmail && cleanEmail === currentUserEmail.trim().toLowerCase()) {
    return {
      success: false,
      message: 'Oʻzingizni doʻstlar roʻyxatiga qoʻsha olmaysiz!',
      friends: current,
    };
  }

  // Takroriy qo'shishni tekshirish
  const exists = current.some((f) => {
    if (cleanEmail && f.email && f.email.toLowerCase() === cleanEmail) return true;
    if (friend.id && f.id === friend.id) return true;
    if (f.name.toLowerCase() === cleanName.toLowerCase()) return true;
    return false;
  });

  if (exists) {
    return {
      success: false,
      message: `“${cleanName}” allaqachon doʻstlaringiz roʻyxatida mavjud!`,
      friends: current,
    };
  }

  const newFriend: FriendItem = {
    id: friend.id || `fr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    email: cleanEmail,
    rating: typeof friend.rating === 'number' && friend.rating > 0 ? friend.rating : 1200,
    avatarUrl: friend.avatarUrl,
    avatarLetter: cleanName.charAt(0).toUpperCase() || '👤',
    addedAt: new Date().toISOString(),
  };

  const updated = [newFriend, ...current].slice(0, MAX_FRIENDS_LIMIT);
  saveFriends(updated, currentUserEmail);

  return {
    success: true,
    message: `“${cleanName}” doʻstlaringiz roʻyxatiga muvaffaqiyatli qoʻshildi! (${updated.length}/${MAX_FRIENDS_LIMIT})`,
    friends: updated,
  };
}

/**
 * Do'stni ro'yxatdan o'chirish
 */
export function removeFriend(friendId: string, currentUserEmail?: string): FriendItem[] {
  const current = getFriends(currentUserEmail);
  const updated = current.filter((f) => f.id !== friendId);
  saveFriends(updated, currentUserEmail);
  return updated;
}

/**
 * Do'stlar ro'yxatidagi o'zgarishlarni tinglash
 */
export function subscribeFriends(cb: (friends: FriendItem[]) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Do'stlar va o'zining reytingi bo'yicha saralangan jadvalini tuzish
 * (O'yinchi o'z o'rnini do'stlari bilan birgalikda ko'radi)
 */
export function getRankedFriendsList(
  myProfile: UserProfile,
  onlinePresences: {
    id?: string;
    email?: string;
    name?: string;
    status?: string;
    rating?: number;
  }[] = []
): RankedFriend[] {
  const friends = getFriends(myProfile.email);

  // 1. Joriy foydalanuvchining kartochkasi
  const meEntry: RankedFriend = {
    rank: 1,
    id: myProfile.id || myProfile.email || 'me',
    name: myProfile.name || 'Siz',
    email: myProfile.email,
    rating: myProfile.rating || 1200,
    avatarUrl: myProfile.avatarUrl,
    avatarLetter: (myProfile.name || 'A').charAt(0).toUpperCase(),
    isMe: true,
    onlineStatus: 'online',
  };

  // 2. Do'stlarni onlayn holatiga qarab yangilash
  const friendEntries: RankedFriend[] = friends.map((f) => {
    // Agar do'st hozirda Supabase Realtime presenceda bo'lsa
    const matchedOnline = onlinePresences.find((p) => {
      if (f.email && p.email && f.email.toLowerCase() === p.email.toLowerCase()) return true;
      if (p.id && f.id === p.id) return true;
      if (p.name && f.name.toLowerCase() === p.name.toLowerCase()) return true;
      return false;
    });

    let onlineStatus: 'online' | 'in_game' | 'offline' = 'offline';
    let currentRating = f.rating;

    if (matchedOnline) {
      onlineStatus = matchedOnline.status === 'in_game' ? 'in_game' : 'online';
      if (typeof matchedOnline.rating === 'number' && matchedOnline.rating > 0) {
        currentRating = matchedOnline.rating;
      }
    }

    return {
      rank: 0,
      id: f.id,
      name: f.name,
      email: f.email,
      rating: currentRating,
      avatarUrl: f.avatarUrl,
      avatarLetter: f.avatarLetter || f.name.charAt(0).toUpperCase(),
      isMe: false,
      onlineStatus,
      addedAt: f.addedAt,
    };
  });

  // 3. O'zi va barcha do'stlarini jamlab, REYTING BO'YICHA KAMAYISH TARTIBIDA SARALASH
  const combined = [meEntry, ...friendEntries].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    // Agar reyting teng bo'lsa, o'zimiz yuqoriroqda yoki alifbo tartibida
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    return a.name.localeCompare(b.name);
  });

  // 4. Tartib raqamlarini (Rank: 1, 2, 3...) belgilash
  return combined.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
