## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.
## 2024-05-24 - Persistent Client-Side DoS via unhandled JSON.parse
**Vulnerability:** Unhandled `JSON.parse` on external/persistent data (`localStorage.getItem('invest_simulations')`) could cause a persistent client-side Denial of Service if the data becomes malformed, as the app would crash during initialization on every reload.
**Learning:** `localStorage` is outside the strict control of the application logic. Other scripts, extensions, or bugs can corrupt this data. Failing to handle `JSON.parse` exceptions on state initialization creates a fragile app state that requires manual user intervention (clearing site data) to recover.
**Prevention:** Always wrap `JSON.parse` operations that process externally sourced or persistent data in a `try...catch` block. Ensure the catch block logs the error defensively and falls back to a safe default state.
