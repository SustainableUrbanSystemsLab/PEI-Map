## 2026-03-16 - Unified Focus Treatment For Map Controls
**Learning:** This app suppresses or weakens default focus styling across custom sidebar controls and embedded Mapbox widgets, so keyboard users lose track of focus when moving between the floating map controls and the sidebar.
**Action:** Reuse one visible focus treatment across app-owned buttons, form controls, and wrapped third-party map widgets whenever custom control styling removes the browser default.

## 2024-05-18 - Semantic Labels in Custom Dashboard Controls
**Learning:** In custom dashboards with tight spacing (like the sidebar controls here), it's common to use `<div>` elements styled to look like labels for form inputs (`<select>`, `<input type="range">`). While this achieves the desired visual layout, it breaks accessibility because screen readers won't associate the "label" text with the input.
**Action:** Always use `<label for="inputId">` instead of `<div class="label">`. If the `<div>` had block-level styling, simply add `display: block` to the new `<label>` to preserve the exact visual design while making the form fully accessible.

## 2025-03-18 - Semantic Grouping and ARIA Pressed States for Custom Toggle Buttons
**Learning:** Custom UI button groups (like View Mode, Year selection, or Map Theme) that act as radio buttons but use simple `<div>` layouts and `class="on"` state toggling are inaccessible to screen readers without ARIA context. Users cannot discern that the buttons are related or currently active.
**Action:** When creating custom grouped toggle buttons or segmented controls, wrap them in an element with `role="group"` and `aria-labelledby`, and ensure the active/inactive states are communicated to screen readers dynamically via `aria-pressed="true"`/`aria-pressed="false"`.
