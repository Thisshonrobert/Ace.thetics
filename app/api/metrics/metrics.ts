import client from "prom-client";
// import { requestCounter } from "./requestCount";
// import { activeRequestsGauge } from "./activeRequest";
// import { httpRequestDurationMicroseconds } from "./requestTime";
import { Registry, collectDefaultMetrics, Counter,Histogram,Gauge } from 'prom-client';


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
  const prometheusRegistry = new Registry();
  collectDefaultMetrics({ register: prometheusRegistry });

  const requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [prometheusRegistry]
  });

  const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000],
    registers: [prometheusRegistry]
  });

  const activeRequestsGauge = new Gauge({
    name: 'active_requests',
    help: 'Number of active requests',
    registers: [prometheusRegistry]
  });

  globalThis.metrics = {
    registry: prometheusRegistry,
    requestCounter,
    activeRequestsGauge,
    httpRequestDurationMicroseconds
  };
}

// import client from "prom-client";
// import { requestCounter } from "./requestCount";
// import { activeRequestsGauge } from "./activeRequest";
// import { httpRequestDurationMicroseconds } from "./requestTime";

// Ensure a single Registry and single default metrics collection across reloads
// const globalForMetrics = globalThis as unknown as {
//   promRegistry?: client.Registry;
//   promDefaultCollected?: boolean;
// };

// export const registry =
//   globalForMetrics.promRegistry ??
//   (globalForMetrics.promRegistry = new client.Registry());

// if (!globalForMetrics.promDefaultCollected) {
//   client.collectDefaultMetrics({ register: registry });
//   globalForMetrics.promDefaultCollected = true;
// }

// // Register custom metrics if not already present
// if (!registry.getSingleMetric("http_requests_total")) {
//   registry.registerMetric(requestCounter);
// }
// if (!registry.getSingleMetric("active_requests")) {
//   registry.registerMetric(activeRequestsGauge);
// }
// if (!registry.getSingleMetric("http_request_duration_ms")) {
//   registry.registerMetric(httpRequestDurationMicroseconds);
// }
