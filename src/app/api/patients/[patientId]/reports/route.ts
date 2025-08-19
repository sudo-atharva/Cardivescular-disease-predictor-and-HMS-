
import {NextRequest, NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Report} from '@/lib/models';
import {ObjectId} from 'mongodb';

export async function GET(
  request: NextRequest,
  {params}: {params: {patientId: string}}
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const reports = await db
      .collection<Report>('reports')
      .find({patientId: params.patientId})
      .sort({createdAt: -1})
      .toArray();

    if (!reports) {
      return NextResponse.json(
        {message: 'Reports not found'},
        {status: 404}
      );
    }

    return NextResponse.json(reports);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {message: 'Internal Server Error'},
      {status: 500}
    );
  }
}
