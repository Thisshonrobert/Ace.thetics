import { activeRequestsGauge } from "./activeRequest";
import { requestCounter } from "./requestCount";
import { httpRequestDurationMicroseconds } from "./requestTime";


type MetricsOptions = {
  counter?: boolean;
  gauge?: boolean;
  histogram?: boolean;
};

export function withMetrics(
  handler: (req: Request, ...args: any[]) => Promise<Response> | Response,
  route: string,
  options: MetricsOptions = { counter: true, gauge: true, histogram: true }
) {
  return async (req: Request): Promise<Response> => {
    const startTime = Date.now();
    if (options.gauge) activeRequestsGauge.inc();

    let res: Response;

    try {
      res = await handler(req);
    } catch (err) {
      res = new Response("Internal Server Error", { status: 500 });
    }

    const duration = Date.now() - startTime;

    // Record only if enabled
    if (options.counter) {
      requestCounter.inc({
        method: req.method,
        route,
        status_code: res.status,
      });
    }

    if (options.histogram) {
      httpRequestDurationMicroseconds.observe(
        { method: req.method, route, code: res.status },
        duration
      );
    }

    if (options.gauge) activeRequestsGauge.dec();

    return res;
  };
}
