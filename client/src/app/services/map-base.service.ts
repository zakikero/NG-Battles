import { Injectable } from '@angular/core';
import { GameTile, TileStructure } from '@common/game-structure';

@Injectable({
    providedIn: 'root',
})
export abstract class MapBaseService {
    tiles: TileStructure[];

    isGameTile(tile: TileStructure | GameTile): tile is GameTile {
        return (tile as GameTile).isAccessible !== undefined;
    }

    isPlayerTile(tile: TileStructure | GameTile): tile is GameTile & { player: { avatar: string } } {
        return (tile as GameTile).player !== undefined;
    }

    /* eslint-disable */ // intentionnaly left empty to do nothing if not reimplemented by child class
    onRightClick(index: number): void {}
    onMouseDown(index: number, event: MouseEvent): void {}
    onMouseUp(index: number, event: MouseEvent): void {}
    onDrop(index: number): void {}
    onMouseEnter(index: number, event: MouseEvent): void {}
    onExit(): void {}
}
