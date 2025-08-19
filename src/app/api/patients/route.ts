
import {NextRequest, NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {User} from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
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
    const client = await clientPromise;
    const db = client.db();
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
