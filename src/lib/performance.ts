/**
 * @file performance.ts
 * @description Performance Monitoring System - نظام مراقبة الأداء
 */

type MetricType = 'fps' | 'loadTime' | 'renderTime' | 'memory' | 'network';

interface Metric {
  type: MetricType;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  slowThreshold: {
    renderTime: number;
    loadTime: number;
    fps: number;
  };
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: Metric[] = [];
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private fps: number = 60;
  private frameCount = 0;
  private lastFpsUpdateTime: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1000,
      maxMetrics: 1000,
      slowThreshold: {
        renderTime: 16.67,
        loadTime: 3000,
        fps: 30,
      },
      ...config,
    };
  }

  recordMetric(type: MetricType, value: number, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) {
      return;
    }

    const metric: Metric = {
      type,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    this.checkSlowPerformance(metric);
  }

  startFPSMonitoring(): void {
    if (!this.config.enabled) {
      return;
    }

    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdateTime = performance.now();

    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      this.frameCount++;

      if (now - this.lastFpsUpdateTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime));
        this.recordMetric('fps', this.fps);
        this.frameCount = 0;
        this.lastFpsUpdateTime = now;
      }

      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stopFPSMonitoring(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  measureLoadTime(callback: () => void): void {
    if (!this.config.enabled) {
      return callback();
    }

    const startTime = performance.now();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          this.recordMetric('loadTime', loadTime);
          callback();
        });
      });
    });
  }

  measureRenderTime<T>(name: string, renderFn: () => T): T {
    if (!this.config.enabled) {
      return renderFn();
    }

    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    this.recordMetric('renderTime', renderTime, { name });
    return result;
  }

  measureMemoryUsage(): void {
    if (!this.config.enabled || !(performance as any).memory) {
      return;
    }

    const memory = (performance as any).memory;
    this.recordMetric('memory', memory.usedJSHeapSize / 1024 / 1024, {
      total: memory.totalJSHeapSize / 1024 / 1024,
      limit: memory.jsHeapSizeLimit / 1024 / 1024,
    });
  }

  measureNetworkPerformance(): void {
    if (!this.config.enabled) {
      return;
    }

    const nav = navigator as unknown as { connection?: { downlink?: number; effectiveType?: string; rtt?: number; saveData?: boolean } };

    if (!nav.connection) {
      return;
    }

    const connection = nav.connection;
    this.recordMetric('network', connection.downlink || 0, {
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData,
    });
  }

  private checkSlowPerformance(metric: Metric): void {
    const { slowThreshold } = this.config;

    const valueNum = metric.value as number;
    const isSlowRender = metric.type === 'renderTime' && valueNum > slowThreshold.renderTime;
    const isSlowLoad = metric.type === 'loadTime' && valueNum > slowThreshold.loadTime;
    const isLowFPS = metric.type === 'fps' && valueNum < slowThreshold.fps;

    if (isSlowRender || isSlowLoad || isLowFPS) {
      console.warn(`Performance Warning: ${metric.type} = ${valueNum.toFixed(2)}`, metric);
    }
  }

  getStats(): {
    averageFPS: number;
    averageRenderTime: number;
    averageLoadTime: number;
    slowRenderCount: number;
    slowLoadCount: number;
    lowFPSCount: number;
  } {
    const fpsMetrics = this.metrics.filter(m => m.type === 'fps');
    const renderMetrics = this.metrics.filter(m => m.type === 'renderTime');
    const loadMetrics = this.metrics.filter(m => m.type === 'loadTime');

    const averageFPS = this.average(fpsMetrics.map(m => m.value));
    const averageRenderTime = this.average(renderMetrics.map(m => m.value));
    const averageLoadTime = this.average(loadMetrics.map(m => m.value));

    const slowRenderCount = renderMetrics.filter(m => m.value > this.config.slowThreshold.renderTime).length;
    const slowLoadCount = loadMetrics.filter(m => m.value > this.config.slowThreshold.loadTime).length;
    const lowFPSCount = fpsMetrics.filter(m => m.value < this.config.slowThreshold.fps).length;

    return {
      averageFPS,
      averageRenderTime,
      averageLoadTime,
      slowRenderCount,
      slowLoadCount,
      lowFPSCount,
    };
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.startFPSMonitoring();
    } else {
      this.stopFPSMonitoring();
    }
  }
}

let monitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    const isProduction = import.meta.env.PROD;
    monitorInstance = new PerformanceMonitor({
      enabled: !isProduction,
      sampleRate: 1000,
      maxMetrics: 500,
    });
  }
  return monitorInstance;
}

export function initPerformanceMonitoring(): void {
  const monitor = getPerformanceMonitor();
  monitor.startFPSMonitoring();

  window.addEventListener('load', () => {
    monitor.measureLoadTime(() => {
      console.log('Page load time measured');
    });
  });

  setInterval(() => {
    monitor.measureMemoryUsage();
    monitor.measureNetworkPerformance();
  }, 30000);
}

export function stopPerformanceMonitoring(): void {
  const monitor = getPerformanceMonitor();
  monitor.stopFPSMonitoring();
}

export function getPerformanceStats() {
  return getPerformanceMonitor().getStats();
}

export function usePerformanceMonitor(componentName: string) {
  const monitor = getPerformanceMonitor();

  return {
    measureRender: <T>(renderFn: () => T) => {
      return monitor.measureRenderTime(componentName, renderFn);
    },
    measureCallback: <T extends (...args: unknown[]) => unknown>(
      callback: T,
      ...args: Parameters<T>
    ) => {
      const startTime = performance.now();
      const result = callback(...args);
      const endTime = performance.now();
      monitor.recordMetric('renderTime', endTime - startTime, {
        name: `${componentName}_callback`,
      });
      return result;
    },
  };
}

export type { Metric, MetricType, PerformanceConfig };
export { PerformanceMonitor as default };
