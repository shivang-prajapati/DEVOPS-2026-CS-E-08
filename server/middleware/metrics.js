const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default recommended metrics (CPU, Memory, Event Loop, GC, etc.)
client.collectDefaultMetrics({
  register,
  timeout: 5000
});

// Custom HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Custom HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

// Custom active connections gauge
const httpActiveRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Number of active HTTP requests currently being handled',
  labelNames: ['method'],
  registers: [register]
});

function normalizePath(req) {
  const url = req.baseUrl || req.path || '/';
  if (url.startsWith('/assets/')) return '/assets/*';
  if (req.route && req.route.path) {
    return (req.baseUrl || '') + req.route.path;
  }
  return url;
}

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const method = req.method;
  httpActiveRequests.inc({ method });
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    httpActiveRequests.dec({ method });

    const diff = process.hrtime(startHrTime);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = normalizePath(req);
    const statusCode = res.statusCode ? res.statusCode.toString() : 'unknown';

    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDurationSeconds.observe({ method, route, status_code: statusCode }, durationSeconds);
  });

  next();
}

async function metricsEndpoint(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
}

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpActiveRequests
};
