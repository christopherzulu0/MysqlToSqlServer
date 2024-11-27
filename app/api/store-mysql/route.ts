import { NextResponse } from 'next/server';
import { storeInMySQL } from '@/lib/dbOperations';

export async function POST(request: Request) {
  try {
    const { pk, imagePath } = await request.json();
    
    if (typeof pk !== 'number' || typeof imagePath !== 'string') {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    if (imagePath.length > 1000) {
      return NextResponse.json({ error: 'Image path is too long. Maximum length is 1000 characters.' }, { status: 400 });
    }

    await storeInMySQL(pk, imagePath);
    return NextResponse.json({ message: 'Data stored successfully' });
  } catch (error) {
    console.error('Error in /api/store-mysql:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

