#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// WiFi credentials
const char* ssid = "Tiklehouse";
const char* password = "Pass@1660";

// Static IP configuration (optional but recommended)
IPAddress local_IP(192, 168, 1, 50);  // Change to your desired IP
IPAddress gateway(192, 168, 1, 1);    // Your router's IP
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);
IPAddress secondaryDNS(8, 8, 4, 4);

// HTTP server on port 80
AsyncWebServer server(80);

// OLED Display configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// AD8232 ECG sensor pins
const int ECG_OUTPUT = 34;      // ECG signal output
const int ECG_LO_PLUS = 35;     // Leads-off detection +
const int ECG_LO_MINUS = 32;    // Leads-off detection -

// Sampling configuration
const int SAMPLE_RATE = 100;  // Hz (adjust between 50-250)
const int SAMPLE_INTERVAL = 1000 / SAMPLE_RATE;  // ms
const int SAMPLE_BUFFER_SIZE = 50;   // Store 50 samples

// Data buffers
struct VitalSample {
  unsigned long timestamp;
  float ecg;
  float spo2;
  float heartRate;
};

VitalSample sampleBuffer[SAMPLE_BUFFER_SIZE];
int bufferIndex = 0;
unsigned long lastSampleTime = 0;
bool bufferFull = false;

// Simulated heart rate and SpO2 (replace with actual MAX30105 readings)
float beatsPerMinute = 0;
float currentSpO2 = 0;

// Calibration values for ECG
const float ECG_SCALE = 0.004;  // Scale to ~[-2,2] mV range
const float ECG_OFFSET = -1.65; // Center around 0

// Status tracking
unsigned long lastRequestTime = 0;
unsigned long lastDisplayUpdate = 0;
int totalRequests = 0;
bool deviceConnected = false;

// Display update interval
const unsigned long DISPLAY_UPDATE_INTERVAL = 1000; // Update display every 1 second

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 Vitals Monitor Starting...");
  
  // Initialize I2C
  Wire.begin();
  
  // Initialize OLED display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
  } else {
    Serial.println("OLED display initialized");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0,0);
    display.println("Vitals Monitor");
    display.println("Starting...");
    display.display();
  }
  
  // Initialize ECG sensor pins
  pinMode(ECG_LO_PLUS, INPUT);
  pinMode(ECG_LO_MINUS, INPUT);
  Serial.println("AD8232 ECG sensor initialized");
  
  // Configure static IP
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Static IP configuration failed");
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Connecting WiFi...");
  display.display();
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("WiFi connected! IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("HTTP server running on: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");
  
  // Update display with connection info
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("WiFi Connected!");
  display.print("IP: ");
  display.println(WiFi.localIP());
  display.println("Server: Ready");
  display.display();
  delay(2000);
  
  // Setup HTTP routes
  setupRoutes();
  
  // Start server
  server.begin();
  Serial.println("HTTP server started");
  Serial.println("Available endpoints:");
  Serial.println("  GET /vitals - Get latest vital signs data");
  Serial.println("  GET /status - Get device status");
  Serial.println("  GET /info - Get device information");
  
  Serial.println("System ready!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Generate simulated heart rate and SpO2 (replace with actual MAX30105 readings)
  generateSimulatedVitals();
  
  // Sample at specified rate
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL) {
    lastSampleTime = currentTime;
    
    // Read sensors
    VitalSample sample;
    sample.timestamp = currentTime;
    sample.ecg = readECG();
    sample.spo2 = currentSpO2;
    sample.heartRate = beatsPerMinute;
    
    // Add to circular buffer
    sampleBuffer[bufferIndex] = sample;
    bufferIndex = (bufferIndex + 1) % SAMPLE_BUFFER_SIZE;
    
    if (!bufferFull && bufferIndex == 0) {
      bufferFull = true;
    }
  }
  
  // Update OLED display
  if (currentTime - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL) {
    lastDisplayUpdate = currentTime;
    updateDisplay();
  }
  
  // Check if device is still connected (no requests for 30 seconds means disconnected)
  if (currentTime - lastRequestTime > 30000 && totalRequests > 0) {
    deviceConnected = false;
  }
  
  delay(1); // Small delay to prevent watchdog issues
}

void setupRoutes() {
  // Enable CORS for all routes
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle preflight requests
  server.on("/vitals", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    request->send(200);
  });
  
  server.on("/status", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    request->send(200);
  });
  
  server.on("/info", HTTP_OPTIONS, [](AsyncWebServerRequest *request){
    request->send(200);
  });
  
  // GET /vitals - Return latest vital signs data
  server.on("/vitals", HTTP_GET, [](AsyncWebServerRequest *request){
    lastRequestTime = millis();
    totalRequests++;
    deviceConnected = true;
    
    Serial.println("Received /vitals request");
    
    // Get number of samples requested (default 10, max SAMPLE_BUFFER_SIZE)
    int numSamples = 10;
    if (request->hasParam("samples")) {
      numSamples = request->getParam("samples")->value().toInt();
      numSamples = constrain(numSamples, 1, SAMPLE_BUFFER_SIZE);
    }
    
    // Create JSON response
    DynamicJsonDocument doc(2048);
    JsonArray dataArray = doc.createNestedArray("data");
    
    // Get the most recent samples
    int samplesAdded = 0;
    int currentIndex = bufferIndex;
    
    // Go backwards from current position
    for (int i = 0; i < numSamples && samplesAdded < (bufferFull ? SAMPLE_BUFFER_SIZE : bufferIndex); i++) {
      currentIndex = (currentIndex - 1 + SAMPLE_BUFFER_SIZE) % SAMPLE_BUFFER_SIZE;
      
      JsonObject sample = dataArray.createNestedObject();
      sample["timestamp"] = sampleBuffer[currentIndex].timestamp;
      sample["ecg"] = round(sampleBuffer[currentIndex].ecg * 1000.0) / 1000.0;
      sample["spo2"] = round(sampleBuffer[currentIndex].spo2 * 10.0) / 10.0;
      sample["heartRate"] = round(sampleBuffer[currentIndex].heartRate * 10.0) / 10.0;
      
      samplesAdded++;
    }
    
    // Add metadata
    doc["count"] = samplesAdded;
    doc["sampleRate"] = SAMPLE_RATE;
    doc["timestamp"] = millis();
    doc["status"] = "ok";
    
    String response;
    serializeJson(doc, response);
    
    request->send(200, "application/json", response);
    
    Serial.printf("Sent %d samples to client\n", samplesAdded);
  });
  
  // GET /status - Return device status
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
    lastRequestTime = millis();
    totalRequests++;
    
    Serial.println("Received /status request");
    
    DynamicJsonDocument doc(512);
    doc["status"] = "online";
    doc["connected"] = deviceConnected;
    doc["uptime"] = millis();
    doc["totalRequests"] = totalRequests;
    doc["sampleRate"] = SAMPLE_RATE;
    doc["bufferSize"] = SAMPLE_BUFFER_SIZE;
    doc["bufferFull"] = bufferFull;
    doc["wifiRSSI"] = WiFi.RSSI();
    doc["freeHeap"] = ESP.getFreeHeap();
    doc["timestamp"] = millis();
    doc["currentHeartRate"] = beatsPerMinute;
    doc["currentSpO2"] = currentSpO2;
    
    String response;
    serializeJson(doc, response);
    
    request->send(200, "application/json", response);
    
    Serial.println("Status response sent");
  });
  
  // GET /info - Return device information
  server.on("/info", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("Received /info request");
    
    DynamicJsonDocument doc(512);
    doc["device"] = "ESP32 Vitals Monitor";
    doc["version"] = "2.1.0";
    doc["protocol"] = "HTTP";
    doc["sensors"] = "AD8232 ECG, Simulated SpO2/HR, SSD1306 OLED";
    doc["ip"] = WiFi.localIP().toString();
    doc["mac"] = WiFi.macAddress();
    doc["chipModel"] = ESP.getChipModel();
    doc["chipRevision"] = ESP.getChipRevision();
    doc["flashSize"] = ESP.getFlashChipSize();
    doc["timestamp"] = millis();
    
    String response;
    serializeJson(doc, response);
    
    request->send(200, "application/json", response);
    
    Serial.println("Info response sent");
  });
  
  // Root endpoint - Simple status page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    Serial.println("Received root request");
    
    String html = "<!DOCTYPE html><html><head><title>ESP32 Vitals Monitor</title></head><body>";
    html += "<h1>ESP32 Vitals Monitor v2.1</h1>";
    html += "<p>Status: <strong>Online</strong></p>";
    html += "<p>IP Address: <strong>" + WiFi.localIP().toString() + "</strong></p>";
    html += "<p>Uptime: <strong>" + String(millis() / 1000) + " seconds</strong></p>";
    html += "<p>Sample Rate: <strong>" + String(SAMPLE_RATE) + " Hz</strong></p>";
    html += "<p>Heart Rate: <strong>" + String((int)beatsPerMinute) + " BPM</strong></p>";
    html += "<p>SpO2: <strong>" + String((int)currentSpO2) + "%</strong></p>";
    html += "<h2>Sensors:</h2>";
    html += "<ul>";
    html += "<li>AD8232 ECG - GPIO34 (signal), GPIO35 (LO+), GPIO32 (LO-)</li>";
    html += "<li>Simulated SpO2/HR - For testing purposes</li>";
    html += "<li>SSD1306 OLED - I2C (SDA: GPIO21, SCL: GPIO22)</li>";
    html += "</ul>";
    html += "<h2>API Endpoints:</h2>";
    html += "<ul>";
    html += "<li><a href='/vitals'>/vitals</a> - Get vital signs data</li>";
    html += "<li><a href='/status'>/status</a> - Get device status</li>";
    html += "<li><a href='/info'>/info</a> - Get device info</li>";
    html += "</ul>";
    html += "<p><em>Last updated: " + String(millis()) + "</em></p>";
    html += "</body></html>";
    
    request->send(200, "text/html", html);
    
    Serial.println("Root response sent");
  });
  
  // Handle 404
  server.onNotFound([](AsyncWebServerRequest *request){
    Serial.printf("404 - Not found: %s\n", request->url().c_str());
    request->send(404, "application/json", "{\"error\":\"Not found\"}");
  });
}

float readECG() {
  // Check leads-off detection
  if ((digitalRead(ECG_LO_PLUS) == 1) || (digitalRead(ECG_LO_MINUS) == 1)) {
    // Leads are off, return baseline
    return 0.0;
  }
  
  // Read ECG signal
  int rawValue = analogRead(ECG_OUTPUT);
  
  // Convert to voltage and scale to mV range
  float voltage = (rawValue / 4095.0) * 3.3; // ESP32 ADC: 12-bit, 3.3V ref
  float ecgValue = (voltage + ECG_OFFSET) * ECG_SCALE;
  
  return ecgValue;
}

void generateSimulatedVitals() {
  // Generate realistic simulated heart rate (60-100 BPM)
  static unsigned long lastHeartRateUpdate = 0;
  if (millis() - lastHeartRateUpdate > 2000) { // Update every 2 seconds
    beatsPerMinute = 70 + random(-10, 20); // 60-90 BPM with some variation
    lastHeartRateUpdate = millis();
  }
  
  // Generate realistic simulated SpO2 (95-100%)
  static unsigned long lastSpO2Update = 0;
  if (millis() - lastSpO2Update > 3000) { // Update every 3 seconds
    currentSpO2 = 97 + random(-2, 3); // 95-100% with some variation
    lastSpO2Update = millis();
  }
}

void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Title
  display.setCursor(0, 0);
  display.println("Vitals Monitor");
  
  // Heart Rate
  display.setCursor(0, 16);
  display.print("HR: ");
  if (beatsPerMinute > 0) {
    display.print((int)beatsPerMinute);
    display.println(" BPM");
  } else {
    display.println("-- BPM");
  }
  
  // SpO2
  display.setCursor(0, 32);
  display.print("SpO2: ");
  if (currentSpO2 > 0) {
    display.print((int)currentSpO2);
    display.println("%");
  } else {
    display.println("--%");
  }
  
  // Connection status
  display.setCursor(0, 48);
  if (deviceConnected) {
    display.print("Connected");
  } else {
    display.print("Waiting...");
  }
  
  // WiFi signal strength
  display.setCursor(80, 48);
  int rssi = WiFi.RSSI();
  if (rssi > -50) {
    display.print("WiFi:+++");
  } else if (rssi > -70) {
    display.print("WiFi:++");
  } else if (rssi > -90) {
    display.print("WiFi:+");
  } else {
    display.print("WiFi:!");
  }
  
  display.display();
}