## 2024-05-15 - Absolute Positioned Adornments Inside Inputs
**Learning:** Found that absolute positioned visual adornments (like a '€' suffix or an icon) inside inputs were intercepting mouse clicks and blocking input focus. Furthermore, they were not hidden from screen readers, adding redundant information.
**Action:** When adding absolute positioned visual adornments, always include `pointer-events-none` to allow clicks to pass through to the input, and `aria-hidden="true"` so screen readers ignore them if they are purely decorative or redundant.
