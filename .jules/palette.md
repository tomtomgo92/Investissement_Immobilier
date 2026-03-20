## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.

## 2024-05-30 - Tooltips Require Interactive Triggers for Accessibility
**Learning:** Tooltips triggered purely by CSS hover on static icons (like `<Info />`) are completely invisible to keyboard users. When using `group-hover` for tooltips, they cannot be navigated to via the `Tab` key.
**Action:** Tooltip triggers must be wrapped in an interactive element (e.g., `<button type="button">`) with explicit `focus-visible` styles. To make the tooltip appear for keyboard users, add `group-focus-within:opacity-100` alongside `group-hover:opacity-100` on the tooltip container. Set `aria-label` or `aria-describedby` on the button.
