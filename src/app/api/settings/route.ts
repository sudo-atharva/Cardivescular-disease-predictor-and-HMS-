import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { esp32IpAddress } = data;

    // Store in environment or database if needed
    // For now, we'll use client-side storage

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return current settings
    // For now, we'll use client-side storage
    return NextResponse.json({
      esp32IpAddress: process.env.ESP32_IP || 'localhost:81'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
