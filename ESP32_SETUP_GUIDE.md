<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->
# ESP32 Vitals Streamer Setup Guide

## Hardware Requirements

- ESP32 development board
- AD8232 ECG sensor module
- PPG sensor (analog output)
- Breadboard and jumper wires
- 3.3V power supply

## Wiring Diagram

### AD8232 ECG Sensor
```
AD8232 Pin    →    ESP32 Pin
OUTPUT        →    A0 (GPIO36)
LO+           →    GPIO2
LO-           →    GPIO3
3.3V          →    3.3V
GND           →    GND
```

### PPG Sensor
```
PPG Sensor    →    ESP32 Pin
Signal Out    →    A1 (GPIO39)
VCC           →    3.3V
GND           →    GND
```

## Software Setup

### 1. Install Required Libraries

In Arduino IDE, install these libraries via Library Manager:
- `AsyncTCP` by me-no-dev
- `ESPAsyncWebServer` by me-no-dev  
- `ArduinoJson` by Benoit Blanchon

### 2. Configure WiFi and IP

Edit the sketch constants:
```cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Static IP (recommended)
IPAddress local_IP(192, 168, 1, 50);  // Change to available IP
IPAddress gateway(192, 168, 1, 1);    // Your router IP
```

### 3. Calibrate Sensor Scaling

Adjust these values based on your sensor outputs:
```cpp
// ECG scaling to ~[-2,2] mV range
const float ECG_SCALE = 0.004;
const float ECG_OFFSET = -1.65;

// PPG scaling to ~[-3,3] range
const float PPG_SCALE = 0.006;
const float PPG_OFFSET = -1.5;
```

### 4. Upload and Test

1. Connect ESP32 to computer
2. Select board: "ESP32 Dev Module"
3. Upload the sketch
4. Open Serial Monitor (115200 baud)
5. Note the IP address displayed

## Frontend Configuration

### 1. Set ESP32 IP Address

1. Open your web application
2. Navigate to Settings page
3. Enter ESP32 IP and port: `192.168.1.50:81`
4. Click "Save Settings"

### 2. Verify Connection

- Connection status should show "Connected" in Settings
- Vital Signs Monitor should display "Live Data" badge
- ECG and PPG charts should show real-time waveforms

## Data Flow Overview

```
ESP32 Sensors → WebSocket Server (port 81) → Browser Client → Charts
```

### Message Format Examples

**Single Sample (JSON):**
```json
{"ts": 1716320394123, "ecg": 0.125, "ppg": -0.234}
```

**Batch Samples (JSON Array):**
```json
[
  {"ts": 1716320394123, "ecg": 0.125, "ppg": -0.234},
  {"ts": 1716320394133, "ecg": 0.118, "ppg": -0.241},
  {"ts": 1716320394143, "ecg": 0.132, "ppg": -0.228}
]
```

**CSV Format (Alternative):**
```
1716320394123,0.125,-0.234
1716320394133,0.118,-0.241
1716320394143,0.132,-0.228
```

## Troubleshooting

### Connection Issues

1. **"Disconnected" Status:**
   - Check ESP32 Serial Monitor for WiFi connection
   - Verify IP address is correct in frontend settings
   - Ensure ESP32 and computer are on same network

2. **No Data on Charts:**
   - Check sensor wiring
   - Verify sensor power (3.3V, not 5V)
   - Monitor Serial output for sample values

3. **Erratic Readings:**
   - Adjust ECG_SCALE and PPG_SCALE values
   - Check for loose connections
   - Ensure proper electrode contact for ECG

### Performance Tuning

**Sampling Rate:**
```cpp
const int SAMPLE_RATE = 100;  // Adjust 50-250 Hz
```

**Batch Size:**
```cpp
const int BATCH_SIZE = 5;     // Samples per WebSocket frame
```

**Memory Usage:**
- Larger batches = less WiFi overhead, more memory
- Smaller batches = more responsive, higher WiFi usage

## Network Configuration

### Router Setup (Recommended)

1. Reserve IP address for ESP32 MAC address
2. Configure port forwarding if accessing remotely
3. Ensure firewall allows WebSocket connections

### Alternative: DHCP

Remove static IP configuration to use DHCP:
```cpp
// Comment out these lines for DHCP
// if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
//   Serial.println("Static IP configuration failed");
// }
```

## Advanced Features

### Adding Patient ID and SpO2

To include additional data fields:
```cpp
JsonObject sample = array.createNestedObject();
sample["ts"] = sampleBuffer[i].timestamp;
sample["ecg"] = sampleBuffer[i].ecg;
sample["ppg"] = sampleBuffer[i].ppg;
sample["patientId"] = "PATIENT_001";  // Add patient ID
sample["spo2"] = calculateSpO2();     // Add SpO2 calculation
```

*Note: Frontend currently ignores these fields but they can be added to the UI.*

### Real-time SpO2 Calculation

Implement SpO2 calculation from PPG signal:
```cpp
float calculateSpO2() {
  // Implement SpO2 algorithm based on PPG signal
  // This requires signal processing of red/infrared PPG data
  return 98.0; // Placeholder
}
```

## Testing Checklist

- [ ] ESP32 connects to WiFi successfully
- [ ] WebSocket server starts on port 81
- [ ] Frontend connects to ESP32 IP
- [ ] "Connected" status shows in Settings
- [ ] ECG chart displays live waveform
- [ ] PPG chart displays live waveform  
- [ ] Data updates in real-time (Live Data badge)
- [ ] Serial Monitor shows sample transmission
- [ ] No connection drops during operation

## Production Considerations

1. **Security:** Add authentication for WebSocket connections
2. **Reliability:** Implement automatic reconnection logic
3. **Data Storage:** Log samples to SD card for backup
4. **Power Management:** Optimize for battery operation
5. **Calibration:** Add runtime sensor calibration interface
6. **Error Handling:** Robust sensor failure detection

## Support

For issues with this setup:
1. Check Serial Monitor output
2. Verify network connectivity
3. Test with minimal sensor setup
4. Review frontend WebSocket connection logs in browser console