<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->
# ESP32 HTTP Vitals Monitor Setup Guide

This guide will help you set up your ESP32 to stream ECG and PPG data to your web application using HTTP requests instead of WebSocket connections. HTTP is more reliable and easier to troubleshoot than WebSocket connections.

## Why HTTP Instead of WebSocket?

- **More Reliable**: HTTP connections are more stable and less prone to connection drops
- **Easier Debugging**: You can test endpoints directly in a browser or with curl
- **Better Error Handling**: HTTP status codes provide clear error information
- **Firewall Friendly**: HTTP traffic is less likely to be blocked by firewalls
- **Simpler Implementation**: No need to handle WebSocket connection states

## Hardware Requirements

- ESP32 development board
- AD8232 ECG sensor module
- PPG sensor (pulse sensor or similar)
- Breadboard and jumper wires
- USB cable for programming

## Wiring Diagram

### AD8232 ECG Sensor
```
AD8232 Pin    ���    ESP32 Pin
VCC           →    3.3V
GND           →    GND
OUTPUT        →    A0 (GPIO36)
LO+           →    GPIO2
LO-           →    GPIO3
```

### PPG Sensor
```
PPG Sensor    →    ESP32 Pin
VCC           →    3.3V
GND           →    GND
SIGNAL        →    A1 (GPIO39)
```

## Software Setup

### 1. Install Required Libraries

In Arduino IDE, install these libraries via Library Manager:
- `AsyncTCP` by me-no-dev
- `ESPAsyncWebServer` by me-no-dev
- `ArduinoJson` by Benoit Blanchon

### 2. Upload the Code

1. Open `esp32-vitals-http.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Optionally, update the static IP configuration:
   ```cpp
   IPAddress local_IP(192, 168, 1, 50);  // Change to your desired IP
   IPAddress gateway(192, 168, 1, 1);    // Your router's IP
   ```
4. Upload the code to your ESP32

### 3. Find Your ESP32's IP Address

After uploading, open the Serial Monitor (115200 baud) to see the ESP32's IP address:
```
WiFi connected! IP address: 192.168.1.50
HTTP server running on: http://192.168.1.50/
```

## API Endpoints

The ESP32 provides several HTTP endpoints:

### GET /vitals
Returns the latest vital signs data.

**Parameters:**
- `samples` (optional): Number of samples to return (1-50, default: 10)

**Example:**
```
GET http://192.168.1.50/vitals?samples=20
```

**Response:**
```json
{
  "data": [
    {
      "timestamp": 1234567890,
      "ecg": 0.123,
      "ppg": -0.456
    }
  ],
  "count": 20,
  "sampleRate": 100,
  "timestamp": 1234567890,
  "status": "ok"
}
```

### GET /status
Returns device status and statistics.

**Response:**
```json
{
  "status": "online",
  "connected": true,
  "uptime": 123456,
  "totalRequests": 42,
  "sampleRate": 100,
  "bufferSize": 50,
  "bufferFull": true,
  "wifiRSSI": -45,
  "freeHeap": 234567,
  "timestamp": 1234567890
}
```

### GET /info
Returns device information.

**Response:**
```json
{
  "device": "ESP32 Vitals Monitor",
  "version": "2.0.0",
  "protocol": "HTTP",
  "ip": "192.168.1.50",
  "mac": "AA:BB:CC:DD:EE:FF",
  "chipModel": "ESP32",
  "chipRevision": 1,
  "flashSize": 4194304,
  "timestamp": 1234567890
}
```

### GET /
Simple status page that you can view in a browser.

## Testing the Connection

### Method 1: Browser Test
1. Open your browser and go to `http://192.168.1.50/` (replace with your ESP32's IP)
2. You should see a status page with device information
3. Click on the API endpoint links to test them

### Method 2: Test HTML Page
1. Open `test-http-connection.html` in your browser
2. Enter your ESP32's IP address
3. Click "Test Connection" to verify connectivity
4. Click "Start Polling" to see live data

### Method 3: Command Line (curl)
```bash
# Test connection
curl http://192.168.1.50/status

# Get vital signs data
curl http://192.168.1.50/vitals?samples=5

# Get device info
curl http://192.168.1.50/info
```

## Web Application Configuration

1. Start your Next.js application:
   ```bash
   npm run dev
   ```

2. Go to the Settings page (http://localhost:3000/settings)

3. Enter your ESP32's IP address (e.g., `192.168.1.50`)

4. Click "Save Settings" to test the connection

5. Navigate to the dashboard to see live ECG and PPG charts

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to ESP32
**Solutions:**
- Verify ESP32 is powered on and connected to WiFi
- Check the IP address in Serial Monitor
- Ensure ESP32 and computer are on the same network
- Try pinging the ESP32: `ping 192.168.1.50`
- Check firewall settings

**Problem**: Getting CORS errors
**Solutions:**
- The ESP32 code includes CORS headers, but if you still get errors:
- Make sure you're accessing the web app via `http://localhost:3000` not `file://`
- Check browser console for specific error messages

### Data Issues

**Problem**: No data or erratic readings
**Solutions:**
- Check sensor connections
- Verify sensor power (3.3V, not 5V)
- Adjust calibration values in the code:
  ```cpp
  const float ECG_SCALE = 0.004;
  const float ECG_OFFSET = -1.65;
  const float PPG_SCALE = 0.006;
  const float PPG_OFFSET = -1.5;
  ```

**Problem**: Data appears delayed
**Solutions:**
- Reduce polling interval in web app (default is 200ms)
- Increase sample rate on ESP32 (up to 250Hz)
- Check network latency

### Performance Issues

**Problem**: ESP32 becomes unresponsive
**Solutions:**
- Reduce sample rate: `const int SAMPLE_RATE = 50;`
- Increase buffer size: `const int BUFFER_SIZE = 100;`
- Add delays in main loop if needed

**Problem**: High memory usage
**Solutions:**
- Reduce buffer size
- Optimize JSON response size
- Monitor free heap in `/status` endpoint

## Advanced Configuration

### Adjusting Sample Rate
```cpp
const int SAMPLE_RATE = 100;  // Hz (50-250 recommended)
```

### Changing Buffer Size
```cpp
const int BUFFER_SIZE = 50;   // Number of samples to store
```

### Modifying Polling Rate
In the web application, you can adjust the polling rate:
```javascript
httpVitalsClient.setPollRate(100); // Poll every 100ms
```

### Custom Calibration
Adjust these values based on your specific sensors:
```cpp
// ECG calibration (mV range)
const float ECG_SCALE = 0.004;
const float ECG_OFFSET = -1.65;

// PPG calibration (% range)
const float PPG_SCALE = 0.006;
const float PPG_OFFSET = -1.5;
```

## Security Considerations

For production use, consider:
- Adding authentication to API endpoints
- Using HTTPS instead of HTTP
- Implementing rate limiting
- Adding input validation
- Using secure WiFi networks

## Next Steps

1. Test the basic setup with the provided test page
2. Calibrate your sensors for accurate readings
3. Integrate with your web application
4. Add additional features like data logging or alerts
5. Consider implementing a database for historical data storage

## Support

If you encounter issues:
1. Check the Serial Monitor output for error messages
2. Use the test HTML page to isolate connection problems
3. Verify all wiring connections
4. Ensure all required libraries are installed
5. Check that your WiFi network allows device-to-device communication