import { useState, useEffect } from "react";
import { useCodeMetrics } from "./useCodeMetrics";
import "./CodeMetrics.css";

const playIconUrl = "/images/play-icon.svg";
const pauseIconUrl = "/images/pause-icon.svg";

const INITIAL_LINES = 1900;
const MEDAL_THRESHOLDS = {
  bronze: 1700,
  silver: 1600,
  gold: 1500,
  diamond: 1450,
};

const MEDAL_POSITIONS = {
  noMedal: 1,
  bronze: 90,
  silver: 250,
  gold: 410,
  diamond: 500,
};

export const CodeMetrics = () => {
  const [visible, setVisible] = useState(true);
  const [prevMedal, setPrevMedal] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastActiveMetrics, setLastActiveMetrics] = useState({
    totalLines: INITIAL_LINES,
    medal: "No Medal yet",
    progress: 0,
    testResults: {
      passed: 0,
      total: 0,
      expectedTotal: 0,
      failedTests: [] as { name: string; file: string }[],
    },
  });
  const metrics = useCodeMetrics();

  const calculateProgress = () => {
    if (
      metrics.isPaused ||
      (!metrics.isPaused &&
        metrics.totalLines === 0 &&
        lastActiveMetrics.totalLines > 0)
    ) {
      return lastActiveMetrics.progress;
    }

    const lines = metrics.totalLines;

    if (lines > INITIAL_LINES) return 0;
    if (lines <= MEDAL_THRESHOLDS.diamond) return 100;

    let progressPercentage;

    if (lines <= MEDAL_THRESHOLDS.gold) {
      const range = MEDAL_THRESHOLDS.gold - MEDAL_THRESHOLDS.diamond;
      const currentProgress = lines - MEDAL_THRESHOLDS.diamond;
      const percentage = 1 - currentProgress / range;
      progressPercentage = 75 + percentage * 25;
    } else if (lines <= MEDAL_THRESHOLDS.silver) {
      const range = MEDAL_THRESHOLDS.silver - MEDAL_THRESHOLDS.gold;
      const currentProgress = lines - MEDAL_THRESHOLDS.gold;
      const percentage = 1 - currentProgress / range;
      progressPercentage = 50 + percentage * 25;
    } else if (lines <= MEDAL_THRESHOLDS.bronze) {
      const range = MEDAL_THRESHOLDS.bronze - MEDAL_THRESHOLDS.silver;
      const currentProgress = lines - MEDAL_THRESHOLDS.silver;
      const percentage = 1 - currentProgress / range;
      progressPercentage = 25 + percentage * 25;
    } else {
      const range = INITIAL_LINES - MEDAL_THRESHOLDS.bronze;
      const currentProgress = INITIAL_LINES - lines;
      const percentage = currentProgress / range;
      progressPercentage = percentage * 25;
    }

    return Math.max(0, Math.min(100, Math.floor(progressPercentage)));
  };

  const getMedalStatus = () => {
    if (
      metrics.isPaused ||
      (!metrics.isPaused &&
        metrics.totalLines === 0 &&
        lastActiveMetrics.totalLines > 0)
    ) {
      return lastActiveMetrics.medal;
    }

    const lines = metrics.totalLines;
    if (lines <= MEDAL_THRESHOLDS.diamond) return "Diamond";
    if (lines <= MEDAL_THRESHOLDS.gold) return "Gold";
    if (lines <= MEDAL_THRESHOLDS.silver) return "Silver";
    if (lines <= MEDAL_THRESHOLDS.bronze) return "Bronze";
    return "No Medal yet";
  };

  const progress = calculateProgress();
  const medal = getMedalStatus();

  useEffect(() => {
    if (!metrics.isPaused && metrics.totalLines > 0) {
      const savedTestResults = metrics.testResults
        ? {
            passed: metrics.testResults.passed,
            total: metrics.testResults.total,
            expectedTotal:
              metrics.testResults.expectedTotal || metrics.testResults.total,
            failedTests: metrics.testResults.failedTests || [],
          }
        : {
            passed: 0,
            total: 0,
            expectedTotal: 0,
            failedTests: [],
          };

      setLastActiveMetrics({
        totalLines: metrics.totalLines,
        medal: medal,
        progress: progress,
        testResults: savedTestResults,
      });
    }
  }, [
    metrics.totalLines,
    metrics.isPaused,
    medal,
    progress,
    metrics.testResults,
  ]);

  useEffect(() => {
    if (prevMedal && prevMedal !== medal && medal !== "No Medal yet") {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
    setPrevMedal(medal);
  }, [medal, prevMedal]);

  const getMedal = (medal: string) => {
    if (medal === "Diamond") return "🎖️";
    if (medal === "Gold") return "🥇";
    if (medal === "Silver") return "🥈";
    if (medal === "Bronze") return "🥉";
    return "🥉";
  };

  const buttonIcon = () => {
    if (visible) {
      return "✖";
    } else {
      if (metrics.testResults && metrics.testResults.failed > 0) {
        return <span style={{ color: "#ff3624ff", fontSize: "22px" }}>!</span>;
      } else {
        return getMedal(medal);
      }
    }
  };

  return (
    <>
      <button
        className={
          medal === "No Medal yet"
            ? "metrics-toggle-btn no-medal"
            : `metrics-toggle-btn ${medal.toLowerCase()}`
        }
        title={visible ? "Hide code metrics" : "Show code metrics"}
        onClick={() => setVisible((v) => !v)}
      >
        {buttonIcon()}
      </button>
      {visible && (
        <div
          className={`code-metrics ${metrics.isPaused ? "metrics-paused" : ""}`}
        >
          {(() => {
            const isPaused = metrics.isPaused;
            const isTransitioning =
              metrics.totalLines === 0 && lastActiveMetrics.totalLines > 0;

            let statusText = "";
            let overlayClass = "";

            if (isPaused) {
              statusText = "Metrics paused";
              overlayClass = "metrics-paused-overlay";
            } else if (isTransitioning && !isPaused) {
              statusText = "Metrics starting";
              overlayClass = "metrics-running-overlay";
            } else if (isTransitioning && isPaused) {
              statusText = "Metrics stopping";
              overlayClass = "metrics-paused-overlay";
            } else {
              statusText = "Metrics running";
              overlayClass = "metrics-running-overlay";
            }

            return <div className={overlayClass}>{statusText}</div>;
          })()}
          <div className="metrics-title">
            <span>Refactoring progress</span>
            <div className="metrics-controls">
              <button
                className="metrics-pause-btn"
                title={metrics.isPaused ? "Resume metrics" : "Pause metrics"}
                onClick={(e) => {
                  const button = e.currentTarget;
                  button.disabled = true;
                  metrics.togglePause();

                  button.style.opacity = "0.5";
                  button.style.cursor = "not-allowed";

                  setTimeout(() => {
                    button.disabled = false;
                    button.style.opacity = "";
                    button.style.cursor = "";
                  }, 3000);
                }}
              >
                <img
                  src={metrics.isPaused ? playIconUrl : pauseIconUrl}
                  alt={metrics.isPaused ? "Play" : "Pause"}
                  className="pause-play-icon"
                />
              </button>
            </div>
          </div>

          <div className="xp-progress">
            <div className="progress-label">
              <span
                className={
                  medal === "No Medal yet" ? "no-medal" : medal.toLowerCase()
                }
              >
                Active medal: {medal} {getMedal(medal)}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="progress-targets">
              <div
                className={`target-column${
                  medal === "No Medal yet" ? " active" : ""
                }${
                  showCelebration && medal === "No Medal yet"
                    ? " celebrating"
                    : ""
                }`}
                style={{ gridColumn: `${MEDAL_POSITIONS.noMedal} / span 20` }}
              >
                <span className="target no-medal">🥉 No medal</span>
                <span className="threshold">{">"}1700</span>
              </div>
              <div
                className={`target-column${
                  medal === "Bronze" ? " active" : ""
                }${
                  showCelebration && medal === "Bronze" ? " celebrating" : ""
                }`}
                style={{ gridColumn: `${MEDAL_POSITIONS.bronze} / span 20` }}
              >
                <span className="target bronze">🥉 Bronze</span>
                <span className="threshold">{MEDAL_THRESHOLDS.bronze}</span>
              </div>
              <div
                className={`target-column${
                  medal === "Silver" ? " active" : ""
                }${
                  showCelebration && medal === "Silver" ? " celebrating" : ""
                }`}
                style={{ gridColumn: `${MEDAL_POSITIONS.silver} / span 20` }}
              >
                <span className="target silver">🥈 Silver</span>
                <span className="threshold">{MEDAL_THRESHOLDS.silver}</span>
              </div>
              <div
                className={`target-column${medal === "Gold" ? " active" : ""}${
                  showCelebration && medal === "Gold" ? " celebrating" : ""
                } gold-target`}
                style={{ gridColumn: `${MEDAL_POSITIONS.gold} / span 20` }}
              >
                <span className="target gold">🥇 Gold</span>
                <span className="threshold">{MEDAL_THRESHOLDS.gold}</span>
              </div>
              <div
                className={`target-column${
                  medal === "Diamond" ? " active" : ""
                }${
                  showCelebration && medal === "Diamond" ? " celebrating" : ""
                } diamond-target`}
                style={{ gridColumn: `${MEDAL_POSITIONS.diamond} / span 20` }}
              >
                <span className="target diamond">🎖️ Diamond</span>
                <span className="threshold">{MEDAL_THRESHOLDS.diamond}</span>
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-value">
                {metrics.isPaused ||
                (!metrics.isPaused &&
                  metrics.totalLines === 0 &&
                  lastActiveMetrics.totalLines > 0)
                  ? lastActiveMetrics.totalLines
                  : metrics.totalLines}
              </span>
              <span className="metric-label">Total Lines</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{metrics.tsxFiles}</span>
              <span className="metric-label">TSX Files</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{metrics.tsFiles}</span>
              <span className="metric-label">TS Files</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{metrics.cssFiles}</span>
              <span className="metric-label">CSS Files</span>
            </div>
            {metrics.testResults && (
              <>
                <div className="metric-item test-results">
                  <span
                    className="metric-value"
                    style={{
                      color:
                        metrics.testResults?.failed > 0
                          ? "#f00000ff"
                          : "#87d929ff",
                    }}
                  >
                    {metrics.isPaused ||
                    (!metrics.isPaused &&
                      metrics.totalLines === 0 &&
                      lastActiveMetrics.totalLines > 0)
                      ? `${lastActiveMetrics.testResults.passed}/${
                          lastActiveMetrics.testResults.expectedTotal ||
                          lastActiveMetrics.testResults.total
                        }`
                      : `${metrics.testResults.passed}/
                    ${
                      metrics.testResults.expectedTotal ||
                      metrics.testResults.total
                    }`}
                  </span>
                  <span className="metric-label">Tests Passing</span>
                </div>
                {(metrics.isPaused ||
                (!metrics.isPaused &&
                  metrics.totalLines === 0 &&
                  lastActiveMetrics.totalLines > 0)
                  ? lastActiveMetrics.testResults.failedTests
                  : metrics.testResults?.failedTests) &&
                  (metrics.isPaused ||
                  (!metrics.isPaused &&
                    metrics.totalLines === 0 &&
                    lastActiveMetrics.totalLines > 0)
                    ? lastActiveMetrics.testResults.failedTests?.length || 0
                    : metrics.testResults?.failedTests?.length || 0) > 0 && (
                    <div className="failed-tests-container">
                      <h3 className="failed-tests-header">Failed Tests</h3>
                      <div className="failed-tests-tip">
                        Run the command: <code>npm run test</code> in the root
                        of the project to see details of failed tests.
                      </div>
                      <div className="failed-tests-list">
                        {(metrics.isPaused ||
                        (!metrics.isPaused &&
                          metrics.totalLines === 0 &&
                          lastActiveMetrics.totalLines > 0)
                          ? lastActiveMetrics.testResults.failedTests
                          : metrics.testResults?.failedTests || []
                        )?.map(
                          (
                            test: { name: string; file: string },
                            index: number
                          ) => {
                            const fileName = test.file.split("/").pop() || "";
                            const testName = test.name.split(": ").pop() || "";

                            return (
                              <div key={index} className="failed-test-item">
                                <div className="failed-test-name">
                                  {testName}
                                </div>
                                <div className="failed-test-file">
                                  {fileName}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
