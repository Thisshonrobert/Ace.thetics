
import client from "prom-client";

// Ensure a single Counter instance across hot reloads and module re-imports
// const globalForMetrics = globalThis as unknown as {
//     requestCounter?: client.Counter<string>;
// };

// export const requestCounter =
//     globalForMetrics.requestCounter ??
//     (globalForMetrics.requestCounter = new client.Counter({
//         name: "http_requests_total",
//         help: "Total number of HTTP requests",
//         labelNames: ["method", "route", "status_code"],
//     }));