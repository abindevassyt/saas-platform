'use client';

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';
import { Activity, Radio } from 'lucide-react';
import { Badge } from './ui/badge';

interface EventItem {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

export const RealtimeFeed: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const tenantId = apiClient.getTenantId();
    if (!tenantId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const socket: Socket = io(socketUrl, {
      auth: { token: 'mock-socket-auth-token' },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_tenant', tenantId);
    });

    socket.on('tenant_event', (eventData: any) => {
      setEvents((prev) => [
        {
          id: Math.random().toString(),
          type: eventData.type,
          payload: eventData.payload,
          timestamp: eventData.timestamp || new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Real-Time Event Stream</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
          <Badge variant={isConnected ? 'emerald' : 'slate'}>{isConnected ? 'Live WebSocket' : 'Offline'}</Badge>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">Listening for tenant activities & updates...</p>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-400">{evt.type}</span>
                <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px] truncate">
                {JSON.stringify(evt.payload)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
