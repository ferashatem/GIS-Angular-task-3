# Verification

Verified on 7 November 2026 using Node.js 24.15.0 and headless Microsoft Edge.

## Automated checks

- Production Angular build completes successfully.
- Three tests pass: the application routing outlet, combined employee-filter constraints, and the distinction between inactive coverage and an active area with no matches.
- The map page is lazy-loaded. The initial bundle stays below the configured 750 kB warning and 1 MB error budgets.

## Browser checks

- Initial data loads: 24 employee cards, three offices and separate employee/office map layers.
- Engineering filtering produces seven cards and the same seven object IDs in the map's layer-view filter.
- Assigned office Maadi produces eight employees. Adding the name Mohamed narrows it to one.
- A search with no matches shows the empty state and applies an explicit zero-result map filter.
- Selecting Ahmed Samir opens a popup titled Ahmed Samir; the office-name expression resolves to Nasr City Office.
- Coverage produces a visible dashed polygon, matching employee cards and a count explanation.
- Clearing filters and clearing coverage operate independently.
- All nine office/distance combinations were compared with an independent Haversine distance calculation using the sample coordinates. Counts agree (see below).
- Blocking the employee GeoJSON request shows the error overlay. Unblocking it and clicking Retry reloads the page and restores 24 employees.
- At 390 x 844, the page has no horizontal overflow; the legend is collapsed and the map appears above the controls.
- Required screenshots plus an additional mobile screenshot are saved in docs/screenshots.
- The optimized production files were also served locally: initialization and Nasr City 5 km coverage work without uncaught page errors.

| Office       | 2 km | 5 km | 10 km |
| ------------ | ---: | ---: | ----: |
| Nasr City    |    2 |    5 |     8 |
| Maadi        |    2 |    5 |     8 |
| Sheikh Zayed |    2 |    4 |     7 |

Haversine uses a spherical Earth, while the ArcGIS geodesic buffer uses its own geodetic model and polygon approximation. Matching these sample counts is a useful independent check, not proof that both methods are numerically identical at every boundary.

## Limits

Browser checks cover the local sample data, desktop and one mobile viewport. They do not establish compatibility with every browser, real device or network condition. Internet access is required for the basemap and runtime resources. No real home-address data, backend API, road-network analysis or deployment is included.

## Atlas design refresh

Verified the redesigned interface at 1440 x 1000 and 390 x 844: no horizontal overflow, seven Engineering records synchronized to map IDs, empty search feedback, employee popup navigation, and 2/5/10 km Nasr City counts of 2/5/8. The distance selector now uses keyboard-accessible radio buttons. The lighter basemap, shared icon component, separate HTML templates and new summary metrics preserve the existing data and coverage logic. Screenshots were refreshed.
