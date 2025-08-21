import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  try {
    const db = await getDb();
    
    // Get all users
    const users = await db.collection<User>('users').find({}).toArray();
    
    // Remove password hashes for security
    const safeUsers = users.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json({
      message: 'Users retrieved successfully',
      count: safeUsers.length,
      users: safeUsers
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        message: 'Debug failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
