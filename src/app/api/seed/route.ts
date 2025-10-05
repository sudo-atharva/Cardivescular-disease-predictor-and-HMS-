/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Check if users already exist
    const existingUsers = await db.collection<User>('users').countDocuments();
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { message: 'Database already seeded' },
        { status: 200 }
      );
    }

    // Hash passwords
    const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
    const patientPasswordHash = await bcrypt.hash('patient123', 10);

    // Create sample users
    const users: Omit<User, '_id'>[] = [
      {
        userId: 'doc_001',
        name: 'Dr. Sarah Johnson',
        email: 'doctor@healthlink.com',
        role: 'doctor',
        passwordHash: doctorPasswordHash,
        createdAt: new Date(),
        patients: ['pat_001', 'pat_002']
      },
      {
        userId: 'pat_001',
        name: 'John Smith',
        role: 'patient',
        passwordHash: patientPasswordHash,
        createdAt: new Date(),
        status: 'Stable',
        lastCheck: '2024-01-15',
        risk: 'Low',
        deviceId: 'dev_001',
        isLive: false
      },
      {
        userId: 'pat_002',
        name: 'Mary Wilson',
        role: 'patient',
        passwordHash: patientPasswordHash,
        createdAt: new Date(),
        status: 'Monitoring',
        lastCheck: '2024-01-16',
        risk: 'Medium',
        deviceId: 'dev_002',
        isLive: true
      }
    ];

    // Insert users
    const result = await db.collection<User>('users').insertMany(users);

    return NextResponse.json({
      message: 'Database seeded successfully',
      insertedCount: result.insertedCount
    }, { status: 201 });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
