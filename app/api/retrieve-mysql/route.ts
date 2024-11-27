import { NextResponse } from 'next/server';
import { retrieveFromMySQL } from '@/lib/dbOperations';

export async function GET() {
  try {
    const data = await retrieveFromMySQL();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}


