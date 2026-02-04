import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

let isMetricsPaused = false;
let testProcess = null;
let testProcessId = null;
let isTestProcessStarting = false;
let lastProcessStartTime = 0;
let processOperationInProgress = false;
let toggleOperationCount = 0;
let cachedTestResults = {
  passed: 0,
  failed: 0,
  total: 0,
  error: null,
  failedTests: [],
};

function killOrphanedProcesses() {
  if (process.platform === "win32") {
    try {
      exec(
        'taskkill /F /IM node.exe /FI "WINDOWTITLE eq vitest*"',
        (error, stdout, stderr) => {}
      );
    } catch (error) {}
  }
}

function safeKillTestProcess() {
  if (processOperationInProgress) return false;

  processOperationInProgress = true;

  try {
    if (testProcess) {
      try {
        testProcess.kill("SIGKILL");
      } catch (error) {}
    }

    if (testProcessId) {
      try {
        if (process.platform === "win32") {
          exec(
            `taskkill /F /PID ${testProcessId}`,
            (error, stdout, stderr) => {}
          );
        } else {
          exec(`kill -9 ${testProcessId}`, (error, stdout, stderr) => {});
        }
      } catch (error) {}
    }

    killOrphanedProcesses();

    testProcess = null;
    testProcessId = null;

    return true;
  } finally {
    processOperationInProgress = false;
  }
}

function startTestWatcher() {
  if (processOperationInProgress) return;
  processOperationInProgress = true;

  try {
    if (testProcess || isTestProcessStarting) {
      return;
    }

    const now = Date.now();
    if (now - lastProcessStartTime < 5000) {
      return;
    }

    safeKillTestProcess();

    isTestProcessStarting = true;
    lastProcessStartTime = now;

    const vitest = process.platform === "win32" ? "npx.cmd" : "npx";
    const args = ["vitest", "run", "--reporter=json"];

    try {
      testProcess = spawn(vitest, args, {
        cwd: path.resolve(__dirname, ".."),
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
        windowsHide: false,
        detached: false,
      });

      if (testProcess && testProcess.pid) {
        testProcessId = testProcess.pid;
      }

      let buffer = "";

      testProcess.stdout.on("data", (data) => {
        buffer += data.toString();

        let startIndex = buffer.indexOf("{");
        let endIndex = buffer.lastIndexOf("}");

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
          try {
            const jsonStr = buffer.slice(startIndex, endIndex + 1);
            const results = JSON.parse(jsonStr);

            if (results.numTotalTests !== undefined) {
              const failedTests = [];
              if (results.testResults) {
                for (const suite of results.testResults) {
                  if (suite.assertionResults) {
                    const failed = suite.assertionResults
                      .filter((test) => test.status === "failed")
                      .map((test) => ({
                        name: `${suite.name}: ${test.title}`,
                        file: suite.name,
                      }));
                    failedTests.push(...failed);
                  }
                }
              }

              cachedTestResults = {
                passed: results.numPassedTests || 0,
                failed: results.numFailedTests || 0,
                total: results.numTotalTests || 0,
                error: null,
                failedTests,
              };
            }
          } catch (e) {}
          buffer = buffer.slice(endIndex + 1);
        }
      });

      testProcess.stderr.on("data", (data) => {});

      testProcess.on("error", (error) => {
        //  console.error("Test watcher error:", error);
        cachedTestResults.error = "Test watcher error";
        testProcess = null;
        testProcessId = null;
        isTestProcessStarting = false;
      });

      testProcess.on("close", (code, signal) => {
        testProcess = null;
        testProcessId = null;
        isTestProcessStarting = false;

        setTimeout(() => {
          if (!isMetricsPaused && !processOperationInProgress) {
            startTestWatcher();
          }
        }, 10000);
      });
    } catch (error) {
      testProcess = null;
      testProcessId = null;
      isTestProcessStarting = false;
    }
  } finally {
    processOperationInProgress = false;

    setTimeout(() => {
      isTestProcessStarting = false;
    }, 2000);
  }
}

async function runTests() {
  if (isMetricsPaused) {
    return Promise.resolve(cachedTestResults);
  }

  if (!testProcess && !isTestProcessStarting && !processOperationInProgress) {
    startTestWatcher();
  }

  return Promise.resolve(cachedTestResults);
}

const EXCLUDED_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "build",
  "coverage",
  ".next",
  ".cache",
  ".vscode",
  "public",
  "do-not-touch",
]);

const TEST_FILE_PATTERNS = [/\.test\.[jt]sx?$/, /__tests__\//];

const NON_CODE_TEST_PATTERNS = [/setupTests\.ts$/, /vitest\.config\.ts$/];

const EXCLUDED_FILES = new Set([
  ".gitignore",
  "package.json",
  "package-lock.json",
  "README.md",
  "workshop.md",
  "vite.config.ts",
  "vite-env.d.ts",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "setupTests.ts",
  "vitest.config.ts",
  "eslint.config.js",
  "tsconfig.json",
  "index.html",
  "useCodeMetrics.ts",
  "CodeMetrics.css",
  "CodeMetrics.tsx",
  "initialNotes.ts",
]);

function countTestCases(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const testCaseMatches = content.match(/\b(it|test)\s*\(/g);
    return testCaseMatches ? testCaseMatches.length : 0;
  } catch (error) {
    return 0;
  }
}

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const codeLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*")
      );
    });
    return codeLines.length;
  } catch (error) {
    return 0;
  }
}

function countAllTestCases(dirPath) {
  let totalTests = 0;
  let testFiles = [];

  function scanForTests(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        if (!EXCLUDED_DIRS.has(item)) {
          scanForTests(fullPath);
        }
      } else {
        const relativePath = path.relative(dirPath, fullPath);

        if (
          TEST_FILE_PATTERNS.some((pattern) => pattern.test(relativePath)) &&
          !NON_CODE_TEST_PATTERNS.some((pattern) => pattern.test(relativePath))
        ) {
          const testCount = countTestCases(fullPath);
          totalTests += testCount;
          testFiles.push({
            path: relativePath,
            count: testCount,
          });
        }
      }
    }
  }

  scanForTests(dirPath);
  return { totalTests, testFiles };
}

function getFileStats(dirPath) {
  let stats = {
    totalLines: 0,
    tsxFiles: 0,
    tsFiles: 0,
    cssFiles: 0,
    testFiles: 0,
    testResults: {
      passed: 0,
      failed: 0,
      total: 0,
    },
  };

  function processDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        if (!EXCLUDED_DIRS.has(item)) {
          processDirectory(fullPath);
        }
      } else {
        const basename = path.basename(fullPath);
        if (EXCLUDED_FILES.has(basename)) {
          continue;
        }

        const relativePath = path.relative(dirPath, fullPath);
        const ext = path.extname(fullPath);

        if (
          TEST_FILE_PATTERNS.some((pattern) => pattern.test(relativePath)) &&
          !NON_CODE_TEST_PATTERNS.some((pattern) => pattern.test(relativePath))
        ) {
          stats.testFiles++;
          continue;
        }

        const lines = countLinesInFile(fullPath);

        if (ext === ".tsx" || ext === ".ts" || ext === ".css") {
          stats.totalLines += lines;
        }

        if (ext === ".tsx") {
          stats.tsxFiles++;
        } else if (ext === ".ts") {
          stats.tsFiles++;
        } else if (ext === ".css") {
          stats.cssFiles++;
        }
      }
    }
  }

  processDirectory(dirPath);
  return stats;
}

app.get("/api/code-metrics", async (req, res) => {
  try {
    toggleOperationCount++;
    const currentToggleCount = toggleOperationCount;

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (currentToggleCount !== toggleOperationCount) {
      return res.json({
        skipped: true,
        isPaused: isMetricsPaused,
      });
    }

    const pauseRequested = req.query.paused === "true";

    const isStateChange = isMetricsPaused !== pauseRequested;

    isMetricsPaused = pauseRequested;

    if (isMetricsPaused) {
      safeKillTestProcess();

      // Get the actual metrics even when paused
      const projectRoot = path.resolve(__dirname, "..");
      const stats = getFileStats(projectRoot);

      stats.testResults = cachedTestResults;
      stats.isPaused = true;

      return res.json(stats);
    }

    if (isStateChange && !isMetricsPaused && !processOperationInProgress) {
      setTimeout(() => {
        if (
          !isMetricsPaused &&
          !testProcess &&
          !isTestProcessStarting &&
          !processOperationInProgress
        ) {
          startTestWatcher();
        }
      }, 2000);
    }

    const projectRoot = path.resolve(__dirname, "..");
    const stats = getFileStats(projectRoot);

    const { totalTests } = countAllTestCases(projectRoot);

    const testResults = await runTests();

    if (testResults.total < totalTests) {
      testResults.total = totalTests;
    }

    stats.testResults = testResults;
    stats.testResults.expectedTotal = totalTests;

    res.json(stats);
  } catch (error) {
    console.error("Error getting code metrics:", error);
    res.status(500).json({
      error: "Failed to get code metrics",
      totalLines: 0,
      tsxFiles: 0,
      tsFiles: 0,
      cssFiles: 0,
      testResults: {
        passed: 0,
        failed: 0,
        total: 0,
        error: "Server error",
      },
    });
  }
});

app.listen(PORT, () => {
  killOrphanedProcesses();

  setInterval(() => {
    if (isMetricsPaused) {
      safeKillTestProcess();
    }

    if (testProcess && testProcessId && testProcess.exitCode !== null) {
      testProcess = null;
      testProcessId = null;
      isTestProcessStarting = false;
    }
  }, 30000);
});
