import { NextResponse } from 'next/server';
import './metrics';


export async function GET() {
  const metrics =  await globalThis?.metrics?.registry.metrics();
  // console.log(metrics);
  return new NextResponse(metrics, {
    status: 200,
    headers: {
      "Content-Type": 'text/plain',
    },
  });
}

export const revalidate = 0;