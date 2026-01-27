import { Registry, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

declare global {
  var metrics: {
    registry: Registry;
    requestCounter: Counter;
    activeRequestsGauge: Gauge;
    httpRequestDurationMicroseconds: Histogram;
  } | undefined;
}

// Ensure singleton across dev HMR and route reloads
if (!globalThis.metrics) {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  const requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry]
  });

  const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000],
    registers: [registry]
  });

  const activeRequestsGauge = new Gauge({
    name: 'active_requests',
    help: 'Number of active requests',
    registers: [registry]
  });

  globalThis.metrics = {
    registry,
    requestCounter,
    activeRequestsGauge,
    httpRequestDurationMicroseconds
  };
}

export const metrics = globalThis.metrics!;

