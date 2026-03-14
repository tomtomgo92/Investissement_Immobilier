## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.

## 2024-05-24 - Input Adornments Blocking Clicks
**Learning:** Absolute positioned visual adornments inside inputs (like the '€' suffix in App.jsx) intercept mouse clicks, preventing users from focusing the input if they click exactly on the symbol. They also add unnecessary noise for screen readers.
**Action:** Always add `pointer-events-none` and `aria-hidden="true"` to purely visual, absolute-positioned input adornments across the design system.
## 2024-05-25 - Tooltips Focus Visibility
**Learning:** Tooltips that appear on hover must also be accessible via keyboard. Hiding them with `opacity-0 group-hover:opacity-100` makes them invisible to keyboard users.
**Action:** When implementing custom tooltips, wrap the trigger icon in a focusable interactive element, like a `<button type="button">`, with explicit `aria-describedby` linking to the tooltip's ID, and add `focus-visible` styles. Also ensure the tooltip itself uses `group-focus-within:opacity-100` so it appears when the button receives focus.
## 2024-05-25 - Interactive Elements Hidden by Opacity
**Learning:** Hiding interactive elements (like the remove charge button) using `opacity-0` makes them undiscoverable and inaccessible to keyboard users tabbing through the UI.
**Action:** Always add `focus-visible:opacity-100` alongside explicit `focus-visible` styling (`focus-visible:outline-none focus-visible:ring-2...`) to ensure they appear when focused.
