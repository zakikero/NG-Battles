import { Component, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [MatTableModule, MatIconModule],
    templateUrl: './leaderboard.component.html',
    styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnChanges {
    @Input() playerCoords: PlayerCoord[];
    @Input() activePlayer: Player;
    @Input() turn: number;
    @Input() afklist: PlayerCoord[];
    displayedColumns: string[] = ['role', 'playerName', 'nWins'];
    dataSource: Player[];
    afkPlayerIds: string[];
    ngOnChanges() {
        this.dataSource = [...this.playerCoords.map((playerCoord) => playerCoord.player), ...this.afklist.map((playerCoord) => playerCoord.player)];
        if (this.activePlayer) {
            this.dataSource = [this.activePlayer, ...this.dataSource.filter((player) => player !== this.activePlayer)];
        }
        this.afkPlayerIds = this.afklist.map((playerCoord) => playerCoord.player.id);
    }

    hasFlag(player: Player): boolean {
        return player.inventory.includes(ItemTypes.FLAG_A);
    }
}
