<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->
# ESP32 Vitals Monitor - Troubleshooting Guide

## 🚨 "Failed to Fetch" Error Solutions

### Step 1: Test Basic Connectivity

1. **Upload the simplified code** (`esp32-vitals-http-simple.ino`)
2. **Open Serial Monitor** (115200 baud) and check for:
   ```
   ESP32 Vitals Monitor Starting...
   OLED display initialized
   AD8232 ECG sensor initialized
   WiFi connected! IP address: 192.168.1.50
   HTTP server started
   System ready!
   ```

3. **Test direct browser access**:
   - Open browser and go to `http://192.168.1.50/`
   - You should see the status page

### Step 2: Network Connectivity Tests

#### Test 1: Ping the ESP32
```bash
ping 192.168.1.50
```
- ✅ **Success**: You get replies
- ❌ **Fail**: Request timeout or unreachable

#### Test 2: Test API endpoints directly
```bash
# Test status endpoint
curl http://192.168.1.50/status

# Test vitals endpoint
curl http://192.168.1.50/vitals

# Test with verbose output
curl -v http://192.168.1.50/status
```

#### Test 3: Check from same network
- Make sure your computer and ESP32 are on the same WiFi network
- Check your router's connected devices list

### Step 3: Common Issues & Solutions

#### Issue 1: ESP32 Not Connecting to WiFi
**Symptoms**: Serial Monitor shows "Connecting to WiFi....." forever

**Solutions**:
1. **Check WiFi credentials**:
   ```cpp
   const char* ssid = "Tiklehouse";        // Exact network name
   const char* password = "Pass@1660";     // Exact password
   ```

2. **Check WiFi network**:
   - Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
   - Check if network has special characters
   - Try connecting to a mobile hotspot for testing

3. **Reset network settings**:
   ```cpp
   WiFi.disconnect(true);  // Add this before WiFi.begin()
   delay(1000);
   WiFi.begin(ssid, password);
   ```

#### Issue 2: IP Address Conflicts
**Symptoms**: ESP32 connects but can't access via browser

**Solutions**:
1. **Change static IP**:
   ```cpp
   IPAddress local_IP(192, 168, 1, 51);  // Try different IP
   ```

2. **Use DHCP instead**:
   ```cpp
   // Comment out the static IP configuration
   // if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
   //   Serial.println("Static IP configuration failed");
   // }
   ```

3. **Check router's IP range**:
   - Router might use different subnet (192.168.0.x instead of 192.168.1.x)

#### Issue 3: CORS Issues
**Symptoms**: Browser console shows CORS errors

**Solutions**:
1. **Verify CORS headers** (already included in code):
   ```cpp
   DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
   ```

2. **Test from same origin**:
   - Access web app via `http://localhost:3000` not `file://`

#### Issue 4: Firewall Blocking
**Symptoms**: Can ping but can't access HTTP

**Solutions**:
1. **Temporarily disable firewall** for testing
2. **Add firewall exception** for port 80
3. **Try different port**:
   ```cpp
   AsyncWebServer server(8080);  // Change to port 8080
   ```

### Step 4: Debug Web Application

#### Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when trying to connect

#### Common Web App Issues

1. **Wrong IP in settings**:
   - Go to Settings page
   - Enter correct ESP32 IP: `192.168.1.50`
   - Save settings

2. **HTTP vs HTTPS**:
   - Ensure using `http://` not `https://`
   - ESP32 doesn't support HTTPS by default

3. **Port issues**:
   - Don't add `:80` to the IP (it's default for HTTP)
   - Use just `192.168.1.50` not `192.168.1.50:80`

### Step 5: Advanced Debugging

#### Enable Detailed Logging
Add this to your ESP32 code for more debug info:
```cpp
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);  // Enable WiFi debug
  // ... rest of setup
}
```

#### Monitor Serial Output
Watch for these messages:
- `Received /vitals request` - Web app is reaching ESP32
- `Sent X samples to client` - Data is being sent
- `404 - Not found: /some/path` - Wrong endpoint being called

#### Test with Postman or curl
```bash
# Test all endpoints
curl -X GET http://192.168.1.50/
curl -X GET http://192.168.1.50/status
curl -X GET http://192.168.1.50/vitals
curl -X GET http://192.168.1.50/info

# Test with headers
curl -H "Accept: application/json" http://192.168.1.50/vitals
```

### Step 6: Alternative Solutions

#### Option 1: Use Different Port
```cpp
AsyncWebServer server(8080);
```
Then access via `http://192.168.1.50:8080`

#### Option 2: Use mDNS
Add to setup():
```cpp
#include <ESPmDNS.h>

void setup() {
  // ... existing setup code ...
  
  if (MDNS.begin("esp32vitals")) {
    Serial.println("mDNS responder started");
  }
}
```
Then access via `http://esp32vitals.local`

#### Option 3: Use Access Point Mode
```cpp
void setup() {
  // Create AP instead of connecting to WiFi
  WiFi.softAP("ESP32-Vitals", "password123");
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
}
```

### Step 7: Hardware Checks

1. **Power Supply**: Ensure stable 3.3V power
2. **Connections**: Check all wiring
3. **ESP32 Board**: Try different ESP32 if available
4. **USB Cable**: Use data cable, not charge-only

### Step 8: Library Issues

If compilation fails, install these exact libraries:

1. **ESP32 Board Package**: v2.0.11 or later
2. **AsyncTCP**: v1.1.1 by me-no-dev
3. **ESPAsyncWebServer**: v1.2.3 by me-no-dev
4. **ArduinoJson**: v6.21.3 by Benoit Blanchon
5. **Adafruit SSD1306**: v2.5.7 by Adafruit
6. **Adafruit GFX**: v1.11.5 by Adafruit

### Quick Test Checklist

- [ ] ESP32 powers on and shows serial output
- [ ] WiFi connects successfully
- [ ] Can ping ESP32 IP address
- [ ] Can access `http://192.168.1.50/` in browser
- [ ] Serial monitor shows "Received /status request" when testing
- [ ] Web app settings have correct IP address
- [ ] No firewall blocking connections
- [ ] Using HTTP not HTTPS
- [ ] Computer and ESP32 on same network

### Still Not Working?

1. **Try the simplified code** (`esp32-vitals-http-simple.ino`) first
2. **Use mobile hotspot** to eliminate network issues
3. **Test with different computer/browser**
4. **Check router settings** for device isolation
5. **Try different ESP32 board** if available

### Success Indicators

When everything works, you should see:
- ✅ ESP32 connects to WiFi and shows IP
- ✅ Browser can access ESP32 status page
- ✅ Web app shows "Connected" status
- ✅ Live charts display data
- ✅ OLED shows heart rate and SpO2 values