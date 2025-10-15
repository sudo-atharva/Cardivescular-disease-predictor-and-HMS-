// src/lib/http-vitals.ts
export class HttpVitalsClient {
  private baseUrl: string = 'http://192.168.31.111';
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private pollRate: number = 1000;
  private lastReadings: VitalReading[] = [];
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 5;
  private isConnected: boolean = false;
  private handlers: {
    onData?: (readings: VitalReading[]) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  } = {};

  // ... (other methods remain the same)

  async getVitals(numSamples: number = 10): Promise<VitalReading[]> {
    try {
      const base = this.baseUrl.replace(/\/$/, '');
      const url = `${base}/vitals?samples=${encodeURIComponent(numSamples)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const normalize = (d: any): VitalReading => ({
        timestamp: Number(d.timestamp ?? d.ts ?? Date.now()),
        ecg: Number(d.ecg ?? 0),
        spo2: Number(d.spo2 ?? 0),
        heartRate: Number(d.heartRate ?? d.hr ?? 0),
      });

      const readingsArr: VitalReading[] = Array.isArray(data)
        ? data.map(normalize)
        : Array.isArray((data as any).data)
          ? (data as any).data.map(normalize)
          : [normalize(data)];

      this.lastReadings.push(...readingsArr);
      if (this.lastReadings.length > 1000) {
        this.lastReadings = this.lastReadings.slice(-1000);
      }

      return readingsArr;
    } catch (error) {
      console.error('Error in getVitals:', error);
      throw new Error(`Failed to fetch vitals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStatus(): Promise<DeviceStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch device status:', error);
      throw new Error(`Failed to fetch device status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log(`Starting HTTP polling at ${this.pollRate}ms intervals`);

    const poll = async () => {
      if (!this.isPolling) return;

      try {
        const newReadings = await this.getVitals(20);
        
        if (newReadings.length > 0) {
          this.consecutiveErrors = 0;
          
          if (!this.isConnected) {
            this.isConnected = true;
            console.log('Connected to ESP32 via HTTP');
            this.handlers.onConnect?.();
          }

          this.handlers.onData?.(newReadings);
        }

        this.pollInterval = setTimeout(poll, this.pollRate);
      } catch (error) {
        this.consecutiveErrors++;
        console.error(`HTTP polling error (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);

        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          this.isConnected = false;
          this.handlers.onDisconnect?.();
          this.stopPolling();
        } else {
          this.pollInterval = setTimeout(poll, this.pollRate);
        }
      }
    };

    poll();
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Convenience aliases for UI components expecting connect/disconnect
  connect() {
    this.startPolling();
  }

  disconnect() {
    this.stopPolling();
  }

  setHandlers(handlers: {
    onData?: (readings: VitalReading[]) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  }) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  setBaseUrl(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      url = `http://${url}`;
    }
    // Keep host and optional port, strip path
    try {
      const u = new URL(url);
      this.baseUrl = `${u.protocol}//${u.host}`;
    } catch {
      // Fallback: best-effort
      this.baseUrl = url.replace(/\/$/, '');
    }
    this.consecutiveErrors = 0;
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  getLastReadings(): VitalReading[] {
    return [...this.lastReadings];
  }
  // Add this method to the HttpVitalsClient class
reconnect() {
  this.stopPolling();
  this.consecutiveErrors = 0;
  this.startPolling();
}

// Add this method as well for better error handling
private handleError(error: Error) {
  console.error('HTTP Vitals Client Error:', error);
  this.handlers.onError?.(error);
  
  if (this.consecutiveErrors >= this.maxConsecutiveErrors && this.isConnected) {
    this.isConnected = false;
    this.handlers.onDisconnect?.();
  }
}
}


export const httpVitalsClient = new HttpVitalsClient();