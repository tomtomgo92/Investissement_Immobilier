## 2024-05-16 - Custom Interactive Elements Keyboard Accessibility Pattern
**Learning:** Found that custom group components (like project tabs) and toggle buttons were lacking semantic meaning for screen readers and visible focus indicators for keyboard navigation.
**Action:** Always implement explicit semantics and focus states on interactive components.
- For tabs: Use `role="tablist"` on the container and `role="tab"` with `aria-selected={bool}` on items.
- For toggle buttons: Use `aria-pressed={bool}`.
- For all custom interactives: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800` (or `slate-900` depending on context) to ensure strong keyboard navigation visibility.