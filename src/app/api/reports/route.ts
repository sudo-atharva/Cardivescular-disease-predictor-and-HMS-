
import {NextRequest, NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Report, User} from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const reports = await db
      .collection<Report>('reports')
      .find({})
      .sort({createdAt: -1})
      .toArray();
    return NextResponse.json(reports);
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
    const reportData = await request.json();

    const {patientInfo, ...restOfReport} = reportData;

    // 1. Create or find patient
    const usersCollection = db.collection<User>('users');
    let patient = await usersCollection.findOne({userId: patientInfo.patientId});

    if (!patient) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(patientInfo.password, salt);

      const newPatient: Omit<User, '_id'> = {
        userId: patientInfo.patientId,
        name: patientInfo.fullName,
        role: 'patient',
        passwordHash,
        status: 'Stable',
        risk: 'Low',
        lastCheck: new Date().toLocaleDateString(),
        isLive: false,
      };
      await usersCollection.insertOne(newPatient as User);
    }

    // 2. Create Report
    const newReport: Omit<Report, '_id'> = {
      reportId: `rep_${Date.now()}`,
      patientId: patientInfo.patientId,
      patientInfo: {
        fullName: patientInfo.fullName,
        age: patientInfo.age,
        gender: patientInfo.gender,
        visitDate: patientInfo.visitDate,
        address: patientInfo.address,
      },
      ...restOfReport,
      mlDiagnosis:
        restOfReport.mlDiagnosis ||
        "Awaiting ML model analysis. Generate from the patient's detail page.",
      createdAt: new Date(),
    };

    const result = await db
      .collection<Report>('reports')
      .insertOne(newReport as Report);

    return NextResponse.json(result, {status: 201});
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json(
      {message: 'Failed to create report'},
      {status: 500}
    );
  }
}
