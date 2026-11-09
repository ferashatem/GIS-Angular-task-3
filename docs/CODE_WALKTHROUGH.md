# Code walkthrough

## Suggested reading order

1. **Models** — read employee.model.ts, office.model.ts and map-state.model.ts. Interfaces describe the shape of data. Department and CoverageDistanceKm restrict values to supported options.
2. **employee-selection.ts** — a normal TypeScript function, with no Angular or ArcGIS dependencies. Every condition must match: name AND department AND assigned office AND coverage.
3. **employee-store.service.ts** — signals hold the source records and user choices. visibleEmployees is a computed signal: Angular derives it whenever an input signal changes.
4. **EmployeeFiltersComponent** — input() receives parent state; output() reports changes. The component does not know where data comes from or how maps work.
5. **EmployeeListComponent** — renders the computed records and emits a selected employee. It does not perform queries itself.
6. **CoverageToolComponent** — owns draft office/distance form values. Only submitting the form creates an analysis request. The result reflects the last applied request.
7. **OperationsMapPage** — connects component events to the store and MapService. This is composition, not a place for filtering or geometry algorithms.
8. **MapService** — owns ArcGIS layers, data loading, the layer-view filter, navigation, highlights and spatial analysis.
9. **MapViewComponent** — registers ArcGIS web components, waits for the view, calls initialization and sets Home's viewpoint.

## Trace a department change

```text
Department dropdown
  -> changed.emit({ department })
  -> page calls store.updateFilters(...)
  -> filters signal changes
  -> visibleEmployees recomputes
  -> employee list renders those records
  -> MapService effect applies the same IDs to the GeoJSONLayerView
```

There are no separate list and map filter algorithms to keep in sync. An empty coverage ID array means zero matches; null means coverage is not active. This distinction prevents accidentally displaying everyone after an empty analysis.

The map filters its **layer view**, leaving the underlying layer and store unchanged. This lets a new coverage analysis always consider the complete source dataset.

## Trace a coverage request

```text
Office + distance form
  -> applied.emit({ officeId, distanceKm })
  -> page calls map.applyCoverage(...)
  -> geodesic buffer polygon
  -> point/polygon intersections
  -> coverageLayer draws the polygon
  -> store.coverage receives matching IDs
  -> visibleEmployees recomputes
  -> map and list update together
```

The buffer and employee points both use WKID 4326. Kilometer units are explicit. The exact polygon drawn is also used for membership testing.

The total in coverage.employeeIds counts all employees in that geographic area. visibleEmployees also respects the other employee filters. The interface explains both counts.

## Important Angular concepts

- **inject(Service)** asks Angular for a shared service instance.
- **signal(value)** creates reactive state. Read it with parentheses; update it with set() or update().
- **computed(...)** derives a value. Avoid storing values you can calculate from existing state.
- **effect(...)** performs a side effect when signals change. Here it adapts the computed selection to ArcGIS, an external API.
- **input()/output()** form a reusable component's contract.
- **@for / @if** render lists and conditional UI.
- **FormsModule and ngModel** connect native controls to component values.
- **async/await** sequences operations that finish later, such as loading layers or operator resources.

## Important GIS concepts

- **Layer**: a dataset and its display configuration.
- **LayerView**: the representation of that layer inside one map view.
- **Feature**: a geometry plus attributes.
- **Renderer**: chooses symbols from attributes.
- **PopupTemplate**: describes details shown when a feature is selected.
- **Extent**: a bounding rectangle used for map navigation.
- **Geodesic buffer**: an approximate region within a distance on Earth's surface.
- **Intersection**: tests whether an employee point lies in or on the buffer polygon.

## Error and concurrency handling

Initialization has loading, ready and error states. The error overlay provides a retry action that reloads the page to reset failed ArcGIS loads.
Coverage/navigation errors use a separate message so the existing map stays usable.
New filter results remove stale selection highlights and popups.
Analysis and selection version numbers invalidate older asynchronous requests.
An interrupted map animation (AbortError) is normal when a newer navigation starts.

## Practice exercises

1. Add a job-title filter: extend EmployeeFilters, then the pure filter function and filter form.
2. Change department colors in department-colors.ts and confirm the legend follows the renderer.
3. Add an office attribute to its model, GeoJSON and popup.
4. Add a pure filter test for a new edge case before modifying the function.
5. Explain why officeId filtering and geographic office coverage answer different questions.

Keep new GIS operations in MapService (or a dedicated GIS service when it grows). Keep presentational components focused on inputs and user events.

## Design code

Each reusable form/list component has its own HTML template next to its TypeScript class. Shared tokens and layout rules are grouped in src/styles.scss. UiIconComponent provides a typed icon vocabulary using ordinary SVG paths. Employee initials are derived from the name; avatar tint uses the same department colors as the map. The summary metrics read existing store signals, so no duplicate data source is introduced. The light-gray basemap makes employee and office symbols easier to distinguish.
