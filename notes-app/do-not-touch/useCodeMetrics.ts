import { useEffect, useState } from "react";

const metricsState = {
  isPaused: false,
  isToggling: false,
  lastToggleTime: 0,
  pendingRequestCount: 0,
  togglePause: () => {
    const now = Date.now();
    if (metricsState.isToggling || now - metricsState.lastToggleTime < 3000) {
      return metricsState.isPaused;
    }

    metricsState.isToggling = true;
    metricsState.lastToggleTime = now;

    metricsState.isPaused = !metricsState.isPaused;

    setTimeout(() => {
      metricsState.isToggling = false;
    }, 3000);

    return metricsState.isPaused;
  },
  getPauseState: () => metricsState.isPaused,
};

interface CodeMetrics {
  totalLines: number;
  tsxFiles: number;
  tsFiles: number;
  cssFiles: number;
  testResults?: {
    passed: number;
    failed: number;
    total: number;
    expectedTotal?: number;
    failedTests?: Array<{
      name: string;
      file: string;
    }>;
  };
}

const calculateCodeMetrics = async (
  paused: boolean = false
): Promise<CodeMetrics> => {
  try {
    const response = await fetch(`/api/code-metrics?paused=${paused}`);
    const metrics = await response.json();
    return metrics;
  } catch (error) {
    console.error("Error fetching code metrics:", error);
    return {
      totalLines: 0,
      tsxFiles: 0,
      tsFiles: 0,
      cssFiles: 0,
    };
  }
};

export const useCodeMetrics = () => {
  const [metrics, setMetrics] = useState<CodeMetrics>({
    totalLines: 0,
    tsxFiles: 0,
    tsFiles: 0,
    cssFiles: 0,
  });
  const [isPaused, setIsPaused] = useState(metricsState.getPauseState());

  useEffect(() => {
    const fetchMetrics = async () => {
      const isPaused = metricsState.getPauseState();
      const newMetrics = await calculateCodeMetrics(isPaused);
      setMetrics(newMetrics);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);

    return () => clearInterval(interval);
  }, []);

  // Add a function to toggle the pause state
  const togglePause = () => {
    const newPausedState = metricsState.togglePause();
    setIsPaused(newPausedState);

    if (metricsState.getPauseState() === newPausedState) {
      metricsState.pendingRequestCount++;

      const thisRequestId = metricsState.pendingRequestCount;

      setTimeout(() => {
        if (thisRequestId === metricsState.pendingRequestCount) {
          calculateCodeMetrics(newPausedState);
        }
      }, 100);
    }

    return newPausedState;
  };

  return {
    ...metrics,
    isPaused,
    togglePause,
  };
};
