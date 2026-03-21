## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.

## 2024-05-25 - Keyboard Access for Hover-Triggered Tooltips and Hidden Interactive Elements

**Learning:** Hover-triggered tooltips (`opacity-0 group-hover:opacity-100`) and hidden action buttons (like delete buttons that only show on hover) become completely inaccessible to keyboard users tabbing through the UI. The visual feedback is lost, making functionality undiscoverable.

**Action:** For tooltips, wrap the trigger icon in a focusable interactive element (e.g., `<button type="button">`) with explicit `aria-label` or `aria-describedby` and `focus-visible` styling. Add `group-focus-within:opacity-100` to the tooltip container to ensure visibility via keyboard navigation. For hidden interactive elements, always add `focus-visible:opacity-100` alongside explicit `focus-visible` styling.
