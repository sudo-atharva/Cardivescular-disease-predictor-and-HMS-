/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

import {NextRequest, NextResponse} from 'next/server';
import { getDb } from '@/lib/mongodb';
import {User} from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const patients = await db
      .collection<User>('users')
      .find({role: 'patient'})
      .toArray();
    return NextResponse.json(patients);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: 'Internal Server Error'},
      {status: 500}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const patientData = await request.json();

    // Basic validation
    if (!patientData.userId || !patientData.name) {
      return NextResponse.json(
        {message: 'Missing required fields'},
        {status: 400}
      );
    }

    const newUser: Omit<User, '_id'> = {
      ...patientData,
      role: 'patient',
      createdAt: new Date(),
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    return NextResponse.json(result, {status: 201});
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: 'Internal Server Error'},
      {status: 500}
    );
  }
}
