import { TileStructure } from '@common/game-structure';
import { Injectable } from '@nestjs/common';
import {
    DOOR_TILES,
    LARGE_MAP_SIZE,
    LARGE_STARTING_POINTS,
    MEDIUM_MAP_SIZE,
    MEDIUM_STARTING_POINTS,
    SMALL_MAP_SIZE,
    SMALL_STARTING_POINTS,
    TERRAIN_DOOR_TILES,
} from './validation-constants';

@Injectable()
export class MapValidationService {
    hasStartingPoints(map: TileStructure[], mapSize: number) {
        const startingPoints = map.filter((tile) => tile.item === 'startingPoint').length;
        if (mapSize <= SMALL_MAP_SIZE) {
            return startingPoints >= SMALL_STARTING_POINTS;
        } else if (mapSize <= MEDIUM_MAP_SIZE) {
            return startingPoints >= MEDIUM_STARTING_POINTS;
        } else if (mapSize <= LARGE_MAP_SIZE) {
            return startingPoints >= LARGE_STARTING_POINTS;
        }
    }

    hasCorrectGroundAmount(map: TileStructure[]) {
        const terrainTiles = ['', 'grass', 'water', 'ice'];
        const totalTiles = map.length;
        const emptyTiles = map.filter((tile) => terrainTiles.includes(tile.tileType)).length;
        const threshold = 0.5;
        return emptyTiles / totalTiles > threshold;
    }

    areAllTilesAccessible(map: TileStructure[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const terrainDoorTiles = this.extractTiles(grid, mapSize, TERRAIN_DOOR_TILES);

        return this.allGroundTilesAccessible(grid, terrainDoorTiles, mapSize);
    }

    areAllDoorsValid(map: TileStructure[], mapSize: number) {
        const grid = this.createGrid(map, mapSize);
        const doorTiles = this.extractTiles(grid, mapSize, DOOR_TILES);
        return this.allDoorsValid(grid, doorTiles, mapSize);
    }

    createGrid(map: TileStructure[], mapSize: number): TileStructure[][] {
        const grid: TileStructure[][] = [];
        for (let i = 0; i < map.length; i++) {
            const row = Math.floor(i / mapSize);
            const col = i % mapSize;
            if (!grid[row]) {
                grid[row] = [];
            }
            grid[row][col] = map[i];
        }
        return grid;
    }

    extractTiles(grid: TileStructure[][], mapSize: number, tileTypes: string[]): [number, number][] {
        const tiles: [number, number][] = [];
        for (let i = 0; i < mapSize; i++) {
            for (let j = 0; j < mapSize; j++) {
                if (tileTypes.includes(grid[i][j].tileType)) {
                    tiles.push([i, j]);
                }
            }
        }
        return tiles;
    }

    isHorizontalDoor(grid: TileStructure[][], i: number, j: number, mapSize: number): boolean {
        return i > 0 && i < mapSize - 1 && grid[i - 1][j].tileType === 'wall' && grid[i + 1][j].tileType === 'wall';
    }

    isInvalidHorizontalDoor(grid: TileStructure[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isHorizontalDoor(grid, i, j, mapSize) &&
            !(
                j > 0 &&
                j < mapSize - 1 &&
                TERRAIN_DOOR_TILES.includes(grid[i][j - 1].tileType) &&
                TERRAIN_DOOR_TILES.includes(grid[i][j + 1].tileType)
            )
        );
    }

    isVerticalDoor(grid: TileStructure[][], i: number, j: number, mapSize: number): boolean {
        return j > 0 && j < mapSize - 1 && grid[i][j - 1].tileType === 'wall' && grid[i][j + 1].tileType === 'wall';
    }

    isInvalidVerticalDoor(grid: TileStructure[][], i: number, j: number, mapSize: number): boolean {
        return (
            this.isVerticalDoor(grid, i, j, mapSize) &&
            !(
                i > 0 &&
                i < mapSize - 1 &&
                TERRAIN_DOOR_TILES.includes(grid[i - 1][j].tileType) &&
                TERRAIN_DOOR_TILES.includes(grid[i + 1][j].tileType)
            )
        );
    }

    allDoorsValid(grid: TileStructure[][], doorTiles: [number, number][], mapSize: number): boolean {
        for (const [i, j] of doorTiles) {
            const isHorizontal = this.isHorizontalDoor(grid, i, j, mapSize);
            const isVertical = this.isVerticalDoor(grid, i, j, mapSize);
            const isInvalidHorizontal = this.isInvalidHorizontalDoor(grid, i, j, mapSize);
            const isInvalidVertical = this.isInvalidVerticalDoor(grid, i, j, mapSize);

            if (isInvalidHorizontal || isInvalidVertical || (!isHorizontal && !isVertical)) {
                return false;
            }
        }
        return true;
    }

    allGroundTilesAccessible(grid: TileStructure[][], terrainDoorTiles: [number, number][], mapSize: number): boolean {
        const directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const visited = new Set<string>();
        const queue: [number, number][] = [terrainDoorTiles[0]];
        visited.add(terrainDoorTiles[0].toString());

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (
                    nx >= 0 &&
                    ny >= 0 &&
                    nx < mapSize &&
                    ny < mapSize && // check n is inside the grid
                    !visited.has([nx, ny].toString()) && // check n is not visited
                    TERRAIN_DOOR_TILES.includes(grid[nx][ny].tileType) // check n is a terrain or door tile
                ) {
                    queue.push([nx, ny]);
                    visited.add([nx, ny].toString());
                }
            }
        }

        for (const [x, y] of terrainDoorTiles) {
            if (!visited.has([x, y].toString())) {
                return false;
            }
        }

        return true;
    }
}
