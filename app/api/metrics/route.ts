import { NextResponse } from 'next/server';
import { metrics } from './metrics';

export async function GET() {
  const metricsData = await metrics.registry.metrics();
  return new NextResponse(metricsData, {
    status: 200,
    headers: {
      "Content-Type": 'text/plain',
    },
  });
}

export const revalidate = 0;