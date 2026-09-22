// =====================================================
// NUR SHAXMAT 100 — Tizim Tashxisi va Xatoliklar Logeri (Logger Service)
// Barcha xatoliklar va ogohlantirishlarni o'zbek tilida tushunarli
// shaklda saqlaydi va ekranga chiqarish imkonini beradi.
// =====================================================

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'AI_ENGINE' | 'GAME_LOGIC' | 'UI' | 'AUDIO' | 'NETWORK' | 'SYSTEM';
  message: string;
  details?: string;
}

type LogListener = (entry: LogEntry, allLogs: LogEntry[]) => void;

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 100;

  constructor() {
    this.initGlobalHandlers();
  }

  private initGlobalHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      // Konsolga xavfsiz yozish, ekranga xatolik oynasi chiqarmaslik
      console.warn('[NurChess Error]:', event.error || event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      // Autoplay yoki fon jarayonlaridagi xatoliklarni jimgina o'tkazib yuborish
      console.warn('[NurChess Handled Rejection]:', event.reason);
    });
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(entry: LogEntry) {
    this.listeners.forEach((listener) => {
      try {
        listener(entry, this.logs);
      } catch (err) {
        console.error('Log listener error:', err);
      }
    });
  }

  public logInfo(category: LogEntry['category'], message: string, details?: any) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      category,
      message,
      details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : undefined,
    };
    this.addLog(entry);
  }

  public logWarn(category: LogEntry['category'], message: string, details?: any) {
    console.warn(`[${category}] ${message}`, details);
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'warn',
      category,
      message,
      details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : undefined,
    };
    this.addLog(entry);
  }

  public logError(category: LogEntry['category'], message: string, error?: any) {
    console.error(`[${category}] ${message}`, error);
    let detailsStr = '';
    if (error instanceof Error) {
      detailsStr = `${error.name}: ${error.message}\n${error.stack || ''}`;
    } else if (error) {
      detailsStr = typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error);
    }

    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'error',
      category,
      message,
      details: detailsStr || undefined,
    };
    this.addLog(entry);
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    this.notify(entry);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const logger = new LoggerService();
