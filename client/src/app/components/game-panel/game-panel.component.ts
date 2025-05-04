import { Component, Input, OnChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Player, PlayerCoord } from '@common/player';

@Component({
    selector: 'app-game-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './game-panel.component.html',
    styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent implements OnChanges {
    @Input() playerCoords: PlayerCoord[];
    @Input() game: string;
    @Input() mapSize: number;
    @Input() activePlayer: Player;
    @Input() afklist: PlayerCoord[];
    nPlayers: number = 0;

    ngOnChanges() {
        this.nPlayers = this.playerCoords.length;
    }
}
