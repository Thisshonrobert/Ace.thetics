
import { isAdmin } from '@/auth';
import { ClearDB } from '@/lib/actions/ClearDB';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  await ClearDB();
  return NextResponse.json({ message: 'Database cleared successfully.' });
  
}


