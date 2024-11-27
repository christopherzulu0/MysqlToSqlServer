import { NextResponse } from 'next/server';
import { retrieveFromSQLServer } from '@/lib/dbOperations';

export async function GET() {
  try {
    const data = await retrieveFromSQLServer();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/retrieve-sqlserver:', error);
    return NextResponse.json({ error: 'Failed to retrieve data from SQL Server' }, { status: 500 });
  }
}

