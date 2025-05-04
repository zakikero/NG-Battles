import { Component } from '@angular/core';
import { MatGridListModule, MatGridTile } from '@angular/material/grid-list';
import { BaseMapComponent } from '@app/components/base-map/base-map.component';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { MapGameService } from '@app/services/map-game.service';

@Component({
    selector: 'app-game-map',
    standalone: true,
    imports: [MatGridListModule, MatGridTile, TileBasicComponent],
    templateUrl: '../base-map/base-map.component.html', // reuse base-map template
    styleUrl: '../base-map/base-map.component.scss',
})
export class GameMapComponent extends BaseMapComponent {
    constructor(protected mapService: MapGameService) {
        super(mapService);
    }
}
