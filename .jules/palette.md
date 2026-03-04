## 2024-05-28 - Absolute Positioned Input Adornments
**Learning:** Purely visual, absolute-positioned adornments inside inputs (like a '€' suffix) intercept mouse clicks, preventing the user from focusing the input by clicking near the edge. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to such purely visual adornments to ensure a seamless interaction and accessible experience.
