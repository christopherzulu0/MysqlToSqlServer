import { NextRequest, NextResponse } from 'next/server';
import { retrieveFromMySQL } from '@/lib/dbOperations';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

  try {
    const { data, total } = await retrieveFromMySQL(page, pageSize);
    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error('Error in /api/retrieve-mysql:', error);
    return NextResponse.json({ error: 'Failed to retrieve data from MySQL' }, { status: 500 });
  }
}

