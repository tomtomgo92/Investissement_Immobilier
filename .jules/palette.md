
## 2025-03-01 - Input Adornment Click Interception
**Learning:** Absolute positioned visual adornments inside inputs (like a '€' suffix or an icon) intercept mouse clicks, preventing the user from focusing the input when clicking directly on the adornment. This leads to a frustrating user experience where the input seems unresponsive in certain areas.
**Action:** Always add `pointer-events-none` to absolute positioned visual adornments that overlay inputs. If the adornment is purely visual, also add `aria-hidden="true"` to prevent redundant screen reader announcements.
