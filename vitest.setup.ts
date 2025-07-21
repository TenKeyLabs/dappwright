import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach } from 'vitest';

// Global test setup
beforeEach(() => {
  // Clean up any existing test directories before each test
  cleanupTestDirectories();
});

afterEach(() => {
  // Clean up after each test
  cleanupTestDirectories();
});

function cleanupTestDirectories(): void {
  const testDir = path.join(os.tmpdir(), 'dappwright-test');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
