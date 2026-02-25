## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.
