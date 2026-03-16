## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.

## 2024-03-16 - Prevent Unhandled JSON.parse Exceptions in App State Bootstrapping
**Vulnerability:** The application reads from `localStorage` directly into `JSON.parse` during state initialization without wrapping it in a try-catch block. An attacker or a bug could poison `localStorage` with malformed JSON, causing a synchronous uncaught exception on load that effectively bricks the application for the user (Persistent DoS) until they manually clear their site data.
**Learning:** Even though `localStorage` is isolated per origin and generally requires local access or XSS to exploit, bugs in serialization logic or extensions can easily corrupt it. Relying on its data without safety wrappers breaks the resilience of the application initialization process.
**Prevention:** Always wrap `JSON.parse` operations that process externally sourced or persistent data in a `try...catch` block. Ensure the catch block logs the error defensively and falls back to a safe default state, preserving user access to the app.
