## 2026-03-16 - Unified Focus Treatment For Map Controls
**Learning:** This app suppresses or weakens default focus styling across custom sidebar controls and embedded Mapbox widgets, so keyboard users lose track of focus when moving between the floating map controls and the sidebar.
**Action:** Reuse one visible focus treatment across app-owned buttons, form controls, and wrapped third-party map widgets whenever custom control styling removes the browser default.

## 2024-05-18 - Semantic Labels in Custom Dashboard Controls
**Learning:** In custom dashboards with tight spacing (like the sidebar controls here), it's common to use `<div>` elements styled to look like labels for form inputs (`<select>`, `<input type="range">`). While this achieves the desired visual layout, it breaks accessibility because screen readers won't associate the "label" text with the input.
**Action:** Always use `<label for="inputId">` instead of `<div class="label">`. If the `<div>` had block-level styling, simply add `display: block` to the new `<label>` to preserve the exact visual design while making the form fully accessible.
