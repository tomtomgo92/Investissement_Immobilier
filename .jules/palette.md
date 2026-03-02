## 2024-05-24 - Absolute Positioned Visual Adornments Intercepting Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like a '€' suffix or an icon) can intercept mouse clicks and block input focus if they don't have `pointer-events-none`. Additionally, purely visual adornments should include `aria-hidden="true"` to hide them from screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to decorative absolute positioned elements inside inputs.
