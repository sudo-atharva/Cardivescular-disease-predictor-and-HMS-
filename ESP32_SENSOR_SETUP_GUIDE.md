<!--
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
-->
# ESP32 Vitals Monitor - Sensor Setup Guide

This guide covers the setup for your specific sensor configuration: AD8232 for ECG, MAX30105 for SpO2 and heart rate, and SSD1306 OLED display.

## 🔧 Hardware Components

### Required Sensors
- **AD8232** - ECG sensor module for heart rhythm monitoring
- **MAX30105** - Pulse oximetry sensor for SpO2 and heart rate
- **SSD1306 OLED Display** - 128x64 pixel display for local readings
- **ESP32** - Main microcontroller

### Additional Components
- Breadboard or PCB
- Jumper wires
- 3.3V power supply
- ECG electrodes (3 electrodes for AD8232)

## 📋 Wiring Connections

### AD8232 ECG Sensor
```
AD8232 Pin    →    ESP32 Pin    →    Description
VCC           →    3.3V         →    Power supply
GND           →    GND          →    Ground
OUTPUT        →    A0 (GPIO36)  →    ECG signal output
LO+           →    GPIO2        →    Leads-off detection +
LO-           ��    GPIO4        →    Leads-off detection -
```

### MAX30105 Pulse Oximeter
```
MAX30105 Pin  →    ESP32 Pin    →    Description
VIN           →    3.3V         →    Power supply
GND           →    GND          →    Ground
SDA           →    GPIO21       →    I2C data line
SCL           →    GPIO22       →    I2C clock line
```

### SSD1306 OLED Display
```
OLED Pin      →    ESP32 Pin    →    Description
VCC           →    3.3V         →    Power supply
GND           →    GND          →    Ground
SDA           →    GPIO21       →    I2C data line (shared with MAX30105)
SCL           →    GPIO22       →    I2C clock line (shared with MAX30105)
```

## 🔌 Complete Wiring Diagram

```
ESP32                    AD8232              MAX30105            SSD1306 OLED
-----                    ------              --------            ------------
3.3V  ←→ VCC             VCC                 VIN                 VCC
GND   ←→ GND             GND                 GND                 GND
GPIO36←→                 OUTPUT
GPIO2 ←→                 LO+
GPIO4 ←→                 LO-
GPIO21←→                                     SDA                 SDA
GPIO22←→                                     SCL                 SCL
```

## 📚 Required Libraries

Install these libraries in Arduino IDE via Library Manager:

### Core Libraries
- `AsyncTCP` by me-no-dev
- `ESPAsyncWebServer` by me-no-dev  
- `ArduinoJson` by Benoit Blanchon

### Display Library
- `Adafruit SSD1306` by Adafruit
- `Adafruit GFX Library` by Adafruit

### MAX30105 Libraries
- `MAX30105lib` by SparkFun
- `SparkFun MAX3010x library` by SparkFun

## ⚙️ Configuration

### WiFi Settings
Update these in the ESP32 code:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### Static IP (Optional)
```cpp
IPAddress local_IP(192, 168, 1, 50);  // Change to your desired IP
IPAddress gateway(192, 168, 1, 1);    // Your router's IP
```

### I2C Addresses
- **SSD1306 OLED**: 0x3C (default)
- **MAX30105**: 0x57 (default)

## 🧪 Testing Individual Sensors

### Test AD8232 ECG
1. Connect ECG electrodes to body (RA, LA, RL)
2. Monitor Serial output for ECG readings
3. Check leads-off detection works

### Test MAX30105
1. Place finger on sensor
2. Verify red LED lights up
3. Check Serial output for heart rate and SpO2

### Test SSD1306 Display
1. Power on ESP32
2. Display should show startup message
3. Verify heart rate and SpO2 values appear

## 📊 Data Output

### HTTP API Endpoints
- **GET /vitals** - Returns ECG, SpO2, and heart rate data
- **GET /status** - Device status and statistics
- **GET /info** - Device information

### Sample JSON Response
```json
{
  "data": [
    {
      "timestamp": 1234567890,
      "ecg": 0.123,
      "spo2": 98.5,
      "heartRate": 72.3
    }
  ],
  "count": 10,
  "sampleRate": 100,
  "status": "ok"
}
```

### OLED Display Shows
- Heart Rate (BPM)
- SpO2 percentage
- Connection status
- WiFi signal strength

## 🔧 Calibration

### ECG Calibration
Adjust these values based on your setup:
```cpp
const float ECG_SCALE = 0.004;  // Scale to ~[-2,2] mV range
const float ECG_OFFSET = -1.65; // Center around 0
```

### MAX30105 Settings
```cpp
particleSensor.setup(); // Default settings
particleSensor.setPulseAmplitudeRed(0x0A); // Red LED intensity
particleSensor.setPulseAmplitudeGreen(0);  // Green LED off
```

## 🚨 Troubleshooting

### Common Issues

**OLED Display Not Working**
- Check I2C connections (SDA/SCL)
- Verify 3.3V power supply
- Try different I2C address (0x3D)

**MAX30105 Not Detected**
- Check I2C wiring
- Ensure proper power supply (3.3V)
- Verify library installation

**ECG Signal Noisy**
- Check electrode placement
- Ensure good skin contact
- Minimize movement during reading
- Check leads-off detection pins

**No Heart Rate/SpO2 Readings**
- Place finger properly on MAX30105
- Ensure finger covers both red and IR LEDs
- Wait 10-15 seconds for stable readings
- Check for proper blood circulation

### Sensor Placement

**AD8232 Electrodes**
- **RA (Right Arm)**: Right wrist or right side of chest
- **LA (Left Arm)**: Left wrist or left side of chest  
- **RL (Right Leg)**: Right ankle or lower right torso

**MAX30105 Finger Placement**
- Place fingertip gently on sensor
- Cover both LEDs completely
- Avoid pressing too hard
- Keep finger still during measurement

## 📈 Performance Optimization

### Sample Rates
- **ECG**: 100Hz (adjustable 50-250Hz)
- **Heart Rate**: ~25Hz (internal MAX30105 sampling)
- **SpO2**: Calculated every 4 seconds
- **Display**: Updated every 1 second

### Memory Usage
- **Buffer Size**: 50 samples (configurable)
- **RAM Usage**: ~50KB for buffers
- **Flash Usage**: ~1MB for code and libraries

## 🔒 Safety Considerations

### Medical Disclaimer
⚠️ **This device is for educational/research purposes only. Not for medical diagnosis or treatment.**

### Electrical Safety
- Use only 3.3V power supply
- Ensure proper grounding
- Avoid water contact
- Use medical-grade electrodes for ECG

### Data Privacy
- Secure WiFi networks only
- Consider data encryption for sensitive applications
- Implement user authentication if needed

## 🚀 Next Steps

1. **Hardware Assembly**: Wire all components according to diagram
2. **Library Installation**: Install all required libraries
3. **Code Upload**: Upload the ESP32 code with your WiFi credentials
4. **Sensor Testing**: Test each sensor individually
5. **Web App Setup**: Configure the web application with ESP32 IP
6. **Calibration**: Fine-tune sensor readings for your setup
7. **Integration**: Test complete system with live data

## 📞 Support

If you encounter issues:
1. Check all wiring connections
2. Verify library versions are compatible
3. Monitor Serial output for error messages
4. Test sensors individually before integration
5. Ensure stable power supply (3.3V, sufficient current)

## 🔄 Upgrade Path

Future enhancements you can add:
- Temperature sensor (DS18B20)
- Blood pressure monitoring
- Data logging to SD card
- Battery power with sleep modes
- Wireless charging
- Mobile app integration

---

**Ready to build?** Follow this guide step-by-step and you'll have a complete vital signs monitoring system!