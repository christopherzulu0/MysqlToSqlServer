import { NextResponse } from 'next/server';
import { pushToSQLServer } from '@/lib/dbOperations';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await pushToSQLServer(data);
    return NextResponse.json({ message: 'Data pushed successfully' });
  } catch (error) {
    console.error('Error in /api/push-sqlserver:', error);
    let errorMessage = 'Failed to push data';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

