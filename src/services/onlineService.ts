// =====================================================
// NUR SHAXMAT 100 — Onlayn Multiplayer Xizmati (P2P Realtime)
// WebRTC DataChannel (PeerJS) yordamida 0-kechikishli to'g'ridan-to'g'ri aloqa
// =====================================================

import Peer, { DataConnection } from 'peerjs';
import { Move } from '../engine/types';

export type OnlineStatus =
  | 'idle'
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
  | { type: 'HANDSHAKE' };

export type MessageCallback = (msg: MessageType) => void;
export type StatusCallback = (status: OnlineStatus, extra?: string) => void;

// WebRTC STUN serverlari (turli tarmoqlar va mobil internet orqali ulanish uchun)
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

class OnlineManager {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private messageListeners = new Set<MessageCallback>();
  private statusListeners = new Set<StatusCallback>();

  public status: OnlineStatus = 'idle';
  public roomCode: string | null = null;
  public myColor: 'white' | 'black' | null = null;
  public statusMessage: string = '';

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
    const peerId = `nur100-${code}`;

    this.roomCode = code;
    this.myColor = 'white';

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          config: ICE_CONFIG,
          debug: 1,
        });

        this.peer.on('open', () => {
          this.notifyStatus('waiting', 'Raqib ulanishi kutilmoqda...');
          resolve(code);
        });

        this.peer.on('connection', (connection) => {
          this.conn = connection;
          this.setupConnection();
          connection.on('open', () => {
            this.notifyStatus('connected', 'Raqib muvaffaqiyatli ulandi!');
            this.sendMessage({ type: 'HANDSHAKE' });
          });
        });

        this.peer.on('error', (err: any) => {
          console.warn('PeerJS xonasi xatosi:', err);
          if (err.type === 'unavailable-id') {
            this.createRoom().then(resolve).catch(reject);
          } else {
            this.notifyStatus('error', err.message || 'Xona ochishda xatolik');
            reject(err);
          }
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message);
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
    const peerId = `nur100-${cleanCode}`;

    this.roomCode = cleanCode;
    this.myColor = 'black';

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          config: ICE_CONFIG,
          debug: 1,
        });

        this.peer.on('open', () => {
          if (!this.peer) return;

          const connection = this.peer.connect(peerId, {
            reliable: true,
          });

          this.conn = connection;
          this.setupConnection();

          connection.on('open', () => {
            this.notifyStatus('connected', 'Xonaga muvaffaqiyatli ulandingiz!');
            this.sendMessage({ type: 'HANDSHAKE' });
            resolve();
          });

          connection.on('error', (err) => {
            console.error('Ulanish xatosi:', err);
            this.notifyStatus('error', 'Xonaga ulanib boʻlmadi');
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          console.error('Peer error:', err);
          this.notifyStatus('error', 'Xona topilmadi yoki raqib oflayn');
          reject(err);
        });
      } catch (e: any) {
        this.notifyStatus('error', e.message);
        reject(e);
      }
    });
  }

  private setupConnection() {
    if (!this.conn) return;

    this.conn.on('data', (data: any) => {
      if (data && typeof data === 'object' && data.type) {
        if (data.type === 'HANDSHAKE') {
          this.notifyStatus('connected', 'Raqib ulandi va tayyor!');
        }
        this.notifyMessage(data as MessageType);
      }
    });

    this.conn.on('close', () => {
      this.notifyStatus('disconnected', 'Raqib oʻyindan chiqdi');
    });

    this.conn.on('error', (err) => {
      console.warn('Aloqa uzildi:', err);
      this.notifyStatus('disconnected', 'Aloqa uzildi');
    });
  }

  /**
   * Harakat yoki xabarni raqibga yuborish
   */
  public sendMessage(msg: MessageType) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch (e) {
        console.error('Xabar yuborishda xato:', e);
      }
    } else {
      console.warn('Ulanish ochiq emas, xabar yuborilmadi:', msg);
    }
  }

  /**
   * Aloqani to'xtatish
   */
  public disconnect() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
    this.status = 'idle';
    this.roomCode = null;
    this.myColor = null;
    this.statusMessage = '';
  }
}

export const onlineManager = new OnlineManager();
