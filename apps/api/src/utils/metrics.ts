import client from 'prom-client';

// Collect default metrics (CPU, Memory, Event Loop Lag)
client.collectDefaultMetrics({ prefix: 'saas_api_' });

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeWebsocketConnections = new client.Gauge({
  name: 'active_websocket_connections',
  help: 'Current active WebSocket connections',
});

export const metricsRegistry = client.register;
