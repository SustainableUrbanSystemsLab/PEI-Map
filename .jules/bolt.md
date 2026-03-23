## 2024-05-18 - Mapbox Source Layer Fetching
**Learning:** The application fetches Mapbox vector tileset metadata to identify source layers. Doing this sequentially using an `await` within a `for...of` loop creates an unnecessary network waterfall and delays initial map rendering.
**Action:** When making multiple independent API calls (like fetching metadata for different years/tilesets), always use `Promise.all` to fetch them in parallel instead of using sequential `await` calls.
## 2024-05-19 - Mapbox Vector Tile Boundaries cause Feature Duplication
**Learning:** The Mapbox `queryRenderedFeatures` method returns duplicate features when a single geographic entity crosses vector tile boundaries. Aggregating these un-deduplicated arrays leads to redundant calculation cycles and artificially skews counts, sums, and averages.
**Action:** When calculating statistics or performing heavy aggregations on the output of `queryRenderedFeatures`, always use a `Set` and a unique identifier (like `GEOID`) to track and deduplicate features in a single pass before performing any calculations.
## 2024-05-20 - Redundant String Normalization in Loops
**Learning:** In `getPropValue`, iterating over properties and keys involves repeatedly calling `toLowerCase().replace(/[^a-z0-9]/g, '')` on the same strings. This O(N*M) string allocation and regex execution is extremely inefficient, especially when called repeatedly per Mapbox feature during interaction or processing.
**Action:** When performing flexible or fuzzy key matching against a large set of objects or frequently called functions, use a `WeakMap` to cache the normalized keys (e.g., stripping non-alphanumeric characters) for each object. This avoids repeated expensive regex and string operations across multiple queries for the same object.

## 2024-05-18 - Prevent Mapbox duplicate vector tile loads
**Learning:** Mapbox GL JS treats identical source URLs as distinct if they are registered under different source IDs. Destroying and recreating a layer's source instead of pointing to a preloaded identical background source causes redundant network requests, parsing overhead, and flashing UI when toggling layers.
**Action:** When working with Mapbox layers that toggle visibility, load the source once on map initialization and point multiple layers to the same source ID, instead of dynamically recreating `addSource` over time.

## 2024-05-21 - CSS @import Causes Network Waterfalls
**Learning:** Using `@import` in CSS files (e.g., to load Google Fonts) forces the browser to wait until the CSS file is downloaded and parsed before it can discover and start downloading the imported resources. This sequential fetching creates a network waterfall and delays First Contentful Paint (FCP).
**Action:** Always load critical external resources like fonts directly in the HTML `<head>` using `<link rel="stylesheet">` and `<link rel="preconnect">` to enable parallel fetching alongside other primary assets.
