## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.

## 2026-03-17 - Prevent Persistent Client-Side DoS via Local Storage
**Vulnerability:** Client-Side DoS via Malformed Local Storage. The application parsed `localStorage` data using `JSON.parse` on startup without a `try...catch` block. If `localStorage` contained invalid JSON, the application crashed immediately.
**Learning:** Persistent storage (`localStorage`, `sessionStorage`, `IndexedDB`) can be modified directly by the user or corrupted. Relying on its integrity without fallback mechanisms allows for persistent Denial of Service that the user cannot recover from without clearing browser data.
**Prevention:** Always wrap `JSON.parse` calls accessing persistent storage in a `try...catch` block. Fall back gracefully to default application states when parsing fails, and log the incident defensively.