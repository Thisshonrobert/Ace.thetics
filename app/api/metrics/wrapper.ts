import { metrics } from "./metrics";
import { NextRequest, NextResponse } from "next/server";

export function withMetrics<T extends Request = NextRequest>(
    handler: (req: T, ...args: any[]) => Promise<Response>,
    routeLabel: string
) {
    return async (req: T, ...args: any[]) => {
        const startTimeMs = Date.now();
        metrics.activeRequestsGauge.inc();

        try {
            const res = await handler(req, ...args);

            const duration = Date.now() - startTimeMs;
            metrics.requestCounter.inc({
                method: req.method,
                route: routeLabel,
                status_code: String(res.status),
            });
            metrics.httpRequestDurationMicroseconds.observe(
                {
                    method: req.method,
                    route: routeLabel,
                    code: String(res.status),
                },
                duration
            );

            return res;
        } catch (error) {
            // In case the handler throws, we count it as 500
            const duration = Date.now() - startTimeMs;
            metrics.requestCounter.inc({
                method: req.method,
                route: routeLabel,
                status_code: "500",
            });
            metrics.httpRequestDurationMicroseconds.observe(
                {
                    method: req.method,
                    route: routeLabel,
                    code: "500",
                },
                duration
            );

            throw error;
        } finally {
            metrics.activeRequestsGauge.dec();
        }
    };
}
