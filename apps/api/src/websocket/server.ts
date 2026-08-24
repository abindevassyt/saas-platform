import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { activeWebsocketConnections } from '../utils/metrics';

export function setupWebsocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.WEB_URL],
      credentials: true,
    },
  });

  const pubClient = new Redis(env.REDIS_URL);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; email: string };
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    activeWebsocketConnections.inc();
    logger.info(`WebSocket client connected: ${socket.id} (User: ${socket.data.user?.userId})`);

    socket.on('join_tenant', (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
      logger.info(`Socket ${socket.id} joined room: tenant:${tenantId}`);
    });

    socket.on('leave_tenant', (tenantId: string) => {
      socket.leave(`tenant:${tenantId}`);
      logger.info(`Socket ${socket.id} left room: tenant:${tenantId}`);
    });

    socket.on('disconnect', () => {
      activeWebsocketConnections.dec();
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  const eventSubscriber = pubClient.duplicate();
  eventSubscriber.psubscribe('tenant:*:events').catch((err) => {
    logger.error('Failed to subscribe to Redis events:', err);
  });

  eventSubscriber.on('pmessage', (_pattern: string, channel: string, message: string) => {
    try {
      const tenantId = channel.split(':')[1];
      const eventData = JSON.parse(message);
      io.to(`tenant:${tenantId}`).emit('tenant_event', eventData);
    } catch (err) {
      logger.error('Error broadcasting socket event:', err);
    }
  });

  return io;
}
