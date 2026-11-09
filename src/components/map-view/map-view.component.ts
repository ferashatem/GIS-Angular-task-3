import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, viewChild } from '@angular/core';
import Viewpoint from '@arcgis/core/Viewpoint.js';
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-zoom';
import '@arcgis/map-components/components/arcgis-home';
import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-expand';
import { MapService } from '../../gis/services/map.services';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapViewComponent {
  protected readonly mapService = inject(MapService);
  private mapElement: HTMLArcgisMapElement | null = null;
  retry(): void {
    // A fresh page also resets rejected ArcGIS layer-load promises.
    window.location.reload();
  }

  private readonly homeRef = viewChild<ElementRef<HTMLArcgisHomeElement>>('home');

  async onViewReady(event: Event): Promise<void> {
    this.mapElement = event.target as HTMLArcgisMapElement;
    await this.initialize(this.mapElement);
  }

  private async initialize(element: HTMLArcgisMapElement): Promise<void> {
    await this.mapService.initialize(element);

    // Make the Home button return to the extent that shows all our data.
    const extent = this.mapService.defaultExtent;
    const home = this.homeRef()?.nativeElement;
    if (extent && home) {
      home.viewpoint = new Viewpoint({ targetGeometry: extent });
    }
  }
}
