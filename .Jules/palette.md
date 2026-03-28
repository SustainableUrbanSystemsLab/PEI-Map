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

## 2024-11-20 - Isolating Off-Canvas Navigation with `inert`
**Learning:** Shifting focus to a mobile sidebar is a great start, but screen readers can still explore the visually hidden page behind the backdrop, causing severe disorientation for users who tab past the end of the sidebar.
**Action:** Use the HTML `inert` attribute on the main app wrapper when an off-canvas menu opens to completely remove the background content from the accessibility tree and trap focus naturally without complex JavaScript focus trapping.

## 2024-11-20 - Associating Contextual Hints with Form Controls
**Learning:** Paragraphs of instructional text (`<p class="hint">`) placed directly below a select dropdown or button group are obvious to sighted users, but screen readers will not announce them when the control receives focus, leaving users without crucial context (like what colors represent in a diff view).
**Action:** Always assign an `id` to hint text and use `aria-describedby="hintId"` on the corresponding `<select>`, `<input>`, or `role="group"` so the instructions are announced automatically upon focus.

## 2026-03-27 - HTML5 Semantic Landmarks in Map Dashboards
**Learning:** Full-screen web map dashboards often lack traditional document flow, replacing headers and footers with floating widgets and sidebars. Without semantic landmarks (`<aside>`, `<main>`) and ARIA roles (`role="region"`), screen reader users are forced to traverse the entire DOM linearly without the ability to jump to functional areas (like map controls or stats).
**Action:** When building map dashboards, add semantic landmarks to distinct functional areas to help screen reader users. If changing existing `<div>` tags to HTML5 landmarks (`<aside>`, `<main>`) breaks existing CSS layouts (e.g., tag-based child selectors like `body > div`), achieve the same accessibility benefit safely by adding `role="complementary"` and `role="main"` directly to the existing `<div>` wrappers. Also apply `role="region"` with `aria-labelledby` to floating informational widgets.

## 2026-03-29 - Semantic Acronyms and Hiding Visual Color Legends
**Learning:** Map popups are often data-dense and rely on acronyms (like CDI, RSI) to save space, but screen readers will read these as literal letters or poorly attempt to pronounce them, confusing users. Additionally, pure visual continuous color gradients like heat map legends lack discrete value mappings when read aloud, making them confusing noise.
**Action:** Wrap data-dense acronyms in `<abbr title="Full Name">` tags with `cursor: help` to provide native hover tooltips and screen reader expansions. Always hide continuous visual-only color gradient legends with `aria-hidden="true"` if the actual quantitative values are already accessible elsewhere (like via popup interaction).
