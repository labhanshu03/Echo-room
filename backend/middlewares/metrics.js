import client from "prom-client"

// A "Registry" is just the collection that holds all our metrics.
// Prometheus scrapes whatever is inside this registry.
const register = new client.Registry()

// Adds Node.js/process metrics for free: CPU usage, memory (RSS/heap),
// event loop lag, active handles, GC duration, etc.
client.collectDefaultMetrics({ register })

// Counter: a number that only goes up (e.g. total requests, total messages).
// Useful for calculating rates with PromQL, e.g. rate(http_requests_total[1m]).
export const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests received",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
})

// Histogram: buckets how long things take, so you can compute
// p50/p95/p99 latency later instead of just an average.
export const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register],
})

// Gauge: a number that can go up or down (e.g. currently connected sockets).
export const activeSocketConnections = new client.Gauge({
    name: "socket_active_connections",
    help: "Number of currently connected Socket.IO clients",
    registers: [register],
})

export const messagesSentTotal = new client.Counter({
    name: "chat_messages_sent_total",
    help: "Total number of chat messages sent",
    labelNames: ["type"], // "direct" or "channel"
    registers: [register],
})

// Express middleware that times every request and records it against
// the counter/histogram above. Mount this before your routes.
export const httpMetricsMiddleware = (req, res, next) => {
    const endTimer = httpRequestDurationSeconds.startTimer()

    res.on("finish", () => {
        // req.route is only set once Express matches a route; fall back to
        // req.path so unmatched routes (404s) still get recorded.
        const route = req.route?.path ? req.baseUrl + req.route.path : req.path
        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode,
        }
        httpRequestsTotal.inc(labels)
        endTimer(labels)
    })

    next()
}

export { register }
