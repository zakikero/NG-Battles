import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-stats',
    standalone: true,
    imports: [MatTableModule, MatSortModule],
    templateUrl: './player-stats.component.html',
    styleUrl: './player-stats.component.scss',
})
export class PlayerStatsComponent implements OnInit, AfterViewInit {
    @Input() playerList: Player[] = [];
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<unknown>;

    adaptedPlayerList: {
        name: string;
        combatCount: number;
        escapeCount: number;
        victoryCount: number;
        defeatCount: number;
        totalHealthLost: number;
        totalHealthTaken: number;
        uniqueItemsCollected: number;
        visitedTilesPercent: number;
    }[] = [];

    dataSource = new MatTableDataSource<{
        name: string;
        combatCount: number;
        escapeCount: number;
        victoryCount: number;
        defeatCount: number;
        totalHealthLost: number;
        totalHealthTaken: number;
        uniqueItemsCollected: number;
        visitedTilesPercent: number;
    }>([]);

    columnsToDisplay: string[] = [
        'name',
        'combatCount',
        'escapeCount',
        'victoryCount',
        'defeatCount',
        'totalHealthLost',
        'totalHealthTaken',
        'uniqueItemsCollected',
        'visitedTilesPercent',
    ];

    ngOnInit(): void {
        this.adaptedPlayerList = this.playerList.map((player) => {
            const playerCopy = JSON.parse(JSON.stringify(player));
            return {
                name: playerCopy.name,
                combatCount: playerCopy.stats.combatCount,
                escapeCount: playerCopy.stats.escapeCount,
                victoryCount: playerCopy.stats.victoryCount,
                defeatCount: playerCopy.stats.defeatCount,
                totalHealthLost: playerCopy.stats.totalHealthLost,
                totalHealthTaken: playerCopy.stats.totalHealthTaken,
                uniqueItemsCollected: playerCopy.stats.uniqueItemsCollected,
                visitedTilesPercent: playerCopy.stats.visitedTilesPercent,
            };
        });
        this.dataSource = new MatTableDataSource(this.adaptedPlayerList);
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }
}
