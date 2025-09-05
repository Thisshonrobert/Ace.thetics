// import client from "prom-client";

// // Ensure a single Gauge instance across hot reloads and module re-imports
// const globalForMetrics = globalThis as unknown as {
//     activeRequestsGauge?: client.Gauge<string>;
// };

// export const activeRequestsGauge =
//     globalForMetrics.activeRequestsGauge ??
//     (globalForMetrics.activeRequestsGauge = new client.Gauge({
//         name: "active_requests",
//         help: "Number of active requests",
//     }));