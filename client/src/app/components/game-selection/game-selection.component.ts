import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MapPreviewComponent } from '@app/components/map-preview/map-preview.component';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-game-selection',
    standalone: true,
    imports: [RouterLink, MapPreviewComponent, MatCardModule, MatTooltipModule],
    templateUrl: './game-selection.component.html',
    styleUrl: './game-selection.component.scss',
})
/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameSelectionComponent {
    @Input() game: GameStructure;

    getMapSize(): number {
        return parseInt(this.game.mapSize, 10);
    }
}
