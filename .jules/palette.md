## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.

## 2024-05-28 - Focusability of Hidden Action Elements
**Learning:** Tooltip trigger icons and conditionally-visible action buttons (e.g., those hidden using `opacity-0 group-hover:opacity-100`) become undiscoverable and completely inaccessible to keyboard users tabbing through the UI unless explicitly managed.
**Action:** Always wrap interactive tooltip icons in `<button type="button">` with `aria-describedby` and `focus-visible` styles. To make the tooltip appear for keyboard users, add `group-focus-within:opacity-100` to its container. For conditionally-hidden action buttons (like delete buttons in lists), always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100` and strong explicit `focus-visible` styling.