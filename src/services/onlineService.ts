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
  byTime: Record<number, number>; // e.g. { 600: 24, 300: 16, 180: 9 }
}

class OnlineManager {
  private channel: RealtimeChannel | null = null;
  private matchChannel: RealtimeChannel | null = null;
  private lobbyChannel: RealtimeChannel | null = null;
  private messageListeners = new Set<MessageCallback>();
  private statusListeners = new Set<StatusCallback>();
  private lobbyPresenceListeners = new Set<(counts: LobbyPresenceCounts) => void>();
  private myLobbyKey: string = '';

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
   * Jonli haqiqiy onlayn o'yinchilar sonini tinglash (faqat haqiqiy o'yinchilar)
   */
  public subscribeLobbyPresence(cb: (counts: LobbyPresenceCounts) => void): () => void {
    this.lobbyPresenceListeners.add(cb);

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
      if (this.lobbyPresenceListeners.size === 0 && this.lobbyChannel) {
        try {
          this.lobbyChannel.untrack();
          this.lobbyChannel.unsubscribe();
          supabase.removeChannel(this.lobbyChannel);
        } catch {}
        this.lobbyChannel = null;
      }
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
  }

  /**
   * Faqat haqiqiy boshqa raqiblarni hisoblash (soxta raqamlar yo'q)
   */
  public getRealPresenceCounts(): LobbyPresenceCounts {
    let real300 = 0;
    let real900 = 0;
    let real1800 = 0;

    if (this.lobbyChannel) {
      try {
        const state = this.lobbyChannel.presenceState();
        const presences = Object.values(state).flat() as any[];
        presences.forEach((p) => {
          if (!p) return;
          // O'zimizni raqib sifatida hisoblamaymiz
          if (p.key && p.key === this.myLobbyKey) return;
          if (p.timeSeconds === 1800) real1800++;
          else if (p.timeSeconds === 900) real900++;
          else if (p.timeSeconds === 300) real300++;
          else real300++;
        });
      } catch {}
    }

    return {
      total: real300 + real900 + real1800,
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
          if (this.status === 'connected') {
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
          if (this.status === 'connected') {
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
  public sendMessage(msg: MessageType) {
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'game_event',
          payload: msg,
        });
      } catch (e) {
        console.error('Xabar yuborishda xato:', e);
      }
    } else {
      console.warn('Supabase kanali faol emas, xabar yuborilmadi:', msg);
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
   * Aloqani to'xtatish
   */
  public disconnect() {
    this.stopMatchmaking();
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'game_event',
          payload: { type: 'LEAVE' },
        });
        this.channel.unsubscribe();
        supabase.removeChannel(this.channel);
      } catch {}
      this.channel = null;
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
