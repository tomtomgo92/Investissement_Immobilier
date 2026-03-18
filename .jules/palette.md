## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.

## 2024-05-25 - Keyboard Accessibility for Hidden UI Elements
**Learning:** Hiding interactive elements (like the delete charge button or tooltips) using `opacity-0` makes them completely inaccessible and undiscoverable for keyboard users tabbing through the UI, as they remain invisible even when focused.
**Action:** Always add `focus-visible:opacity-100` alongside explicit `focus-visible` ring styling to hidden buttons to ensure they appear when focused. For tooltip components triggered on hover, wrap the trigger in a focusable `<button type="button">` and add `group-focus-within:opacity-100` to the tooltip container to guarantee visibility via keyboard navigation.
