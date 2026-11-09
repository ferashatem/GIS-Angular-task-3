# Employee Operations GIS Map

An Angular application for exploring fictional employee locations and finding employees near company offices. Built with TypeScript and the ArcGIS Maps SDK for JavaScript.

Live application: [Atlas Employee Operations](https://gis-training-96b2e.web.app).

## Deploy to Firebase Hosting

The Hosting configuration targets Firebase project `gis-training-96b2e` and publishes `dist` with an Angular route fallback.

With the Firebase CLI installed, sign in using an account with access to that project, then build and deploy:

```sh
firebase login
npm ci
npm run build
firebase deploy --only hosting --project gis-training-96b2e
```

## Run locally

Prerequisites: Node.js 22.22.3+ in the 22.x series, 24.15.0+ in the 24.x series, or 26+ (24.15.0 tested) and npm.

```sh
npm ci
npm start
```

Open http://localhost:4200. Internet access is needed for the ArcGIS Light Gray basemap and ArcGIS runtime resources. This implementation uses local GeoJSON and the public Light Gray basemap; no API key or backend is configured. If you switch to an authenticated ArcGIS basemap or service, configure its credentials separately.

```sh
npm run build
npm test -- --watch=false
```

The production application is written to `dist`. Configure your static server to fall back to `index.html` for application routes. The map page is lazy-loaded; the initial-bundle warning budget is 750 kB, with a 1 MB error limit. ArcGIS theme CSS is included so its controls and popups render correctly.

## Visual design

The Atlas workspace uses a light map, a dark navigation rail, live summary metrics, department-tinted employee initials, and a responsive sidebar. Shared design tokens live at the top of src/styles.scss. The small UiIconComponent keeps icon styling consistent without adding a UI library. Presentational components use separate HTML templates to make them easier to study.

## Using the application

- Search names without worrying about capitalization. Department and assigned-office filters combine with the search.
- Select an employee card to zoom, highlight the point and open its details.
- Choose an office and 2, 5 or 10 km, then select **Analyze coverage**.
- Coverage includes employees near that office regardless of their assigned office. Existing search/department/assigned-office filters further narrow the visible results.
- **Reset** clears all employee filters and coverage, then restores the map extent. **Clear coverage** removes the geographic restriction and buffer independently.
- The result explains both the total inside the geographic buffer and the number visible after other filters.
- The map and list share one computed selection, including when it is empty.
- On mobile the map appears above the controls and list. Open the legend using the map's legend/expand button.

## Data and map layers

`public/data/employees.geojson` contains 24 fictional employees in Engineering, Sales, Human Resources and Operations. `public/data/offices.geojson` contains Nasr City, Maadi and Sheikh Zayed offices. Each office has eight assigned employees.

Employee attributes: id, fullName, jobTitle, department, email, phoneNumber, latitude, longitude and officeId.
Office attributes: id, name, area, latitude and longitude. Records use fictional sample information and example-domain emails; do not replace them with real home locations.

| Layer     | Representation                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Employees | Circles colored by department: blue Engineering, orange Sales, green Human Resources, red Operations |
| Offices   | Larger yellow diamonds with white outlines                                                           |
| Coverage  | Translucent teal polygon with a dashed boundary                                                      |

The renderer supplies legend labels. Employee popups show name, job, department, assigned office, contact details and coordinates. An Arcade Decode expression resolves officeId to the office name. Office popups show name, area and coordinates.

## Coordinates and WGS 84

A coordinate system defines what numbers mean and how locations relate to Earth. Using incompatible systems can put points in the wrong place or produce incorrect distance calculations.

The GeoJSON stores WGS 84 geographic coordinates (WKID 4326). GeoJSON point order is **[longitude, latitude]**, in degrees. WGS 84 is broadly supported by web mapping and GPS. ArcGIS projects these source coordinates for display over the basemap; the basemap's display projection does not change the source data.

Degrees are not kilometers. Coverage therefore uses ArcGIS's **geodesic buffer operator**, which measures distance on Earth's curved surface rather than treating degree values as planar units.

## How coverage works

1. Resolve the selected office from the loaded office records.
2. Create a WGS 84 point and load the geodesic buffer operator.
3. Construct a polygon with the selected distance and explicit kilometer units.
4. Intersect each employee's WGS 84 point with that polygon. This includes the polygon boundary, subject to the operator's geometric approximation.
5. Draw that same polygon in a GraphicsLayer and store the matching employee IDs.
6. Combine those IDs with the employee filters in a computed signal.
7. Apply the resulting IDs to the employee layer view and render the same records in the list.

The polygon is an approximation of a geodesic circle. This is straight-line geographic proximity, not driving distance, travel time, availability scheduling or a road-network service area.

Clearing coverage invalidates pending calculations, so a delayed calculation cannot restore a cleared buffer. Selection also ignores stale navigation results.

## Project structure

```text
public/data/                    Fictional GeoJSON source data
src/app/                        Bootstrap configuration and lazy routing
src/pages/operations-map/       Screen composition, without GIS algorithms
src/components/
  map-view/                     ArcGIS custom elements, Home, legend and loading UI
  employee-filters/             Reusable filter form: inputs in, change events out
  employee-list/                Reusable employee cards and selection events
  coverage-tool/                Reusable office/distance form and result explanation
src/gis/
  models/                       Employee, office, filters and coverage contracts
  config/                       Department symbols and popup templates
  services/
    employee-selection.ts       Pure function combining selection constraints
    employee-store.service.ts   Shared signals and computed employee results
    map.services.ts             ArcGIS integration, loading, navigation and buffers
```

Reusable form and list components receive input signals and emit output events. The page connects them to services. The store has no ArcGIS or DOM dependencies. MapService translates store state into GIS operations.

## Study guide

Start with [the code walkthrough](docs/CODE_WALKTHROUGH.md). It explains a reading order and traces a filter change and coverage request through the application.

## Screenshots

- [Default map](docs/screenshots/default-map.png)
- [Department-filtered map](docs/screenshots/department-filter.png)
- [Office coverage result](docs/screenshots/office-coverage.png)
- [Mobile layout](docs/screenshots/mobile-map.png)

See [verification notes](docs/VERIFICATION.md) for checks and independently compared coverage counts.
