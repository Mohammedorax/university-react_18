import { useEffect, useRef, useCallback } from 'react';
import { logger } from './logger';

type WebSocketMessage = {
  type: string;
  data?: any;
  error?: string;
};

type WebSocketCallback = (data: any) => void;

export type WebSocketOptions = {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: WebSocketCallback;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
};

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketOptions;
  private reconnectAttempts = 0;
  private messageQueue: string[] = [];

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      logger.warn('WebSocket is already connected');
      return;
    }

    logger.info(`Connecting to WebSocket: ${this.url}`);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        logger.info('WebSocket connected');
        this.reconnectAttempts = 0;
        this.options.onConnect?.();

        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.ws?.send(message!);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          logger.debug('WebSocket message received:', message);
          this.options.onMessage?.(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket error:', { type: error.type, target: error.target });
        this.options.onError?.(error as Event);
      };

      this.ws.onclose = () => {
        logger.info('WebSocket disconnected');
        this.options.onDisconnect?.();

        if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts!) {
          this.reconnectAttempts++;
          logger.info(`Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.options.reconnectInterval);
        }
      };
    } catch (error) {
      logger.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      logger.info('WebSocket disconnected');
    }
  }

  send(type: string, data?: any): void {
    const message = JSON.stringify({ type, data });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      logger.debug('WebSocket message sent:', { type, data });
    } else {
      this.messageQueue.push(message);
      logger.warn('WebSocket not connected, message queued');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let globalWebSocketClient: WebSocketClient | null = null;

export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const optionsRef = useRef(options);

  optionsRef.current = options;

  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new WebSocketClient(url, optionsRef.current);
      clientRef.current.connect();
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [url]);

  const send = useCallback((type: string, data?: any) => {
    clientRef.current?.send(type, data);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const isConnected = clientRef.current?.isConnected() ?? false;

  return {
    send,
    disconnect,
    reconnect,
    isConnected
  };
}

export function getGlobalWebSocketClient(): WebSocketClient | null {
  return globalWebSocketClient;
}

export function initGlobalWebSocket(url: string, options: WebSocketOptions = {}): void {
  if (!globalWebSocketClient) {
    globalWebSocketClient = new WebSocketClient(url, options);
    globalWebSocketClient.connect();
    logger.info('Global WebSocket client initialized');
  }
}

export function closeGlobalWebSocket(): void {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
    globalWebSocketClient = null;
    logger.info('Global WebSocket client closed');
  }
}
