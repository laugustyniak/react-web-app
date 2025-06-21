// Performance monitoring utilities
import React from 'react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private activeTimers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  start(name: string): void {
    this.activeTimers.set(name, performance.now());
  }

  // End timing and record metric
  end(name: string): number | null {
    const startTime = this.activeTimers.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.activeTimers.delete(name);

    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // Get metrics for a specific operation
  getMetricsFor(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
    this.activeTimers.clear();
  }

  // Get average duration for an operation
  getAverageDuration(name: string): number {
    const operationMetrics = this.getMetricsFor(name);
    if (operationMetrics.length === 0) return 0;

    const total = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / operationMetrics.length;
  }
}

// Performance decorator for functions
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.start(name);
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        monitor.end(name);
      }
    };

    return descriptor;
  };
}

// Hook for measuring React component render performance
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.start(`${componentName}-render`);
    return () => {
      monitor.end(`${componentName}-render`);
    };
  });

  return {
    startMeasurement: (name: string) => monitor.start(name),
    endMeasurement: (name: string) => monitor.end(name),
    getMetrics: () => monitor.getMetricsFor(componentName)
  };
}

// Utility to measure Web Vitals
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Measure LCP (Largest Contentful Paint)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Measure FID (First Input Delay)
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const fidEntry = entry as any;
      console.log('FID:', fidEntry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ['first-input'] });

  // Measure CLS (Cumulative Layout Shift)
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      const clsEntry = entry as any;
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value;
      }
    }
    console.log('CLS:', clsValue);
  }).observe({ entryTypes: ['layout-shift'] });
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();