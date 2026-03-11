## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.

## 2026-02-26 - Unhandled Exceptions / Stack Trace Leakage in Data Decoding
**Vulnerability:** The application was catching exceptions from `atob` and `JSON.parse` but then blindly passing the entire `Error` object to `console.error`.
**Learning:** `console.error(..., error)` leaks raw stack traces and internal application structures to the environment. If logging aggregators index these, or if a user opens the console, sensitive info could be exposed. Additionally, `atob` throws a DOMException `InvalidCharacterError` on invalid base64, which should be explicitly handled.
**Prevention:** Avoid logging the raw `error` object directly in production, especially for data parsing logic. Instead, log a generic and safe description of the failure (e.g. `console.error("Failed to parse JSON from share code")`). Also, encapsulate operations that can throw (`atob`, `JSON.parse`) in their own granular `try...catch` blocks so they fail gracefully instead of crashing higher-level logic.
