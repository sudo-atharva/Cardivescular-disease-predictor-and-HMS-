import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    
    // Test database connection
    await db.admin().ping();
    
    // Get database stats
    const stats = await db.stats();
    
    return NextResponse.json({
      message: 'MongoDB connection successful',
      database: db.databaseName,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { 
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
