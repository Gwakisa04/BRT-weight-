import { io, Socket } from 'socket.io-client';
import type { LiveWeight, SystemStatus } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection_error', { error, attempts: this.reconnectAttempts });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attempts: attemptNumber });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Subscribe to live weight updates
  onLiveWeight(callback: (data: LiveWeight) => void): () => void {
    return this.subscribe('live_weight', callback);
  }

  // Subscribe to system status updates
  onSystemStatus(callback: (data: SystemStatus) => void): () => void {
    return this.subscribe('system_status', callback);
  }

  // Subscribe to sensor status
  onSensorStatus(callback: (data: { connected: boolean; signalStrength: number }) => void): () => void {
    return this.subscribe('sensor_status', callback);
  }

  // Subscribe to alarm events
  onAlarmEvent(callback: (data: { active: boolean; reason?: string }) => void): () => void {
    return this.subscribe('alarm_event', callback);
  }

  // Subscribe to measurement events
  onMeasurementComplete(callback: (data: { measurementId: string; success: boolean }) => void): () => void {
    return this.subscribe('measurement_complete', callback);
  }

  onVehicleLocation(
    callback: (data: {
      vehicleId: string;
      plateNumber: string;
      location: {
        latitude: number;
        longitude: number;
        altitude?: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
        timestamp: string | Date;
        address?: unknown;
      };
      gpsDevice?: unknown;
      source?: string;
    }) => void
  ): () => void {
    return this.subscribe('vehicle_location', callback);
  }

  // Generic subscribe method
  private subscribe<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const typedCallback = callback as (...args: unknown[]) => void;
    this.listeners.get(event)!.add(typedCallback);
    
    this.socket?.on(event, callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(typedCallback);
      this.socket?.off(event, callback);
    };
  }

  // Emit events
  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  // Send commands to server
  sendCommand(command: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(command, data);
    } else {
      console.warn('[Socket] Cannot send command - not connected');
    }
  }

  // Request weight capture
  captureWeight(): void {
    this.sendCommand('capture_weight');
  }

  // Request scale reset
  resetScale(): void {
    this.sendCommand('reset_scale');
  }

  // Trigger alarm
  triggerAlarm(): void {
    this.sendCommand('trigger_alarm');
  }

  // Stop alarm
  stopAlarm(): void {
    this.sendCommand('stop_alarm');
  }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;
