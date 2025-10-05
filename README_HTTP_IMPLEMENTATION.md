<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->
# ESP32 HTTP Vitals Monitor - Implementation Summary

This project now supports **HTTP-based communication** between the ESP32 and the web application, providing a more reliable alternative to WebSocket connections.

## 🚀 What's New

### HTTP-Based Communication
- **More Reliable**: HTTP requests are more stable than WebSocket connections
- **Easier Debugging**: Test endpoints directly in browser or with curl
- **Better Error Handling**: Clear HTTP status codes and error messages
- **Firewall Friendly**: Less likely to be blocked by network security

### Key Files Added/Modified

#### ESP32 Code
- **`esp32-vitals-http.ino`** - New HTTP-based ESP32 firmware
- **`ESP32_HTTP_SETUP_GUIDE.md`** - Comprehensive setup guide

#### Web Application
- **`src/lib/http-vitals.ts`** - HTTP client for ESP32 communication
- **`src/components/patient-charts.tsx`** - Updated to use HTTP client
- **`src/app/settings/page.tsx`** - Updated for HTTP configuration
- **`src/app/api/test-esp32/route.ts`** - Server-side ESP32 testing API

#### Testing Tools
- **`test-http-connection.html`** - Standalone test page for ESP32 HTTP API

## 🔧 Quick Setup

### 1. ESP32 Setup
```cpp
// Update WiFi credentials in esp32-vitals-http.ino
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Optional: Set static IP
IPAddress local_IP(192, 168, 1, 50);
```

### 2. Upload and Test
1. Upload `esp32-vitals-http.ino` to your ESP32
2. Check Serial Monitor for IP address
3. Test in browser: `http://192.168.1.50/` (replace with your IP)

### 3. Web App Configuration
1. Start the web app: `npm run dev`
2. Go to Settings page
3. Enter ESP32 IP address (e.g., `192.168.1.50`)
4. Save settings and test connection

## 📡 API Endpoints

The ESP32 provides these HTTP endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Status page (viewable in browser) |
| `/vitals` | GET | Get vital signs data |
| `/status` | GET | Get device status and statistics |
| `/info` | GET | Get device information |

### Example Usage

```bash
# Get device status
curl http://192.168.1.50/status

# Get 20 vital sign samples
curl http://192.168.1.50/vitals?samples=20

# Get device info
curl http://192.168.1.50/info
```

## 🧪 Testing

### Method 1: Browser Test
Open `http://192.168.1.50/` in your browser to see the status page.

### Method 2: Standalone Test Page
Open `test-http-connection.html` in your browser for interactive testing.

### Method 3: Web App API
```bash
# Test ESP32 connection via Next.js API
curl "http://localhost:3000/api/test-esp32?ip=192.168.1.50"
```

## 🔄 How It Works

### Data Flow
1. **ESP32** continuously samples ECG/PPG sensors at 100Hz
2. **Web App** polls ESP32 every 200ms via HTTP GET requests
3. **ESP32** returns latest sensor data in JSON format
4. **Charts** update in real-time with new data

### Polling vs WebSocket
- **HTTP Polling**: Request → Response → Wait → Repeat
- **WebSocket**: Persistent connection with real-time push
- **Trade-off**: Slightly higher latency but much more reliable

## 🛠️ Configuration Options

### ESP32 Settings
```cpp
const int SAMPLE_RATE = 100;     // Hz (50-250)
const int BUFFER_SIZE = 50;      // Number of samples to store
const float ECG_SCALE = 0.004;   // ECG calibration
const float PPG_SCALE = 0.006;   // PPG calibration
```

### Web App Settings
```javascript
// Adjust polling rate (default: 200ms)
httpVitalsClient.setPollRate(100);

// Set ESP32 base URL
httpVitalsClient.setBaseUrl('http://192.168.1.50');
```

## 🐛 Troubleshooting

### Common Issues

**Cannot connect to ESP32**
- Check ESP32 IP address in Serial Monitor
- Ensure ESP32 and computer are on same network
- Try pinging ESP32: `ping 192.168.1.50`

**No data or erratic readings**
- Verify sensor connections (3.3V, not 5V)
- Check sensor wiring against setup guide
- Adjust calibration values in ESP32 code

**High latency or delays**
- Reduce polling interval in web app
- Increase ESP32 sample rate
- Check network performance

## 📊 Performance

### Typical Performance
- **Sample Rate**: 100Hz (configurable 50-250Hz)
- **Polling Rate**: 5Hz (200ms intervals)
- **Latency**: ~200-500ms (depending on network)
- **Data Points**: Up to 50 samples per request

### Memory Usage
- **ESP32**: ~50KB RAM for buffers
- **Web App**: ~1MB for chart data (1000 points max)

## 🔒 Security Notes

For production use, consider:
- Adding API authentication
- Using HTTPS instead of HTTP
- Implementing rate limiting
- Input validation and sanitization

## 🚀 Next Steps

1. **Test the Setup**: Use the test page to verify connectivity
2. **Calibrate Sensors**: Adjust calibration values for your hardware
3. **Optimize Performance**: Tune sample rates and polling intervals
4. **Add Features**: Consider data logging, alerts, or historical analysis
5. **Deploy**: Set up for production use with proper security

## 📚 Documentation

- **`ESP32_HTTP_SETUP_GUIDE.md`** - Detailed setup instructions
- **`test-http-connection.html`** - Interactive testing tool
- **ESP32 code comments** - Inline documentation for all functions

## 🤝 Migration from WebSocket

If you were using the WebSocket implementation:

1. Upload the new HTTP ESP32 code
2. Update ESP32 IP in web app settings (remove `:81` port)
3. The web app will automatically use HTTP client
4. Test connection and verify data flow

The HTTP implementation is designed to be a drop-in replacement with the same interface but better reliability.

---

**Ready to get started?** Follow the setup guide in `ESP32_HTTP_SETUP_GUIDE.md` for detailed instructions!