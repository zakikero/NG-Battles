import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TileInfoModalComponent } from '@app/components/tile-info-modal/tile-info-modal.component';
import { GameState, GameTile, ShortestPathByTile } from '@common/game-structure';
import { GameControllerService } from './game-controller.service';

@Injectable()
export abstract class BaseStateService {
    availableTiles: number[] = [];
    shortestPathByTile: ShortestPathByTile = {};

    gameController = inject(GameControllerService);

    constructor(protected dialog: MatDialog) {}

    getAvailableTiles(): number[] {
        return this.availableTiles;
    }

    setAvailableTiles(availableTiles: number[]): void {
        this.availableTiles = availableTiles;
    }

    resetAvailableTiles(): void {
        this.availableTiles = [];
    }

    availablesTilesIncludes(index: number): boolean {
        return this.availableTiles.includes(index);
    }

    getShortestPathByIndex(index: number): number[] {
        return this.shortestPathByTile[index];
    }

    getShortestPathByTile(): ShortestPathByTile {
        return this.shortestPathByTile;
    }

    setShortestPathByTile(shortestPathByTile: ShortestPathByTile): void {
        this.shortestPathByTile = shortestPathByTile;
    }

    resetShortestPathByTile(): void {
        this.shortestPathByTile = {};
    }

    resetMovementPrevisualization() {
        this.resetAvailableTiles();
        this.resetShortestPathByTile();
    }

    onRightClick(tile: GameTile): void {
        if (this.gameController.isActivePlayer()) {
            if (!this.gameController.isDebugModeActive) {
                this.dialog.open(TileInfoModalComponent, {
                    data: { tile },
                });
            }
        }
    }
    /* eslint-disable */ // intentionnaly left empty to do nothing if not reimplemented by child class
    initializePrevisualization(accessibleTiles: ShortestPathByTile | number[]): void {}
    /* eslint-enable */

    abstract onMouseDown(index: number): GameState;
}
