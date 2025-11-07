import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { isAdmin } from '@/auth';
import '../../metrics/metrics'

// 🧩 Helper to wrap metrics around a request
function trackRequest(method: string, route: string) {
  const startTime = Date.now();
  globalThis.metrics?.activeRequestsGauge.inc();

  const end = (status: number) => {
    globalThis.metrics?.requestCounter.inc({ method, route, status_code: String(status) });
    globalThis.metrics?.httpRequestDurationMicroseconds.observe(
      { method, route, code: String(status) },
      Date.now() - startTime
    );
    globalThis.metrics?.activeRequestsGauge.dec();
  };

  return { end };
}

// ✅ Main route
export async function GET(req: NextRequest) {
  const route = '/api/admin/check-celebrity';
  const { end } = trackRequest('GET', route);

  try {
    if (!(await isAdmin())) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      end(401);
      return res;
    }

    const name = req.nextUrl.searchParams.get('name');
    if (!name) {
      const res = NextResponse.json({ error: 'Name is required' }, { status: 400 });
      end(400);
      return res;
    }

    const celebrity = await prisma.celebrity.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    console.log(celebrity ? 'exists' : 'does not exist');
    const res = NextResponse.json({ exists: !!celebrity });
    end(res.status);
    return res;
  } catch (error) {
    console.error('Error checking celebrity:', error);
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    end(500);
    return res;
  }
}
