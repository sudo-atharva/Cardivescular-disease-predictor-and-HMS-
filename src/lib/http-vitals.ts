export interface VitalReading {
  timestamp: number;
  ecg: number;
  spo2: number;
  heartRate: number;
}

export interface DeviceStatus {
  status: string;
  connected: boolean;
  uptime: number;
  totalRequests: number;
  sampleRate: number;
  bufferSize: number;
  bufferFull: boolean;
  wifiRSSI: number;
  freeHeap: number;
  timestamp: number;
}

export interface DeviceInfo {
  device: string;
  version: string;
  protocol: string;
  ip: string;
  mac: string;
  chipModel: string;
  chipRevision: number;
  flashSize: number;
  timestamp: number;
}

interface VitalsResponse {
  timestamp: number;
  ecg: number;
  spo2: number;
  heartRate: number;
  status: string;
  uptime: number;
  requests: number;
}

interface HttpVitalsHandler {
  onData?: (readings: VitalReading[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class HttpVitalsClient {
  private static instance: HttpVitalsClient;
  private baseUrl: string = 'http://192.168.1.50'; // Update this with your ESP32's actual IP
  private pollInterval: NodeJS.Timeout | null = null;
  private handlers: HttpVitalsHandler = {};
  private lastReadings: VitalReading[] = [];
  private isConnected: boolean = false;
  private isPolling: boolean = false;
  private pollRate: number = 200; // Poll every 200ms (5Hz)
  private lastTimestamp: number = 0;
  private consecutiveErrors: number = 0;
  private maxConsecutiveErrors: number = 5;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): HttpVitalsClient {
    if (!HttpVitalsClient.instance) {
      HttpVitalsClient.instance = new HttpVitalsClient();
    }
    return HttpVitalsClient.instance;
  }

  private loadSettings() {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.esp32IpAddress) {
            // Remove any protocol prefix and add http://
            let ip = settings.esp32IpAddress.replace(/^(https?:\/\/|ws:\/\/|wss:\/\/)/, '');
            // Remove any port if it's 81 (WebSocket port) and use 80 for HTTP
            ip = ip.replace(':81', '');
            this.baseUrl = `http://${ip}`;
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }

  setBaseUrl(url: string) {
    // Ensure URL has http:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    this.baseUrl = url;
  }

  setPollRate(rateMs: number) {
    this.pollRate = Math.max(100, rateMs); // Minimum 100ms
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  setHandlers(handlers: HttpVitalsHandler) {
    this.handlers = handlers;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const testResponse = await response.json();
      return testResponse.status === 'working';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getVitals(numSamples: number = 10): Promise<VitalReading[]> {
    try {
      const url = `${this.baseUrl}/vitals`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const vitalsResponse: VitalsResponse = await response.json();
      
      // Convert single reading to VitalReading format
      const reading: VitalReading = {
        timestamp: vitalsResponse.timestamp,
        ecg: vitalsResponse.ecg,
        spo2: vitalsResponse.spo2,
        heartRate: vitalsResponse.heartRate
      };

      // Only add if it's a new reading (different timestamp)
      if (reading.timestamp > this.lastTimestamp) {
        this.lastTimestamp = reading.timestamp;
        
        // Add to buffer
        this.lastReadings.push(reading);
        
        // Keep only last 1000 readings
        if (this.lastReadings.length > 1000) {
          this.lastReadings = this.lastReadings.slice(-1000);
        }

        return [reading]; // Return as array for compatibility
      }

      return []; // No new data
    } catch (error) {
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
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch device info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  startPolling() {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    console.log(`Starting HTTP polling at ${this.pollRate}ms intervals`);

    const poll = async () => {
      if (!this.isPolling) {
        return;
      }

      try {
        const newReadings = await this.getVitals(20); // Get up to 20 samples per request
        
        if (newReadings.length > 0) {
          this.consecutiveErrors = 0;
          
          if (!this.isConnected) {
            this.isConnected = true;
            console.log('Connected to ESP32 via HTTP');
            if (this.handlers.onConnect) {
              this.handlers.onConnect();
            }
          }

          if (this.handlers.onData) {
            this.handlers.onData(newReadings);
          }
        }

        // Schedule next poll
        this.pollInterval = setTimeout(poll, this.pollRate);

      } catch (error) {
        this.consecutiveErrors++;
        console.error(`HTTP polling error (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);

        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          if (this.isConnected) {
            this.isConnected = false;
            console.log('Disconnected from ESP32 (too many errors)');
            if (this.handlers.onDisconnect) {
              this.handlers.onDisconnect();
            }
          }
        }

        if (this.handlers.onError) {
          this.handlers.onError(error instanceof Error ? error : new Error('Unknown error'));
        }

        // Continue polling even on errors, but with exponential backoff
        const backoffDelay = Math.min(this.pollRate * Math.pow(2, this.consecutiveErrors - 1), 10000);
        this.pollInterval = setTimeout(poll, backoffDelay);
      }
    };

    // Start polling immediately
    poll();
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('Stopped HTTP polling');
  }

  getLastReadings(): VitalReading[] {
    return this.lastReadings;
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  getConnectionInfo() {
    return {
      baseUrl: this.baseUrl,
      isConnected: this.isConnected,
      isPolling: this.isPolling,
      pollRate: this.pollRate,
      consecutiveErrors: this.consecutiveErrors,
      lastReadingsCount: this.lastReadings.length,
    };
  }

  // Compatibility methods for existing WebSocket interface
  connect() {
    this.startPolling();
  }

  disconnect() {
    this.stopPolling();
    this.isConnected = false;
    if (this.handlers.onDisconnect) {
      this.handlers.onDisconnect();
    }
  }

  reconnect() {
    this.stopPolling();
    this.consecutiveErrors = 0;
    this.startPolling();
  }

  close() {
    this.stopPolling();
  }
}

// Create singleton instance
export const httpVitalsClient = HttpVitalsClient.getInstance();