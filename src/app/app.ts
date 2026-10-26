import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@arcgis/map-components/components/arcgis-map';
import '@arcgis/map-components/components/arcgis-zoom';
import '@arcgis/map-components/components/arcgis-home';
import '@arcgis/map-components/components/arcgis-legend';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  onViewReady(event: Event): void {
    const mapEl = event.target as HTMLArcgisMapElement;
    console.log('Map view is ready:', mapEl.view.spatialReference.wkid);
  }
}
