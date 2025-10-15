/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

import {NextRequest, NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {User} from '@/lib/models';
import {ObjectId} from 'mongodb';

export async function GET(
  request: NextRequest,
  {params}: {params: {patientId: string}}
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const patient = await db
      .collection<User>('users')
      .findOne({userId: params.patientId, role: 'patient'});

    if (!patient) {
      return NextResponse.json({message: 'Patient not found'}, {status: 404});
    }

    return NextResponse.json(patient);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: 'Internal Server Error'},
      {status: 500}
    );
  }
}

export async function PATCH(
  request: NextRequest,
  {params}: {params: {patientId: string}}
) {
  try {
    const { deviceId, deviceUrl } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const update: Partial<User> = {};
    if (typeof deviceId === 'string') {
      (update as any).deviceId = deviceId;
    }
    if (typeof deviceUrl === 'string') {
      (update as any).deviceUrl = deviceUrl;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const result = await db
      .collection<User>('users')
      .updateOne({ userId: params.patientId, role: 'patient' }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: 'Internal Server Error'},
      {status: 500}
    );
  }
}
