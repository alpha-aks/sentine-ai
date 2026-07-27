# Developer Notes — Candidate Portal Module

## Technical Principles

1. **Local State & Security**:
   - Live test runner state (current index, answers, marked items, timer, violations) is managed by Zustand (`store/candidate-store.ts`).
   - Browser focus (`blur` event) and full-screen state (`fullscreenchange` event) automatically log violations to `sessionService.reportViolation()`.

2. **Heartbeat Loop**:
   - A periodic 10-second heartbeat sends ping latency and window focus data to `sessionService.recordHeartbeat()`.

3. **Defensive API Client**:
   - Fail-safe response handling ensures fallback data structures if microservices return partial payloads.
