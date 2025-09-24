/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const esp32Ip = searchParams.get('ip') || '192.168.1.50';
  
  try {
    // Test connection to ESP32
    const baseUrl = esp32Ip.startsWith('http') ? esp32Ip : `http://${esp32Ip}`;
    
    // Test status endpoint
    const statusResponse = await fetch(`${baseUrl}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!statusResponse.ok) {
      throw new Error(`HTTP ${statusResponse.status}: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();

    // Test vitals endpoint
    const vitalsResponse = await fetch(`${baseUrl}/vitals?samples=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!vitalsResponse.ok) {
      throw new Error(`HTTP ${vitalsResponse.status}: ${vitalsResponse.statusText}`);
    }

    const vitalsData = await vitalsResponse.json();

    // Test device info endpoint
    const infoResponse = await fetch(`${baseUrl}/info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!infoResponse.ok) {
      throw new Error(`HTTP ${infoResponse.status}: ${infoResponse.statusText}`);
    }

    const infoData = await infoResponse.json();

    return NextResponse.json({
      success: true,
      esp32Ip: baseUrl,
      timestamp: new Date().toISOString(),
      tests: {
        status: {
          success: true,
          data: statusData,
        },
        vitals: {
          success: true,
          data: vitalsData,
        },
        info: {
          success: true,
          data: infoData,
        },
      },
    });

  } catch (error) {
    console.error('ESP32 test failed:', error);
    
    return NextResponse.json({
      success: false,
      esp32Ip: esp32Ip.startsWith('http') ? esp32Ip : `http://${esp32Ip}`,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, action } = body;

    if (!ip) {
      return NextResponse.json({
        success: false,
        error: 'IP address is required',
      }, { status: 400 });
    }

    const baseUrl = ip.startsWith('http') ? ip : `http://${ip}`;

    switch (action) {
      case 'test':
        // Same as GET request
        const response = await fetch(`${baseUrl}/status`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        });

      case 'vitals':
        const vitalsResponse = await fetch(`${baseUrl}/vitals?samples=10`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3000),
        });

        if (!vitalsResponse.ok) {
          throw new Error(`HTTP ${vitalsResponse.status}: ${vitalsResponse.statusText}`);
        }

        const vitalsData = await vitalsResponse.json();
        return NextResponse.json({
          success: true,
          data: vitalsData,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "test" or "vitals"',
        }, { status: 400 });
    }

  } catch (error) {
    console.error('ESP32 API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}