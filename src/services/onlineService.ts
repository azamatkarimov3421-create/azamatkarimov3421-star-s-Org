// =====================================================
// NUR SHAXMAT 100 — Onlayn Multiplayer Xizmati (Supabase Realtime)
// WebSockets Broadcast & Presence yordamida tezkor va barqaror aloqa
// =====================================================

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Move } from '../engine/types';
import { getUserProfile } from '../store/userProfileStore';

export type OnlineStatus =
  | 'idle'
  | 'searching'
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type MessageType =
  | { type: 'MOVE'; move: Move }
  | { type: 'OFFER_DRAW' }
  | { type: 'ACCEPT_DRAW' }
  | { type: 'DECLINE_DRAW' }
  | { type: 'RESIGN' }
  | { type: 'REMATCH' }
  | { type: 'JOIN'; playerName?: string; rating?: number }
  | { type: 'LEAVE' }
  | { type: 'HANDSHAKE'; playerName?: string; rating?: number };

export type MessageCallback = (msg: MessageType) => void;
export type StatusCallback = (status: OnlineStatus, extra?: string) => void;

export interface LobbyPresenceCounts {
  total: number;
  byTime: Record<number, number>; // e.g. { 1800: 4, 900: 8, 300: 12 }
}

export interface OnlineUserPresence {
  id: string;
  name: string;
  email?: string;
  rating: number;
  avatarUrl?: string;
  avatarLetter?: string;
  status: 'online' | 'in_game' | 'searching';
  timeSeconds?: number;
  lastActive: number;
}

export interface GameInvitePayload {
  inviteId: string;
  fromId: string;
  fromName: string;
  fromEmail?: string;
  fromRating: number;
  fromAvatar?: string;
  toId: string;
  toEmail?: string;
  roomCode: string;
  timeSeconds: number;
  increment: number;
  timestamp: number;
}

export interface InviteResponsePayload {
  inviteId: string;
  toId: string;
  toEmail?: string;
  fromId: string;
  fromName: string;
  accepted: boolean;
  roomCode: string;
}

class OnlineManager {
  private channel: RealtimeChannel | null = null;
  private matchChannel: RealtimeChannel | null = null;
  private lobbyChannel: RealtimeChannel | null = null;
  private socialChannel: RealtimeChannel | null = null;

  private messageListeners = new Set<MessageCallback>();
  private statusListeners = new Set<StatusCallback>();
  private lobbyPresenceListeners = new Set<(counts: LobbyPresenceCounts) => void>();
  private inviteListeners = new Set<(invite: GameInvitePayload) => void>();
  private inviteResponseListeners = new Set<(res: InviteResponsePayload) => void>();
  private onlineUsersListeners = new Set<(users: OnlineUserPresence[]) => void>();

  private myLobbyKey: string = '';
  private mySocialKey: string = '';

  public status: OnlineStatus = 'idle';
  public roomCode: string | null = null;
  public myColor: 'white' | 'black' | null = null;
  public opponentName: string = 'Raqib';
  public opponentRating: number = 1200;
  public statusMessage: string = '';
  public isMatchmaking: boolean = false;
  public selectedTimeSeconds: number = 300;
  public selectedIncrement: number = 5;

  public addMessageListener(cb: MessageCallback): () => void {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public addStatusListener(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    cb(this.status, this.statusMessage);
    return () => this.statusListeners.delete(cb);
  }

  public addInviteListener(cb: (invite: GameInvitePayload) => void): () => void {
    this.inviteListeners.add(cb);
    return () => this.inviteListeners.delete(cb);
  }

  public addInviteResponseListener(cb: (res: InviteResponsePayload) => void): () => void {
    this.inviteResponseListeners.add(cb);
    return () => this.inviteResponseListeners.delete(cb);
  }

  public subscribeOnlineUsers(cb: (users: OnlineUserPresence[]) => void): () => void {
    this.onlineUsersListeners.add(cb);
    cb(this.getOnlineUsers());
    return () => this.onlineUsersListeners.delete(cb);
  }

  private notifyStatus(newStatus: OnlineStatus, extra?: string) {
    this.status = newStatus;
    this.statusMessage = extra || '';
    this.statusListeners.forEach((cb) => {
      try {
        cb(newStatus, this.statusMessage);
      } catch (e) {
        console.error('Status listener error:', e);
      }
    });
  }

  private notifyMessage(msg: MessageType) {
    this.messageListeners.forEach((cb) => {
      try {
        cb(msg);
      } catch (e) {
        console.error('Message listener error:', e);
      }
    });
  }

  /**
   * Global ijtimoiy presence va do'stlar taklifini qabul qilishni boshlash
   */
  public initSocialPresence() {
    if (this.socialChannel || !supabase) return;

    const profile = getUserProfile();
    this.mySocialKey = `usr_${profile.email ? profile.email.replace(/[^a-z0-9]/gi, '_') : Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      const sCh = supabase.channel('nur_social_presence_v2', {
        config: {
          broadcast: { self: false },
          presence: { key: this.mySocialKey },
        },
      });
      this.socialChannel = sCh;

      // O'yin takliflarini qabul qilish
      sCh.on('broadcast', { event: 'game_invite' }, ({ payload }) => {
        if (!payload) return;
        const myP = getUserProfile();
        const isForMe =
          (payload.toEmail && myP.email && payload.toEmail.toLowerCase() === myP.email.toLowerCase()) ||
          (payload.toId && myP.id && payload.toId === myP.id) ||
          (payload.toId && myP.email && payload.toId === myP.email);

        if (isForMe && myP.isGoogleLinked) {
          this.inviteListeners.forEach((cb) => {
            try { cb(payload as GameInvitePayload); } catch {}
          });
        }
      });

      // O'yin taklifiga javob kelishi
      sCh.on('broadcast', { event: 'invite_response' }, ({ payload }) => {
        if (!payload) return;
        const myP = getUserProfile();
        const isForMe =
          (payload.toEmail && myP.email && payload.toEmail.toLowerCase() === myP.email.toLowerCase()) ||
          (payload.toId && myP.id && payload.toId === myP.id) ||
          (payload.toId && myP.email && payload.toId === myP.email);

        if (isForMe) {
          this.inviteResponseListeners.forEach((cb) => {
            try { cb(payload as InviteResponsePayload); } catch {}
          });
        }
      });

      sCh.on('presence', { event: 'sync' }, () => {
        this.broadcastSocialPresence();
        this.broadcastPresenceCounts();
      });

      sCh.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const myP = getUserProfile();
          try {
            await sCh.track({
              key: this.mySocialKey,
              id: myP.id || myP.email || this.mySocialKey,
              name: myP.name || 'Oʻyinchi',
              email: myP.email,
              rating: myP.rating || 1200,
              avatarUrl: myP.avatarUrl,
              status: this.roomCode ? 'in_game' : 'online',
              timeSeconds: this.selectedTimeSeconds,
              lastActive: Date.now(),
            });
          } catch {}
          this.broadcastSocialPresence();
          this.broadcastPresenceCounts();
        }
      });
    } catch (e) {
      console.warn('Social presence error:', e);
    }
  }

  public getOnlineUsers(): OnlineUserPresence[] {
    const list: OnlineUserPresence[] = [];
    if (this.socialChannel) {
      try {
        const state = this.socialChannel.presenceState();
        const presences = Object.values(state).flat() as any[];
        presences.forEach((p) => {
          if (!p || !p.name) return;
          list.push({
            id: p.id || p.key,
            name: p.name,
            email: p.email,
            rating: typeof p.rating === 'number' ? p.rating : 1200,
            avatarUrl: p.avatarUrl,
            avatarLetter: (p.name || 'A').charAt(0).toUpperCase(),
            status: p.status || 'online',
            timeSeconds: p.timeSeconds || 300,
            lastActive: p.lastActive || Date.now(),
          });
        });
      } catch {}
    }
    return list;
  }

  private broadcastSocialPresence() {
    const users = this.getOnlineUsers();
    this.onlineUsersListeners.forEach((cb) => {
      try { cb(users); } catch {}
    });
  }

  /**
   * Jonli haqiqiy onlayn o'yinchilar sonini tinglash
   */
  public subscribeLobbyPresence(cb: (counts: LobbyPresenceCounts) => void): () => void {
    this.lobbyPresenceListeners.add(cb);
    this.initSocialPresence();

    if (!this.myLobbyKey) {
      this.myLobbyKey = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    if (!this.lobbyChannel && supabase) {
      try {
        const lCh = supabase.channel('nur_lobby_online_v1', {
          config: { presence: { key: this.myLobbyKey } },
        });
        this.lobbyChannel = lCh;

        lCh.on('presence', { event: 'sync' }, () => {
          this.broadcastPresenceCounts();
        });

        lCh.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await lCh.track({
                key: this.myLobbyKey,
                timeSeconds: this.selectedTimeSeconds,
                active_at: Date.now(),
              });
            } catch {}
            this.broadcastPresenceCounts();
          }
        });
      } catch (e) {
        console.warn('Lobby presence subscription error:', e);
      }
    }

    cb(this.getRealPresenceCounts());

    return () => {
      this.lobbyPresenceListeners.delete(cb);
    };
  }

  public updateLobbyTimeControl(timeSeconds: number) {
    this.selectedTimeSeconds = timeSeconds;
    if (this.lobbyChannel && this.myLobbyKey) {
      try {
        this.lobbyChannel.track({
          key: this.myLobbyKey,
          timeSeconds,
          active_at: Date.now(),
        });
      } catch {}
    }
    if (this.socialChannel && this.mySocialKey) {
      const myP = getUserProfile();
      try {
        this.socialChannel.track({
          key: this.mySocialKey,
          id: myP.id || myP.email || this.mySocialKey,
          name: myP.name || 'Oʻyinchi',
          email: myP.email,
          rating: myP.rating || 1200,
          avatarUrl: myP.avatarUrl,
          status: this.roomCode ? 'in_game' : 'online',
          timeSeconds,
          lastActive: Date.now(),
        });
      } catch {}
    }
    this.broadcastPresenceCounts();
  }

  /**
   * Haqiqiy onlayn o'yinchilar sonini to'liq hisoblash
   */
  public getRealPresenceCounts(): LobbyPresenceCounts {
    let real300 = 0;
    let real900 = 0;
    let real1800 = 0;

    const seenKeys = new Set<string>();

    const processPresences = (channel: RealtimeChannel | null) => {
      if (!channel) return;
      try {
        const state = channel.presenceState();
        const presences = Object.values(state).flat() as any[];
        presences.forEach((p) => {
          if (!p) return;
          const key = p.key || p.id || p.email;
          if (key && seenKeys.has(key)) return;
          if (key) seenKeys.add(key);

          if (p.timeSeconds === 1800) real1800++;
          else if (p.timeSeconds === 900) real900++;
          else real300++;
        });
      } catch {}
    };

    processPresences(this.socialChannel);
    processPresences(this.lobbyChannel);

    const total = Math.max(seenKeys.size, 1);

    // Agar boshqa hech kim ulanmagan bo'lsa, o'zimiz tanlagan toifaga 1 o'yinchi qo'shamiz
    if (real300 === 0 && real900 === 0 && real1800 === 0) {
      if (this.selectedTimeSeconds === 1800) real1800 = 1;
      else if (this.selectedTimeSeconds === 900) real900 = 1;
      else real300 = 1;
    }

    return {
      total,
      byTime: {
        300: real300,
        900: real900,
        1800: real1800,
      },
    };
  }

  public getEstimatedPresenceCounts(): LobbyPresenceCounts {
    return this.getRealPresenceCounts();
  }

  private broadcastPresenceCounts() {
    const counts = this.getRealPresenceCounts();
    this.lobbyPresenceListeners.forEach((cb) => {
      try { cb(counts); } catch {}
    });
  }

  /**
   * Do'stga to'g'ridan-to'g'ri o'yin taklifi yuborish
   */
  public async sendGameInvite(
    friend: { id: string; email?: string; name: string },
    timeSeconds: number = 300,
    increment: number = 5
  ): Promise<{ roomCode: string; inviteId: string }> {
    this.initSocialPresence();
    const myProfile = getUserProfile();
    const roomCode = `${Math.floor(10000 + Math.random() * 90000)}`;
    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    this.selectedTimeSeconds = timeSeconds;
    this.selectedIncrement = increment;

    const payload: GameInvitePayload = {
      inviteId,
      fromId: myProfile.id || myProfile.email || 'user',
      fromName: myProfile.name,
      fromEmail: myProfile.email,
      fromRating: myProfile.rating,
      fromAvatar: myProfile.avatarUrl,
      toId: friend.id,
      toEmail: friend.email,
      roomCode,
      timeSeconds,
      increment,
      timestamp: Date.now(),
    };

    if (this.socialChannel) {
      try {
        await this.socialChannel.send({
          type: 'broadcast',
          event: 'game_invite',
          payload,
        });
      } catch (e) {
        console.error('Taklif yuborishda xato:', e);
      }
    }

    // Taklif yuboruvchi darhol White sifatida xona ochadi
    await this.createRoom(roomCode);

    return { roomCode, inviteId };
  }

  /**
   * Taklifga javob qaytarish (Qabul qilish yoki rad etish)
   */
  public async respondToGameInvite(invite: GameInvitePayload, accepted: boolean) {
    if (!this.socialChannel) this.initSocialPresence();
    const myProfile = getUserProfile();

    if (this.socialChannel) {
      try {
        await this.socialChannel.send({
          type: 'broadcast',
          event: 'invite_response',
          payload: {
            inviteId: invite.inviteId,
            toId: invite.fromId,
            toEmail: invite.fromEmail,
            fromId: myProfile.id || myProfile.email || 'user',
            fromName: myProfile.name,
            accepted,
            roomCode: invite.roomCode,
          },
        });
      } catch (e) {
        console.error('Taklifga javob yuborishda xato:', e);
      }
    }

    if (accepted) {
      this.selectedTimeSeconds = invite.timeSeconds || 300;
      this.selectedIncrement = invite.increment || 5;
      await this.joinRoom(invite.roomCode);
    }
  }

  /**
   * 1. Yangi xona yaratish (Oq donalar - Host)
   */
  public createRoom(customCode?: string): Promise<string> {
    this.disconnect();
    this.notifyStatus('creating', 'Xona yaratilmoqda...');

    const code = customCode || `${Math.floor(10000 + Math.random() * 90000)}`;
    this.roomCode = code;
    this.myColor = 'white';

    return new Promise((resolve, reject) => {
      try {
        const ch = supabase.channel(`nur_room_${code}`, {
          config: {
            broadcast: { self: false },
            presence: { key: 'white' },
          },
        });

        this.channel = ch;

        ch.on('broadcast', { event: 'game_event' }, ({ payload }) => {
          if (!payload || !payload.type) return;

          if (payload.type === 'JOIN') {
            if (payload.playerName) this.opponentName = payload.playerName;
            if (typeof payload.rating === 'number') this.opponentRating = payload.rating;
            this.notifyStatus('connected', `${this.opponentName} xonaga ulandi!`);

            const myProfile = getUserProfile();
            ch.send({
              type: 'broadcast',
              event: 'game_event',
              payload: {
                type: 'HANDSHAKE',
                playerName: myProfile.name,
                rating: myProfile.rating,
              },
            });
          } else if (payload.type === 'HANDSHAKE') {
            if (payload.playerName) this.opponentName = payload.playerName;
            if (typeof payload.rating === 'number') this.opponentRating = payload.rating;
            this.notifyStatus('connected', `${this.opponentName} tayyor!`);
          } else if (payload.type === 'LEAVE') {
            this.notifyStatus('disconnected', `${this.opponentName} xonani tark etdi`);
          }

          this.notifyMessage(payload as MessageType);
        });

        ch.on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState();
          const presences = Object.values(state).flat() as any[];
          const opponent = presences.find((p: any) => p && p.role === 'black');
          if (opponent) {
            if (opponent.name) this.opponentName = opponent.name;
            if (typeof opponent.rating === 'number') this.opponentRating = opponent.rating;
          }
          const hasWhite = presences.some((p: any) => p && p.role === 'white');
          const hasBlack = presences.some((p: any) => p && p.role === 'black');
          if (hasWhite && hasBlack && this.status !== 'connected') {
            this.notifyStatus('connected', `${this.opponentName} xonaga ulandi!`);
          }
        });

        ch.on('presence', { event: 'leave' }, () => {
          if (this.roomCode) {
            this.notifyStatus('disconnected', `${this.opponentName} aloqadan uzildi`);
            this.notifyMessage({ type: 'LEAVE' });
          }
        });

        ch.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const myProfile = getUserProfile();
            try {
              await ch.track({
                role: 'white',
                name: myProfile.name,
                rating: myProfile.rating,
                joined_at: Date.now(),
              });
            } catch {}
            this.notifyStatus('waiting', 'Raqib ulanishi kutilmoqda...');
            resolve(code);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.notifyStatus('error', 'Xona ochishda xatolik yuz berdi');
            reject(new Error(status));
          }
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message || 'Xatolik');
        reject(e);
      }
    });
  }

  /**
   * 2. Mavjud xonaga ulanish (Qora donalar - Guest)
   */
  public joinRoom(roomCode: string): Promise<void> {
    this.disconnect();
    this.notifyStatus('connecting', 'Xonaga ulanmoqda...');

    const cleanCode = roomCode.trim().toUpperCase().replace(/^NUR-?/i, '');
    this.roomCode = cleanCode;
    this.myColor = 'black';

    return new Promise((resolve, reject) => {
      try {
        const ch = supabase.channel(`nur_room_${cleanCode}`, {
          config: {
            broadcast: { self: false },
            presence: { key: 'black' },
          },
        });

        this.channel = ch;

        ch.on('broadcast', { event: 'game_event' }, ({ payload }) => {
          if (!payload || !payload.type) return;

          if (payload.type === 'HANDSHAKE') {
            if (payload.playerName) this.opponentName = payload.playerName;
            if (typeof payload.rating === 'number') this.opponentRating = payload.rating;
            this.notifyStatus('connected', `${this.opponentName} bilan o'yin boshlandi!`);
          } else if (payload.type === 'LEAVE') {
            this.notifyStatus('disconnected', `${this.opponentName} oʻyindan chiqdi`);
          }

          this.notifyMessage(payload as MessageType);
        });

        ch.on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState();
          const presences = Object.values(state).flat() as any[];
          const opponent = presences.find((p: any) => p && p.role === 'white');
          if (opponent) {
            if (opponent.name) this.opponentName = opponent.name;
            if (typeof opponent.rating === 'number') this.opponentRating = opponent.rating;
          }
          const hasWhite = presences.some((p: any) => p && p.role === 'white');
          const hasBlack = presences.some((p: any) => p && p.role === 'black');
          if (hasWhite && hasBlack && this.status !== 'connected') {
            this.notifyStatus('connected', `${this.opponentName} bilan o'yin boshlandi!`);
          }
        });

        ch.on('presence', { event: 'leave' }, () => {
          if (this.roomCode) {
            this.notifyStatus('disconnected', `${this.opponentName} aloqadan uzildi`);
            this.notifyMessage({ type: 'LEAVE' });
          }
        });

        ch.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const myProfile = getUserProfile();
            try {
              await ch.track({
                role: 'black',
                name: myProfile.name,
                rating: myProfile.rating,
                joined_at: Date.now(),
              });
            } catch {}

            const joinPayload = {
              type: 'JOIN' as const,
              playerName: myProfile.name,
              rating: myProfile.rating,
            };

            ch.send({
              type: 'broadcast',
              event: 'game_event',
              payload: joinPayload,
            });

            let count = 0;
            const retryJoin = setInterval(() => {
              count++;
              if (this.status === 'connected' || count >= 4) {
                clearInterval(retryJoin);
                return;
              }
              ch.send({
                type: 'broadcast',
                event: 'game_event',
                payload: joinPayload,
              });
            }, 600);

            this.notifyStatus('connected', 'Xonaga muvaffaqiyatli ulandingiz!');
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.notifyStatus('error', 'Xonaga ulanib boʻlmadi. Kodni tekshiring.');
            reject(new Error(status));
          }
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message || 'Xatolik');
        reject(e);
      }
    });
  }

  /**
   * Harakat yoki xabarni raqibga yuborish
   */
  public sendMessage(msg: MessageType): Promise<any> {
    if (this.channel) {
      try {
        return this.channel.send({
          type: 'broadcast',
          event: 'game_event',
          payload: msg,
        });
      } catch (e) {
        console.error('Xabar yuborishda xato:', e);
        return Promise.resolve();
      }
    } else {
      console.warn('Supabase kanali faol emas, xabar yuborilmadi:', msg);
      return Promise.resolve();
    }
  }

  /**
   * 3. Tezkor tasodifiy raqib qidirish (Random Matchmaking Lobby)
   */
  public startMatchmaking(
    playerName?: string,
    rating?: number,
    timeSeconds: number = 300,
    increment: number = 5
  ): Promise<string> {
    this.disconnect();
    this.stopMatchmaking();

    this.selectedTimeSeconds = timeSeconds;
    this.selectedIncrement = increment;
    this.isMatchmaking = true;
    const clientId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.notifyStatus('searching', 'Jonli raqib qidirilmoqda...');

    return new Promise((resolve, reject) => {
      try {
        const mCh = supabase.channel('nur_matchmaking_lobby_v1', {
          config: {
            broadcast: { self: false },
            presence: { key: clientId },
          },
        });
        this.matchChannel = mCh;

        // Boshqa o'yinchi tomonidan juftlik e'lon qilinganda
        mCh.on('broadcast', { event: 'match_paired' }, async ({ payload }) => {
          if (!payload || !this.isMatchmaking) return;
          const { hostId, guestId, roomCode, hostName, hostRating, guestName, guestRating } = payload;
          if (clientId === hostId || clientId === guestId) {
            this.stopMatchmaking();
            if (clientId === hostId) {
              if (guestName) this.opponentName = guestName;
              if (typeof guestRating === 'number') this.opponentRating = guestRating;
              await this.createRoom(roomCode);
              resolve(roomCode);
            } else {
              if (hostName) this.opponentName = hostName;
              if (typeof hostRating === 'number') this.opponentRating = hostRating;
              await this.joinRoom(roomCode);
              resolve(roomCode);
            }
          }
        });

        // Presence yangilanganda mos vaqt toifasidagi kutayotgan raqibni aniqlash
        mCh.on('presence', { event: 'sync' }, async () => {
          if (!this.isMatchmaking) return;
          const state = mCh.presenceState();
          const presences = Object.values(state).flat() as any[];
          const opponents = presences.filter(
            (p) => p && p.id && p.id !== clientId && p.status === 'searching' && (!p.timeSeconds || p.timeSeconds === timeSeconds)
          );

          if (opponents.length > 0) {
            // Eng birinchi kutayotgan raqibni tanlaymiz
            const opponent = opponents[0];
            // Deterministic matchmaker: kichikroq ID ga ega o'yinchi host bo'ladi
            if (clientId < opponent.id) {
              const matchedRoomCode = `${Math.floor(10000 + Math.random() * 90000)}`;
              this.opponentName = opponent.name || 'Raqib';
              if (typeof opponent.rating === 'number') this.opponentRating = opponent.rating;

              try {
                await mCh.send({
                  type: 'broadcast',
                  event: 'match_paired',
                  payload: {
                    hostId: clientId,
                    hostName: playerName || 'Oʻyinchi',
                    hostRating: rating || 1200,
                    guestId: opponent.id,
                    guestName: opponent.name || 'Raqib',
                    guestRating: opponent.rating || 1200,
                    roomCode: matchedRoomCode,
                    timeSeconds,
                    increment,
                  },
                });
              } catch {}

              this.stopMatchmaking();
              await this.createRoom(matchedRoomCode);
              resolve(matchedRoomCode);
            }
          }
        });

        mCh.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await mCh.track({
                id: clientId,
                name: playerName || 'Oʻyinchi',
                rating: rating || 1200,
                timeSeconds,
                increment,
                status: 'searching',
                joined_at: Date.now(),
              });
            } catch {}
            this.notifyStatus('searching', 'Jonli raqib qidirilmoqda...');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.notifyStatus('error', 'Qidiruv serveriga ulanishda xatolik yuz berdi');
            reject(new Error(status));
          }
        });
      } catch (err: any) {
        this.notifyStatus('error', err.message || 'Xatolik');
        reject(err);
      }
    });
  }

  /**
   * Qidiruvni to'xtatish
   */
  public stopMatchmaking() {
    this.isMatchmaking = false;
    if (this.matchChannel) {
      try {
        this.matchChannel.untrack();
        this.matchChannel.unsubscribe();
        supabase.removeChannel(this.matchChannel);
      } catch {}
      this.matchChannel = null;
    }
    if (this.status === 'searching') {
      this.status = 'idle';
      this.statusMessage = '';
    }
  }

  /**
   * Xonani tark etish va raqibga zudlik bilan xabar jo'natish
   */
  public async leaveGame(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.send({
          type: 'broadcast',
          event: 'game_event',
          payload: { type: 'LEAVE' },
        });
        await this.channel.untrack();
      } catch (e) {
        console.warn('leaveGame send error:', e);
      }
      // WebSocket uzatmasi serverga yetib borishi uchun 200ms kutish
      await new Promise((r) => setTimeout(r, 200));
    }
    this.disconnect();
  }

  /**
   * Aloqani to'xtatish (Kanalni xavfsiz va ishonchli tozalash)
   */
  public disconnect() {
    this.stopMatchmaking();
    if (this.channel) {
      const ch = this.channel;
      this.channel = null;
      try {
        ch.send({
          type: 'broadcast',
          event: 'game_event',
          payload: { type: 'LEAVE' },
        });
        ch.untrack();
      } catch {}
      // WebSocket buferidagi xabar chiqib ketishiga imkon berish uchun 400ms kechiktirib yopamiz
      setTimeout(() => {
        try {
          ch.unsubscribe();
          supabase.removeChannel(ch);
        } catch {}
      }, 400);
    }
    this.status = 'idle';
    this.roomCode = null;
    this.myColor = null;
    this.opponentName = 'Raqib';
    this.opponentRating = 1200;
    this.statusMessage = '';
  }
}

export const onlineManager = new OnlineManager();
