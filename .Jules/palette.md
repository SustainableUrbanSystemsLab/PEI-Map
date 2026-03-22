## 2026-03-16 - Unified Focus Treatment For Map Controls
**Learning:** This app suppresses or weakens default focus styling across custom sidebar controls and embedded Mapbox widgets, so keyboard users lose track of focus when moving between the floating map controls and the sidebar.
**Action:** Reuse one visible focus treatment across app-owned buttons, form controls, and wrapped third-party map widgets whenever custom control styling removes the browser default.

## 2024-05-18 - Semantic Labels in Custom Dashboard Controls
**Learning:** In custom dashboards with tight spacing (like the sidebar controls here), it's common to use `<div>` elements styled to look like labels for form inputs (`<select>`, `<input type="range">`). While this achieves the desired visual layout, it breaks accessibility because screen readers won't associate the "label" text with the input.
**Action:** Always use `<label for="inputId">` instead of `<div class="label">`. If the `<div>` had block-level styling, simply add `display: block` to the new `<label>` to preserve the exact visual design while making the form fully accessible.

## 2025-03-18 - Semantic Grouping and ARIA Pressed States for Custom Toggle Buttons
**Learning:** Custom UI button groups (like View Mode, Year selection, or Map Theme) that act as radio buttons but use simple `<div>` layouts and `class="on"` state toggling are inaccessible to screen readers without ARIA context. Users cannot discern that the buttons are related or currently active.
**Action:** When creating custom grouped toggle buttons or segmented controls, wrap them in an element with `role="group"` and `aria-labelledby`, and ensure the active/inactive states are communicated to screen readers dynamically via `aria-pressed="true"`/`aria-pressed="false"`.


## 2025-10-24 - Contextual Escape Key Behaviors in Map Interfaces
**Learning:** Having a global `Escape` key handler that blindly closes the main map sidebar is frustrating for users when they simply want to dismiss a secondary element like a Mapbox popup. The user intent of "Escape" depends on what is currently active.
**Action:** When implementing global `Escape` keydown handlers, always check for active secondary overlays (like map popups, modals, or focused inputs) and close/dismiss those first, before falling back to closing primary app-level navigation (like sidebars).

## 2025-10-24 - Shifting Focus for Off-Canvas Navigation on Mobile
**Learning:** When mobile sidebars slide over the content but do not trap or shift focus, screen reader and keyboard users are left navigating the underlying hidden page rather than the new sidebar content.
**Action:** When an off-canvas menu or sidebar opens, always explicitly shift `.focus()` to its first actionable element (like a close button). When it closes, shift focus back to the trigger button that opened it.

## 2024-05-18 - Keyboard Shortcuts for Mapbox Geocoder Input
**Learning:** Mapbox geocoder inputs are often difficult to navigate to quickly without a mouse. Adding a global keyboard shortcut (like `/`) significantly improves the experience for power users, but care must be taken to avoid triggering the shortcut when the user is already typing in an input field.
**Action:** When adding global keyboard shortcuts to focus specific elements, always check `e.target.tagName` to ensure the user is not currently focused on an `INPUT` or `TEXTAREA` to prevent overriding normal typing behavior.
