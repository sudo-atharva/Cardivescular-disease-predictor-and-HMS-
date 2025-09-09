#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MAX30105.h>
#include <heartRate.h>

// WiFi credentials - CHANGE THESE TO MATCH YOUR NETWORK
const char* ssid = "Tiklehouse";
const char* password = "Pass@1660";

// Use DHCP instead of static IP for now
WebServer server(80);  // Using standard WebServer instead of AsyncWebServer

// OLED Display configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// MAX30105 sensor
MAX30105 particleSensor;

// AD8232 ECG sensor pins
const int ECG_OUTPUT = 34;
const int ECG_LO_PLUS = 35;
const int ECG_LO_MINUS = 32;

// Simple data structure
struct VitalData {
  float ecg;
  float spo2;
  float heartRate;
  unsigned long timestamp;
};

VitalData currentVitals = {0, 0, 0, 0};
bool max30105Ready = false;
int totalRequests = 0;

// Heart rate variables
const byte RATE_ARRAY_SIZE = 4;
long rateArray[RATE_ARRAY_SIZE];
int rateCounter = 0;
long lastBeat = 0;
float beatsPerMinute = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== ESP32 SIMPLE VITALS MONITOR ===");
  Serial.println("Starting system...");
  
  // Initialize display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("Display failed!");
  } else {
    Serial.println("Display OK");
    showStatus("Starting...");
  }
  
  // Initialize MAX30105
  if (!particleSensor.begin()) {
    Serial.println("MAX30105 not found - continuing without it");
    max30105Ready = false;
  } else {
    Serial.println("MAX30105 OK");
    max30105Ready = true;
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    
    for (byte i = 0; i < RATE_ARRAY_SIZE; i++) {
      rateArray[i] = 0;
    }
  }
  
  // Initialize ECG pins
  pinMode(ECG_LO_PLUS, INPUT);
  pinMode(ECG_LO_MINUS, INPUT);
  Serial.println("ECG pins OK");
  
  // Connect to WiFi with DHCP
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  showStatus("Connecting WiFi...");
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi connection FAILED!");
    Serial.println("Check your WiFi credentials!");
    showStatus("WiFi FAILED!");
    while(1) delay(1000); // Stop here
  }
  
  Serial.println("\nWiFi connected successfully!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("Gateway: ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("Signal strength: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  
  showStatus("WiFi Connected!");
  delay(2000);
  
  // Setup web server routes
  setupServer();
  
  server.begin();
  Serial.println("\n=== WEB SERVER STARTED ===");
  Serial.print("Access your device at: http://");
  Serial.println(WiFi.localIP());
  Serial.println("Endpoints:");
  Serial.print("  http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");
  Serial.print("  http://");
  Serial.print(WiFi.localIP());
  Serial.println("/vitals");
  Serial.print("  http://");
  Serial.print(WiFi.localIP());
  Serial.println("/test");
  
  showStatus("Server Ready!");
  
  // Generate some test data
  currentVitals.ecg = 0.5;
  currentVitals.spo2 = 98;
  currentVitals.heartRate = 75;
  currentVitals.timestamp = millis();
  
  Serial.println("\n=== SYSTEM READY ===");
  Serial.println("Try these commands:");
  Serial.print("curl http://");
  Serial.print(WiFi.localIP());
  Serial.println("/test");
  Serial.print("curl http://");
  Serial.print(WiFi.localIP());
  Serial.println("/vitals");
}

void loop() {
  // Handle web server
  server.handleClient();
  
  // Read sensors
  readSensors();
  
  // Update display every 2 seconds
  static unsigned long lastDisplay = 0;
  if (millis() - lastDisplay > 2000) {
    lastDisplay = millis();
    updateDisplay();
  }
  
  // Print status every 10 seconds
  static unsigned long lastStatus = 0;
  if (millis() - lastStatus > 10000) {
    lastStatus = millis();
    Serial.print("Status - Uptime: ");
    Serial.print(millis() / 1000);
    Serial.print("s, Requests: ");
    Serial.print(totalRequests);
    Serial.print(", WiFi: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    if (totalRequests == 0) {
      Serial.println("WARNING: No requests received yet!");
      Serial.print("Try: http://");
      Serial.println(WiFi.localIP());
    }
  }
  
  delay(10);
}

void setupServer() {
  // Enable CORS
  server.enableCORS(true);
  
  // Root page
  server.on("/", HTTP_GET, []() {
    Serial.println("GET /");
    totalRequests++;
    
    String html = "<!DOCTYPE html><html><head>";
    html += "<title>ESP32 Vitals Monitor</title>";
    html += "<meta http-equiv='refresh' content='3'>";
    html += "</head><body>";
    html += "<h1>ESP32 Vitals Monitor</h1>";
    html += "<p><strong style='color:green;'>ONLINE</strong></p>";
    html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
    html += "<p>Uptime: " + String(millis()/1000) + " seconds</p>";
    html += "<p>Requests: " + String(totalRequests) + "</p>";
    html += "<h2>Current Data:</h2>";
    html += "<p>Heart Rate: " + String(currentVitals.heartRate) + " BPM</p>";
    html += "<p>SpO2: " + String(currentVitals.spo2) + "%</p>";
    html += "<p>ECG: " + String(currentVitals.ecg) + "</p>";
    html += "<h2>API Endpoints:</h2>";
    html += "<p><a href='/vitals'>/vitals</a> - JSON data</p>";
    html += "<p><a href='/test'>/test</a> - Simple test</p>";
    html += "</body></html>";
    
    server.send(200, "text/html", html);
    Serial.println("Root page sent");
  });
  
  // Simple test endpoint
  server.on("/test", HTTP_GET, []() {
    Serial.println("GET /test");
    totalRequests++;
    
    String response = "{";
    response += "\"status\":\"working\",";
    response += "\"message\":\"ESP32 server is responding!\",";
    response += "\"timestamp\":" + String(millis()) + ",";
    response += "\"uptime\":" + String(millis()/1000) + ",";
    response += "\"requests\":" + String(totalRequests);
    response += "}";
    
    server.send(200, "application/json", response);
    Serial.println("Test response sent");
  });
  
  // Vitals endpoint
  server.on("/vitals", HTTP_GET, []() {
    Serial.println("GET /vitals");
    totalRequests++;
    
    // Create JSON response
    StaticJsonDocument<512> doc;
    doc["timestamp"] = millis();
    doc["ecg"] = currentVitals.ecg;
    doc["spo2"] = currentVitals.spo2;
    doc["heartRate"] = currentVitals.heartRate;
    doc["status"] = "ok";
    doc["uptime"] = millis() / 1000;
    doc["requests"] = totalRequests;
    
    String response;
    serializeJson(doc, response);
    
    server.send(200, "application/json", response);
    Serial.println("Vitals response sent: " + String(response.length()) + " bytes");
  });
  
  // Handle 404
  server.onNotFound([]() {
    Serial.print("404: ");
    Serial.println(server.uri());
    server.send(404, "text/plain", "Not found: " + server.uri());
  });
  
  Serial.println("Server routes configured");
}

void readSensors() {
  // Update timestamp
  currentVitals.timestamp = millis();
  
  // Read ECG
  if ((digitalRead(ECG_LO_PLUS) == 1) || (digitalRead(ECG_LO_MINUS) == 1)) {
    currentVitals.ecg = 0.0;
  } else {
    int rawValue = analogRead(ECG_OUTPUT);
    float voltage = (rawValue / 4095.0) * 3.3;
    currentVitals.ecg = (voltage - 1.65) * 0.004;
  }
  
  // Read MAX30105 for heart rate
  if (max30105Ready) {
    long irValue = particleSensor.getIR();
    
    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      
      beatsPerMinute = 60 / (delta / 1000.0);
      
      if (beatsPerMinute < 255 && beatsPerMinute > 20) {
        rateArray[rateCounter % RATE_ARRAY_SIZE] = (long)beatsPerMinute;
        rateCounter++;
        
        long total = 0;
        for (byte i = 0; i < RATE_ARRAY_SIZE; i++) {
          total += rateArray[i];
        }
        beatsPerMinute = total / RATE_ARRAY_SIZE;
        currentVitals.heartRate = beatsPerMinute;
      }
    }
    
    // Simple SpO2 estimation (this is very basic)
    if (irValue > 50000) {
      currentVitals.spo2 = 95 + random(-2, 3); // Simulated for now
    }
  } else {
    // Generate test data if no sensor
    currentVitals.heartRate = 72 + random(-5, 8);
    currentVitals.spo2 = 97 + random(-2, 2);
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0, 0);
  display.println("Vitals Monitor");
  
  display.setCursor(0, 16);
  display.print("HR: ");
  display.print((int)currentVitals.heartRate);
  display.println(" BPM");
  
  display.setCursor(0, 32);
  display.print("SpO2: ");
  display.print((int)currentVitals.spo2);
  display.println("%");
  
  display.setCursor(0, 48);
  display.print("IP: ");
  display.println(WiFi.localIP());
  
  display.setCursor(0, 56);
  display.print("Req: ");
  display.print(totalRequests);
  display.print(" RSSI:");
  display.print(WiFi.RSSI());
  
  display.display();
}

void showStatus(String message) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("ESP32 Vitals");
  display.setCursor(0, 20);
  display.println(message);
  display.display();
}