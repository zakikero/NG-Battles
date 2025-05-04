import { Component } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { MapEditService } from '@app/services/map-edit.service';
import { BaseMapComponent } from '@app/components/base-map/base-map.component';

@Component({
    selector: 'app-edit-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: '../base-map/base-map.component.html', // reuse base-map template
    styleUrl: '../base-map/base-map.component.scss',
})
export class EditMapComponent extends BaseMapComponent {
    constructor(protected mapService: MapEditService) {
        super(mapService);
    }
}
