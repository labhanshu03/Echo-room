import client from "prom-client"

const register = new client.Registry()

client.collectDefaultMetrics({ register })

export const httpRequestsTotal = new client.Counter({
    name:"http_requests_total",
    help:"Total number of HTTP requests",
    labelNames:["method","route","status_code"],
    registers:[register]
})

export const httpRequestDurationSeconds = new client.Histogram({
    name:"http_request_duration_seconds",
    help:"Duration of HTTP requests in seconds",
    labelNames:["method","route","status_code"],
    buckets:[0.1,0.5,1,1.5,2,5],
    registers:[register]
})

export const activeSocketConnections = new client.Gauge({
    name: "socket_active_connections",
    help: "Number of active socket connections",
    registers: [register]
})

export const messagesSentTotal = new client.Counter({
    name: "messages_sent_total",
    help: "Total number of messages sent",
    labelNames: ["type"],
    registers: [register]
})


export const httpMetricsMiddleware = (req, res, next) => {
    const endTimer = httpRequestDurationSeconds.startTimer()
    res.on("finish", () => {
        const route = req.route?.path ? req.baseUrl + req.route.path : req.path
        const labels = {
            method: req.method,
            route: route,
            status_code: res.statusCode
        }
        httpRequestsTotal.inc(labels)
        endTimer(labels)
    })
    next()
}

export {register} 
