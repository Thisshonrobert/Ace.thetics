// import client from "prom-client";

// // Ensure a single Histogram instance across hot reloads and module re-imports
// const globalForMetrics = globalThis as unknown as {
//     httpRequestDurationMicroseconds?: client.Histogram<string>;
// };

// export const httpRequestDurationMicroseconds =
//     globalForMetrics.httpRequestDurationMicroseconds ??
//     (globalForMetrics.httpRequestDurationMicroseconds = new client.Histogram({
//         name: "http_request_duration_ms",
//         help: "Duration of HTTP requests in ms",
//         labelNames: ["method", "route", "code"],
//         buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000], // buckets for response time from 0.1ms to 5s
//     }));