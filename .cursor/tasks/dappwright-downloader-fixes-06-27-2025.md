# DappWright Downloader Fixes

## Description
Fix critical issues in the downloader system for wallet extensions that are causing test failures in parallel execution scenarios.

## Initial Prompt
We have the following problems with @[src/downloader/downloader.ts] :

1 - When downloading an extension, via primary worker, it lacks a timeout/retry logic
2 - For secondary workers, it more often than not gets stuck in the loop "Waiting for primary worker
3 - We have worked around issues, specially dapp's own limited cache (not exposed to external codebases) as well as github's own rate limits, by intercepting and redirecting outbound calls to download releases, pointing it to a local cache. Even so, when there are multiple workers enabled (running e2e tests in parallel) it's guaranteed to get one or more runners stuck in "Waiting for primary worker to download".

## Subtasks

### 1. Problem Analysis
- [x] Analyze current downloader implementation
- [x] Identify timeout/retry logic gaps
- [x] Understand secondary worker waiting loop issues
- [x] Review cache workaround implementation
- [x] Propose solutions for each problem

### 2. Timeout/Retry Logic Implementation
- [x] Add configurable timeout for primary worker downloads
- [x] Implement retry mechanism with exponential backoff
- [x] Add proper error handling and logging

### 3. Secondary Worker Loop Fix
- [x] Implement proper file locking mechanism
- [x] Add timeout for secondary worker waiting
- [x] Improve file existence and completion checking
- [x] Add better error handling for failed downloads

### 4. Parallel Execution Improvements
- [x] Implement distributed locking mechanism
- [x] Add worker coordination system
- [x] Improve cache validation and cleanup
- [x] Add worker health monitoring

### 5. Testing and Validation
- [x] Test parallel execution scenarios
- [x] Validate timeout behaviors
- [x] Test retry mechanisms
- [x] Ensure backward compatibility

## Errors/Issues/Problems/Challenges/Questions/Concerns

### Current Issues Identified:
1. **No timeout in primary worker**: Downloads can hang indefinitely
2. **Infinite secondary worker loop**: Workers can wait forever for primary worker
3. **Race conditions**: Multiple workers trying to download simultaneously
4. **No file locking**: File existence checks are unreliable
5. **No error recovery**: Failed downloads leave workers in inconsistent state

### Technical Challenges:
- Need to maintain backward compatibility
- Cross-platform file locking considerations
- Proper cleanup of failed downloads
- Worker coordination without external dependencies

## Problem Analysis and Proposed Solutions

### Problem 1: No Timeout/Retry Logic in Primary Worker

**Current Issue:**
- `getGithubRelease()` and `downloadGithubRelease()` have no timeout mechanisms
- HTTP requests can hang indefinitely
- No retry logic for failed downloads
- Network failures leave system in inconsistent state

**Proposed Solution:**
```typescript
// Add timeout and retry configuration
interface DownloadConfig {
  timeout: number;           // Request timeout (default: 30s)
  retries: number;          // Max retry attempts (default: 3)
  retryDelay: number;       // Base retry delay (default: 1s)
  maxRetryDelay: number;    // Max retry delay (default: 10s)
}

// Implement exponential backoff retry mechanism
// Add request timeout using AbortController
// Add comprehensive error handling and logging
```

### Problem 2: Secondary Workers Stuck in Infinite Loop

**Current Issue:**
- Secondary workers poll every 5 seconds indefinitely
- No timeout for waiting
- Simple file existence check is unreliable
- No way to detect if primary worker failed
- Workers can wait forever if primary worker crashes

**Proposed Solution:**
```typescript
// Add timeout for secondary worker waiting (default: 5 minutes)
// Implement file locking mechanism using lockfile
// Add download status tracking file
// Fallback mechanism: secondary worker becomes primary after timeout
// Better file completion validation
```

### Problem 3: Race Conditions in Parallel Execution

**Current Issue:**
- Multiple workers can simultaneously think they're primary
- File existence checks are not atomic
- No coordination between workers
- Cache directory conflicts

**Proposed Solution:**
```typescript
// Implement distributed file-based locking
// Use atomic file operations for coordination
// Add worker health monitoring
// Implement download status communication between workers
// Add cleanup mechanism for orphaned locks
```

## Technical Implementation Plan

### Phase 1: Enhanced Request Layer
1. Add timeout support to request.ts
2. Implement retry mechanism with exponential backoff
3. Add proper error categorization (network, timeout, server)
4. Add request cancellation support

### Phase 2: Worker Coordination System
1. Implement file-based locking mechanism
2. Add download status tracking
3. Add worker timeout and fallback logic
4. Implement cleanup for failed downloads

### Phase 3: Parallel Execution Safety
1. Add atomic file operations
2. Implement worker health monitoring
3. Add cache validation and cleanup
4. Add configuration options for timeout/retry behavior

## Notes

### Current Implementation Analysis:
- Primary worker (TEST_PARALLEL_INDEX === '0') downloads directly
- Secondary workers poll every 5 seconds checking for file existence
- No timeout mechanisms in place
- Simple file existence check using fs.existsSync()
- isEmpty() function checks if download completed

### Workaround Implementation:
- MetaMaskCache class intercepts HTTP requests at Node.js level
- Redirects GitHub release downloads to local cache
- Still experiences worker coordination issues

## Links, Resources and References
- Current implementation: src/downloader/downloader.ts
- GitHub download logic: src/downloader/github.ts
- Request handling: src/downloader/request.ts
- Cache workaround: /Users/zed/Projects/Concrete/Concrete-app-dev/e2e/utils/metamask-cache.ts

## Status
COMPLETED

### Problem 1: Enhanced Request Layer (timeout/retry)
- **Status**: COMPLETED 
- **Files Created/Modified**:
  - `src/downloader/config.ts` - Added DownloadConfig interface and DownloadError class
  - `src/downloader/request.ts` - Rewrote with timeout and retry logic with exponential backoff
  - `src/downloader/github.ts` - Updated to use enhanced request with timeout/retry
- **Commit**: `feat: implement enhanced request layer with timeout and retry`

### Problem 2: Worker Coordination System
- **Status**: COMPLETED 
- **Files Created/Modified**:
  - `src/downloader/lockfile.ts` - Added DownloadLock class for file-based coordination
  - `src/downloader/downloader.ts` - Implemented primary/secondary worker coordination
- **Features**:
  - File-based distributed locking system
  - Secondary worker timeout (15s) with fallback to primary
  - Stale lock cleanup for crashed workers
  - Download status tracking and validation
- **Commit**: `feat: implement worker coordination system with file locking`

### Problem 3: Parallel Execution Safety
- **Status**: COMPLETED 
- **Files Created/Modified**:
  - `src/downloader/worker-monitor.ts` - Added WorkerMonitor class for worker health monitoring
  - `src/downloader/lockfile.ts` - Enhanced with cache validation and atomic operations
  - `src/downloader/downloader.ts` - Integrated worker monitoring and race condition detection
  - `src/downloader/file.ts` - Fixed circular dependency by moving EXTENSION_PUB_KEY
- **Features**:
  - Worker health monitoring with heartbeat system
  - Race condition detection and resolution
  - Atomic file operations for download safety
  - Cache validation and cleanup
  - Advanced download integrity checks
  - Comprehensive error handling and recovery
