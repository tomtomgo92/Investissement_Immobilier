## 2026-02-25 - Validate Shared Simulation Data
**Vulnerability:** Missing Input Validation in Shared URL Decoding. The application parsed arbitrary JSON from URL fragments (`window.location.hash`) and hydrated state directly without structural validation, leading to potential DoS or logic errors.
**Learning:** Client-side hydration from URLs is an often-overlooked attack surface. `JSON.parse` is not sufficient validation. Even without direct execution, malformed data can cause crashes or unexpected application states.
**Prevention:** Implement strict schema validation (checking types and required fields) for all external inputs before using them in application state.
## 2026-02-28 - [btoa/atob non-ASCII crash]
**Vulnerability:** btoa and atob crash with DOMException when attempting to base64 encode/decode strings containing non-ASCII characters (emojis, accents) in the shared state logic (src/utils/share.js).
**Learning:** The built-in browser btoa/atob functions are strictly designed for 8-bit strings (ASCII/binary) and cannot natively handle multibyte UTF-8 characters resulting from JSON.stringify().
**Prevention:** Always wrap the string in encodeURIComponent before btoa(), and decodeURIComponent after atob() to properly serialize/deserialize UTF-8 characters safely for base64 transport.
