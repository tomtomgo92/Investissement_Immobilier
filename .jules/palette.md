## 2024-05-15 - Accessible Tab-Like Navigation

**Learning:** Custom tab-like navigation bars, common in this app's dashboards (like project selection or TMI selection), need explicit roles and states to be correctly interpreted by screen readers. The `aria-selected` state tells users which option is currently active.

**Action:** When implementing custom tab bars, always wrap the container in `role="tablist"` (with an `aria-label`), and use `role="tab"` with `aria-selected` for individual items. Ensure explicit `focus-visible` styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800`) are set for keyboard navigation.