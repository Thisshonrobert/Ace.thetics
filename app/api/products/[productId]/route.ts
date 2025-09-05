import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';
// import { withMetrics } from '../../metrics/middlewareMetrics';
import '../../metrics/metrics'

export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  const routeLabel = '/api/products/[productId]'
  const startTimeMs = Date.now()
  globalThis.metrics?.activeRequestsGauge.inc()
  try {
    const productId = parseInt(params.productId);
    const { brandname, seoname, imageUrl, link, description } = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        brandname,
        seoname,
        imageUrl,
        link,
        description,
      },
    });

    const res = NextResponse.json(updatedProduct);
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: String(res.status) })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: String(res.status) }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  } catch (error) {
    console.error('Error updating product:', error);
    const res = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    globalThis.metrics?.requestCounter.inc({ method: 'PUT', route: routeLabel, status_code: '500' })
    globalThis.metrics?.httpRequestDurationMicroseconds.observe({ method: 'PUT', route: routeLabel, code: '500' }, Date.now() - startTimeMs)
    globalThis.metrics?.activeRequestsGauge.dec()
    return res;
  }
}

// export const PUT = withMetrics(updateProduct, "/api/products/[productId]", {
//   counter: true,
  
  
// });