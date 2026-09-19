// =====================================================
// NUR SHAXMAT 100 — Onlayn Multiplayer Xizmati (Supabase Realtime)
// WebSockets Broadcast & Presence yordamida tezkor va barqaror aloqa
// =====================================================

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Move } from '../engine/types';

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
  | { type: 'RESIGN' }
  | { type: 'REMATCH' }
  | { type: 'JOIN' }
  | { type: 'LEAVE' }
  | { type: 'HANDSHAKE' };

export type MessageCallback = (msg: MessageType) => void;
export type StatusCallback = (status: OnlineStatus, extra?: string) => void;

class OnlineManager {
  private channel: RealtimeChannel | null = null;
  private matchChannel: RealtimeChannel | null = null;
  private messageListeners = new Set<MessageCallback>();
  private statusListeners = new Set<StatusCallback>();

  public status: OnlineStatus = 'idle';
  public roomCode: string | null = null;
  public myColor: 'white' | 'black' | null = null;
  public statusMessage: string = '';
  public isMatchmaking: boolean = false;

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
      try { cb(newStatus, extra); } catch (e) { console.error(e); }
    });
  }

  private notifyMessage(msg: MessageType) {
    this.messageListeners.forEach((cb) => {
      try { cb(msg); } catch (e) { console.error(e); }
    });
  }

  /**
   * 1. Yangi xona yaratish (Oq donalar - Host)
   */
  public createRoom(customCode?: string): Promise<string> {
    this.disconnect();
    this.notifyStatus('creating', 'Xona ochilmoqda...');

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
            this.notifyStatus('connected', 'Raqib muvaffaqiyatli ulandi!');
            this.sendMessage({ type: 'HANDSHAKE' });
          } else if (payload.type === 'HANDSHAKE') {
            this.notifyStatus('connected', 'Raqib tayyor!');
          } else if (payload.type === 'LEAVE') {
            this.notifyStatus('disconnected', 'Raqib oʻyindan chiqdi');
          }

          this.notifyMessage(payload as MessageType);
        });

        ch.on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState();
          const presences = Object.values(state).flat();
          const hasWhite = presences.some((p: any) => p.role === 'white');
          const hasBlack = presences.some((p: any) => p.role === 'black');
          if (hasWhite && hasBlack && this.status !== 'connected') {
            this.notifyStatus('connected', 'Raqib muvaffaqiyatli ulandi!');
            this.sendMessage({ type: 'HANDSHAKE' });
          }
        });

        ch.on('presence', { event: 'leave' }, () => {
          if (this.status === 'connected') {
            this.notifyStatus('disconnected', 'Raqib aloqadan uzildi');
          }
        });

        ch.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await ch.track({ role: 'white', joined_at: Date.now() });
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
            this.notifyStatus('connected', 'Xonaga muvaffaqiyatli ulandingiz!');
          } else if (payload.type === 'LEAVE') {
            this.notifyStatus('disconnected', 'Raqib oʻyindan chiqdi');
          }

          this.notifyMessage(payload as MessageType);
        });

        ch.on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState();
          const presences = Object.values(state).flat();
          const hasWhite = presences.some((p: any) => p.role === 'white');
          const hasBlack = presences.some((p: any) => p.role === 'black');
          if (hasWhite && hasBlack && this.status !== 'connected') {
            this.notifyStatus('connected', 'Xonaga muvaffaqiyatli ulandingiz!');
          }
        });

        ch.on('presence', { event: 'leave' }, () => {
          if (this.status === 'connected') {
            this.notifyStatus('disconnected', 'Raqib aloqadan uzildi');
          }
        });

        ch.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            try {
              await ch.track({ role: 'black', joined_at: Date.now() });
            } catch {}

            // JOIN xabarini ishonchli yetib borishi uchun yuboramiz
            ch.send({
              type: 'broadcast',
              event: 'game_event',
              payload: { type: 'JOIN' },
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
                payload: { type: 'JOIN' },
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
  public startMatchmaking(playerName?: string, rating?: number): Promise<string> {
    this.disconnect();
    this.stopMatchmaking();

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
          const { hostId, guestId, roomCode } = payload;
          if (clientId === hostId || clientId === guestId) {
            this.stopMatchmaking();
            if (clientId === hostId) {
              await this.createRoom(roomCode);
              resolve(roomCode);
            } else {
              await this.joinRoom(roomCode);
              resolve(roomCode);
            }
          }
        });

        // Presence yangilanganda kutayotgan boshqa o'yinchini aniqlash
        mCh.on('presence', { event: 'sync' }, async () => {
          if (!this.isMatchmaking) return;
          const state = mCh.presenceState();
          const presences = Object.values(state).flat() as any[];
          const opponents = presences.filter(
            (p) => p && p.id && p.id !== clientId && p.status === 'searching'
          );

          if (opponents.length > 0) {
            // Eng birinchi kutayotgan raqibni tanlaymiz
            const opponent = opponents[0];
            // Deterministic matchmaker: kichikroq ID ga ega o'yinchi host bo'ladi
            if (clientId < opponent.id) {
              const matchedRoomCode = `${Math.floor(10000 + Math.random() * 90000)}`;
              try {
                await mCh.send({
                  type: 'broadcast',
                  event: 'match_paired',
                  payload: {
                    hostId: clientId,
                    guestId: opponent.id,
                    roomCode: matchedRoomCode,
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
    this.statusMessage = '';
  }
}

export const onlineManager = new OnlineManager();
