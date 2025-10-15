/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

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
    const reportData = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Extract patient info and device ID from report data
    const { patientInfo, deviceId, ...restOfReport } = reportData;

    // 1. Create or find patient
    const usersCollection = db.collection<User>('users');
    let patient = await usersCollection.findOne({ userId: patientInfo.patientId });

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
        deviceId: deviceId || 'default-device',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await usersCollection.insertOne(newPatient as User);
    } else if (deviceId && patient.deviceId !== deviceId) {
      // Update device ID if it's different
      await usersCollection.updateOne(
        { userId: patientInfo.patientId },
        { $set: { deviceId } }
      );
    }

    // 2. Create Report with device ID
    const newReport: Omit<Report, '_id'> = {
      reportId: `rep_${Date.now()}`,
      patientId: patientInfo.patientId,
      deviceId: deviceId || patient?.deviceId || 'default-device',
      patientInfo: {
        fullName: patientInfo.fullName,
        age: patientInfo.age,
        gender: patientInfo.gender,
        visitDate: patientInfo.visitDate,
        address: patientInfo.address,
      },
      ...restOfReport,
      mlDiagnosis: restOfReport.mlDiagnosis || "Awaiting ML model analysis.",
      createdAt: new Date(),
    };

    const result = await db.collection<Report>('reports').insertOne(newReport);
    return NextResponse.json({ ...newReport, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { reportId } = await request.json();
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('reports').deleteOne({ reportId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
