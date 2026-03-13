## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.

## 2024-05-30 - Interactive Elements Hidden Behind Opacity or Hover States
**Learning:** Hiding interactive elements (like the "Delete Charge" button or `InfoTooltip` content) using `opacity-0` or pure CSS hover states makes them entirely undiscoverable and inaccessible for keyboard users tabbing through the UI, effectively creating "ghost" elements.
**Action:** Always ensure hidden interactive elements use `focus-visible:opacity-100` alongside explicit `focus-visible` styling (`focus-visible:outline-none focus-visible:ring-2...`). For custom tooltips triggered by icons, wrap the trigger in an interactive element like `<button type="button">` with an appropriate `aria-label`, and use `group-focus-visible:opacity-100` to show the tooltip content on keyboard focus.
