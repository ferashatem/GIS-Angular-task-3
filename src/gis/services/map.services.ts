import { effect, inject, Injectable, signal } from '@angular/core';
import ArcGISMap from '@arcgis/core/Map.js';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import * as bufferOperator from '@arcgis/core/geometry/operators/geodesicBufferOperator.js';
import * as intersects from '@arcgis/core/geometry/operators/intersectsOperator.js';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter.js';
import type GeoJSONLayerView from '@arcgis/core/views/layers/GeoJSONLayerView.js';
import type MapView from '@arcgis/core/views/MapView.js';
import type Extent from '@arcgis/core/geometry/Extent.js';
import { Employee, Office, LoadState, CoverageRequest } from '../models';
import { EmployeeStore } from './employee-store.service';
import { createEmployeeRenderer, createOfficeRenderer } from '../config/symbology';
import { createEmployeePopup, createOfficePopup } from '../config/popups';

/** ArcGIS adapter. Shared employee/filter state lives in EmployeeStore. */
@Injectable({ providedIn: 'root' })
export class MapService {
  readonly store = inject(EmployeeStore);
  readonly loadState = signal<LoadState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly analysisBusy = signal(false);
  private view: MapView | null = null;
  private employeeView = signal<GeoJSONLayerView | null>(null);
  private dataExtent: Extent | null = null;
  private analysisVersion = 0;
  private selectionVersion = 0;
  private highlight: { remove(): void } | null = null;

  readonly employeesLayer = new GeoJSONLayer({
    url: 'data/employees.geojson',
    title: 'Employees',
    objectIdField: 'id',
    outFields: ['*'],
    renderer: createEmployeeRenderer(),
  });
  readonly officesLayer = new GeoJSONLayer({
    url: 'data/offices.geojson',
    title: 'Offices',
    objectIdField: 'id',
    outFields: ['*'],
    renderer: createOfficeRenderer(),
    popupTemplate: createOfficePopup(),
  });
  readonly coverageLayer = new GraphicsLayer({ title: 'Coverage area', listMode: 'hide' });
  readonly map = new ArcGISMap({
    basemap: 'gray',
    layers: [this.coverageLayer, this.employeesLayer, this.officesLayer],
  });

  constructor() {
    effect(() => {
      const layerView = this.employeeView();
      const ids = this.store.visibleEmployees().map((employee) => employee.id);
      // Filter only the view, keeping the full dataset available for later analysis.
      if (layerView)
        layerView.filter = new FeatureFilter({
          objectIds: ids,
          where: ids.length ? '1=1' : '1=0',
        });
      ++this.selectionVersion;
      this.highlight?.remove();
      this.highlight = null;
      this.view?.closePopup();
      this.store.selectedId.set(null);
    });
  }

  handleViewError(): void {
    this.errorMessage.set(
      'The map could not start. Check WebGL support and your connection, then retry.',
    );
    this.loadState.set('error');
  }

  async initialize(element: HTMLArcgisMapElement): Promise<void> {
    this.loadState.set('loading');
    this.errorMessage.set(null);
    try {
      this.view = element.view;
      await Promise.all([this.employeesLayer.load(), this.officesLayer.load()]);
      const [employees, offices] = await Promise.all([
        this.employeesLayer.queryFeatures({
          where: '1=1',
          outFields: ['*'],
          returnGeometry: false,
        }),
        this.officesLayer.queryFeatures({ where: '1=1', outFields: ['*'], returnGeometry: false }),
      ]);
      this.store.employees.set(employees.features.map((feature) => feature.attributes as Employee));
      this.store.offices.set(offices.features.map((feature) => feature.attributes as Office));
      this.employeesLayer.popupTemplate = createEmployeePopup(this.store.offices());
      this.employeeView.set(
        (await this.view.whenLayerView(this.employeesLayer)) as GeoJSONLayerView,
      );
      await this.zoomToAllData();
      this.loadState.set('ready');
    } catch (error) {
      console.error('Map initialization failed', error);
      this.errorMessage.set('Could not load the map. Check your connection, then retry.');
      this.loadState.set('error');
    }
  }

  async zoomToAllData(): Promise<void> {
    const employees = this.employeesLayer.fullExtent;
    const offices = this.officesLayer.fullExtent;
    if (!employees || !offices || !this.view) return;
    this.dataExtent = employees.clone().union(offices).expand(1.2);
    await this.navigate(this.dataExtent);
  }
  get defaultExtent(): Extent | null {
    return this.dataExtent;
  }

  async showAllLocations(): Promise<void> {
    this.actionError.set(null);
    try {
      await this.zoomToAllData();
    } catch (error) {
      this.reportError(error, 'Could not restore the map view. Please try again.');
    }
  }

  async selectEmployee(employee: Employee): Promise<void> {
    if (!this.view) return;
    this.actionError.set(null);
    const selection = ++this.selectionVersion;
    try {
      const result = await this.employeesLayer.queryFeatures({
        objectIds: [employee.id],
        outFields: ['*'],
        returnGeometry: true,
      });
      const feature = result.features[0];
      if (
        selection !== this.selectionVersion ||
        !feature?.geometry ||
        !this.store.visibleEmployees().some((item) => item.id === employee.id)
      )
        return;
      await this.navigate({ target: feature.geometry, zoom: 15 });
      if (selection !== this.selectionVersion) return;
      this.highlight?.remove();
      this.highlight = this.employeeView()?.highlight(employee.id) ?? null;
      this.store.selectedId.set(employee.id);
      this.view.openPopup({ features: [feature], location: this.point(employee) });
    } catch (error) {
      this.reportError(error, 'Could not open this employee. Please try again.');
    }
  }

  async applyCoverage(request: CoverageRequest): Promise<void> {
    const office = this.store.offices().find((item) => item.id === request.officeId);
    if (!office) return;
    const version = ++this.analysisVersion;
    this.analysisBusy.set(true);
    this.actionError.set(null);
    try {
      await bufferOperator.load();
      if (version !== this.analysisVersion) return;
      // Geodesic distance accounts for Earth's curvature. Coordinates remain WGS 84.
      const buffer = bufferOperator.execute(this.point(office), request.distanceKm, {
        unit: 'kilometers',
      });
      if (!buffer) throw new Error('Buffer could not be created');
      const employeeIds = this.store
        .employees()
        .filter((employee) => intersects.execute(buffer, this.point(employee)))
        .map((employee) => employee.id);
      this.coverageLayer.removeAll();
      this.coverageLayer.add(
        new Graphic({
          geometry: buffer,
          symbol: {
            type: 'simple-fill',
            color: [14, 116, 144, 0.13],
            outline: { color: '#0e7490', width: 2, style: 'dash' },
          },
        }),
      );
      this.store.coverage.set({
        officeName: office.name,
        distanceKm: request.distanceKm,
        employeeIds,
      });
      if (buffer.extent) await this.navigate(buffer.extent.expand(1.3));
    } catch (error) {
      if (version === this.analysisVersion)
        this.reportError(error, 'Coverage analysis failed. Please try again.');
    } finally {
      if (version === this.analysisVersion) this.analysisBusy.set(false);
    }
  }

  clearCoverage(): void {
    ++this.analysisVersion;
    this.analysisBusy.set(false);
    this.actionError.set(null);
    this.coverageLayer.removeAll();
    this.store.coverage.set(null);
  }

  private point(location: { longitude: number; latitude: number }): Point {
    return new Point({
      longitude: location.longitude,
      latitude: location.latitude,
      spatialReference: { wkid: 4326 },
    });
  }
  private async navigate(target: Parameters<MapView['goTo']>[0]): Promise<void> {
    try {
      await this.view?.goTo(target);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') throw error;
    }
  }
  private reportError(error: unknown, message: string): void {
    console.error(message, error);
    this.actionError.set(message);
  }
}
