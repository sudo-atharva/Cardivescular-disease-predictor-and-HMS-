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
    const { userId, name, email, password, role } = await request.json();

    if (!userId || !name || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.collection<User>('users').findOne({ userId });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: Omit<User, '_id'> = {
      userId,
      name,
      email: email || undefined,
      role,
      passwordHash,
      createdAt: new Date(),
      // Set default values based on role
      ...(role === 'doctor' && { patients: [] }),
      ...(role === 'patient' && {
        status: 'Stable',
        lastCheck: new Date().toISOString().split('T')[0],
        risk: 'Low',
        deviceId: null,
        isLive: false
      })
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    // Return user data without password
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'User created successfully',
      user: { ...userWithoutPassword, _id: result.insertedId }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
