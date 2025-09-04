
export interface VitalReading {
  timestamp: number;
  ecg: number;
  ppg: number;
}

interface WebSocketHandler {
  onMessage?: (data: VitalReading) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class VitalsWebSocket {
  private static instance: VitalsWebSocket;
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private handlers: WebSocketHandler = {};
  private lastReadings: VitalReading[] = [];
  private isConnected: boolean = false;

  private constructor() {
    if (this.isValidEnvironment()) {
      this.connect();
    }
  }

  private isValidEnvironment(): boolean {
    return typeof window !== 'undefined' && 'WebSocket' in window;
  }

  private handleVitalReading(data: VitalReading) {
    // Validate the data format
    if (!this.isValidVitalReading(data)) {
      console.error('Invalid vital reading format:', data);
      return;
    }

    this.lastReadings.push(data);
    if (this.lastReadings.length > 1000) {
      this.lastReadings.shift();
    }
    if (this.handlers.onMessage) {
      this.handlers.onMessage(data);
    }
  }

  private isValidVitalReading(data: any): data is VitalReading {
    return (
      typeof data === 'object' &&
      typeof data.timestamp === 'number' &&
      typeof data.ecg === 'number' &&
      typeof data.ppg === 'number'
    );
  }

  private scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        console.log('Attempting to reconnect...');
        this.connect();
      }, 5000); // Try to reconnect every 5 seconds
    }
  }

  static getInstance(): VitalsWebSocket {
    if (!VitalsWebSocket.instance) {
      VitalsWebSocket.instance = new VitalsWebSocket();
    }
    return VitalsWebSocket.instance;
  }

  private connect() {
    if (!this.isValidEnvironment()) {
      console.log('WebSocket not supported in this environment');
      return;
    }

    let esp32IpAddress = 'localhost:81';
    try {
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          esp32IpAddress = settings.esp32IpAddress;
        }
      }
    } catch (error) {
      console.error('Failed to load ESP32 IP address from settings:', error);
    }

    try {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      // Create new WebSocket connection with error handling
      const wsUrl = (esp32IpAddress.startsWith('ws://') || esp32IpAddress.startsWith('wss://'))
        ? esp32IpAddress
        : `ws://${esp32IpAddress}`;
      console.log('Attempting to connect to:', wsUrl);

      try {
        this.ws = new WebSocket(wsUrl);
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        this.scheduleReconnect();
        return;
      }

      // Set binary type to support both blob and arraybuffer
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log('Connected to ESP32');
        this.isConnected = true;
        if (this.handlers.onConnect) this.handlers.onConnect();
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }

        // Send initial handshake message
        try {
          this.ws?.send(JSON.stringify({ type: 'init', client: 'web' }));
        } catch (error) {
          console.error('Failed to send handshake:', error);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const readings: VitalReading[] = [];

          const addReading = (r: Partial<VitalReading> & { timestamp?: any; ecg?: any; ppg?: any }) => {
            // Normalize timestamp
            let t = Date.now();
            const ts = (r as any).timestamp ?? (r as any).ts ?? (r as any).time;
            if (typeof ts === 'number') t = ts > 1e12 ? ts : ts * 1000;
            else if (typeof ts === 'string') {
              const parsed = Date.parse(ts);
              t = isNaN(parsed) ? Date.now() : parsed;
            }
            // Normalize signals
            const ecgVal = (r as any).ecg ?? (r as any).ECG ?? (r as any).e;
            const ppgVal = (r as any).ppg ?? (r as any).PPG ?? (r as any).p;
            const ecgNum = typeof ecgVal === 'string' ? parseFloat(ecgVal) : Number(ecgVal);
            const ppgNum = typeof ppgVal === 'string' ? parseFloat(ppgVal) : Number(ppgVal);
            if (Number.isFinite(ecgNum) && Number.isFinite(ppgNum)) {
              readings.push({ timestamp: t, ecg: ecgNum, ppg: ppgNum });
            }
          };

          const handleObject = (obj: any) => {
            if (Array.isArray(obj)) {
              obj.forEach(handleObject);
              return;
            }
            if (obj && typeof obj === 'object') {
              addReading(obj);
            }
          };

          const handleCSVLine = (line: string) => {
            const parts = line.split(/[\t,;]+/).map(s => s.trim()).filter(Boolean);
            if (parts.length >= 3) {
              const [tRaw, eRaw, pRaw] = parts;
              let t: number;
              const tNum = Number(tRaw);
              if (Number.isFinite(tNum)) t = tNum > 1e12 ? tNum : tNum * 1000;
              else {
                const parsed = Date.parse(tRaw);
                t = isNaN(parsed) ? Date.now() : parsed;
              }
              const e = Number(eRaw);
              const p = Number(pRaw);
              if (Number.isFinite(e) && Number.isFinite(p)) {
                readings.push({ timestamp: t, ecg: e, ppg: p });
              }
            }
          };

          if (typeof event.data === 'string') {
            const text = event.data.trim();
            try {
              const obj = JSON.parse(text);
              handleObject(obj);
            } catch {
              // Not JSON, attempt CSV (possibly multiple lines)
              text.split(/\r?\n/).forEach(handleCSVLine);
            }
          } else if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const text = String(reader.result || '').trim();
              try {
                const obj = JSON.parse(text);
                handleObject(obj);
                readings.forEach(r => this.handleVitalReading(r));
              } catch {
                text.split(/\r?\n/).forEach(handleCSVLine);
                readings.forEach(r => this.handleVitalReading(r));
              }
            };
            reader.readAsText(event.data);
            return;
          } else if (event.data instanceof ArrayBuffer) {
            const text = new TextDecoder().decode(event.data).trim();
            try {
              const obj = JSON.parse(text);
              handleObject(obj);
            } catch {
              text.split(/\r?\n/).forEach(handleCSVLine);
            }
          } else {
            console.error('Unsupported message format');
            return;
          }

          // Emit readings
          readings.forEach(r => this.handleVitalReading(r));
        } catch (error) {
          console.error('Error handling message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`Disconnected from ESP32: ${event.code} - ${event.reason}`);
        this.isConnected = false;
        if (this.handlers.onDisconnect) this.handlers.onDisconnect();
        
        // Only reconnect if it wasn't a clean close
        if (!event.wasClean) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (event) => {
        // Handle specific error types
        const error = event as ErrorEvent;
        console.error('WebSocket error:', {
          message: error.message,
          error: error.error,
          type: error.type,
          target: error.target
        });
        
        this.isConnected = false;

        // Check if error is due to CORS or network issues
        if (error.message?.includes('CORS') || error.message?.includes('access')) {
          console.error('CORS or access error. Make sure the ESP32 WebSocket server allows connections from this origin.');
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connect();
  }

  setHandlers(handlers: WebSocketHandler) {
    this.handlers = handlers;
  }

  getLastReadings(): VitalReading[] {
    return this.lastReadings;
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }
}

export const vitalsSocket = VitalsWebSocket.getInstance();
