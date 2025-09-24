/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST() {
  try {
    const db = await getDb();
    
    // Clear all collections
    await db.collection('users').deleteMany({});
    await db.collection('reports').deleteMany({});
    
    return NextResponse.json({
      message: 'Database cleared successfully'
    });
    
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json(
      { 
        message: 'Clear failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
