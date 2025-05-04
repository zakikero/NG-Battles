import { Component, Input } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { MapBaseService } from '@app/services/map-base.service';

@Component({
    selector: 'app-base-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: './base-map.component.html',
    styleUrl: './base-map.component.scss',
})
export abstract class BaseMapComponent {
    @Input() mapSize: number;

    constructor(protected mapService: MapBaseService) {}
}
