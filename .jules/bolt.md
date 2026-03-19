## 2024-05-18 - Mapbox Source Layer Fetching
**Learning:** The application fetches Mapbox vector tileset metadata to identify source layers. Doing this sequentially using an `await` within a `for...of` loop creates an unnecessary network waterfall and delays initial map rendering.
**Action:** When making multiple independent API calls (like fetching metadata for different years/tilesets), always use `Promise.all` to fetch them in parallel instead of using sequential `await` calls.
## 2024-05-19 - Mapbox Vector Tile Boundaries cause Feature Duplication
**Learning:** The Mapbox `queryRenderedFeatures` method returns duplicate features when a single geographic entity crosses vector tile boundaries. Aggregating these un-deduplicated arrays leads to redundant calculation cycles and artificially skews counts, sums, and averages.
**Action:** When calculating statistics or performing heavy aggregations on the output of `queryRenderedFeatures`, always use a `Set` and a unique identifier (like `GEOID`) to track and deduplicate features in a single pass before performing any calculations.
