import { Coord } from '@app/data-structures/player';
import { TileTypesValues } from '@app/data-structures/tile-types-values.enum';
import { GameStructure, TileStructure } from '@common/game-structure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MovementService {
    private invalidTileTypes: string[] = ['wall', 'doorClosed'];

    isValidPosition(moveBudget: number, game: GameStructure, coord: Coord): boolean {
        const mapSize: number = parseInt(game.mapSize, 10);
        const mapTile: TileStructure = game.map[coord.y * mapSize + coord.x];

        if (coord.x < 0 || coord.x >= mapSize || coord.y < 0 || coord.y >= mapSize) {
            return false;
        }

        if (this.invalidTileTypes.includes(mapTile.tileType) || mapTile.hasPlayer) {
            return false;
        }

        if (moveBudget < coord.distance) {
            return false;
        }
        return true;
    }

    tileValue(type: string): number {
        const tileTypeMap = {
            ice: TileTypesValues.ICE,
            water: TileTypesValues.WATER,
        };

        return tileTypeMap[type] ?? 1; // Default to FLOOR if type not found
    }
    convertToCoord(position: number, mapSize: number): Coord {
        const x = position % mapSize;
        const y = Math.floor(position / mapSize);
        return { x, y };
    }

    convertToPosition(coord: Coord, mapSize: number): number {
        return coord.y * mapSize + coord.x;
    }

    shortestPath(moveBudget: number, game: GameStructure, startPosition: number, endPosition: number): { moveCost: number; path: number[] } {
        const mapSize = parseInt(game.mapSize, 10);
        const startCoord = this.convertToCoord(startPosition, mapSize);
        const endCoord = this.convertToCoord(endPosition, mapSize);

        const map = game.map;
        const visited: boolean[][] = Array.from({ length: mapSize }, () => Array(mapSize).fill(false));
        const queue: Coord[] = [{ ...startCoord, distance: 0, parentNodes: [] }];
        let destinationNode: Coord | undefined;
        let found = false;

        visited[startCoord.x][startCoord.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();
            if (current.x === endCoord.x && current.y === endCoord.y) {
                destinationNode = current;
                found = true;
                break;
            }

            for (const [dx, dy] of [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ]) {
                const x = current.x + dx;
                const y = current.y + dy;

                if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) continue;

                const totalDistance = current.distance + this.tileValue(map[y * mapSize + x].tileType);

                if (!visited[x][y] && this.isValidPosition(moveBudget, game, { x, y, distance: totalDistance } as Coord)) {
                    queue.push({
                        x,
                        y,
                        distance: totalDistance,
                        parentNodes: [...current.parentNodes, { x: current.x, y: current.y, distance: current.distance }],
                    });
                    visited[x][y] = true;
                }
            }

            queue.sort((a, b) => a.distance - b.distance);
        }
        const moveCost = destinationNode ? destinationNode.distance : 0;
        const path = found ? [...destinationNode.parentNodes.map((coord) => this.convertToPosition(coord, mapSize)), endPosition] : [];

        return { moveCost, path };
    }

    availableMoves(moveBudget: number, game: GameStructure, startPosition: number): { [key: number]: number[] } {
        const startCoord = this.convertToCoord(startPosition, parseInt(game.mapSize, 10));

        const map = game.map;
        const mapSize = parseInt(game.mapSize, 10);
        const coordPath = [];
        const visited: boolean[][] = Array.from({ length: mapSize }, () => Array(mapSize).fill(false));
        const queue: Coord[] = [{ ...startCoord, distance: 0 }];

        visited[startCoord.x][startCoord.y] = true;

        while (queue.length > 0) {
            const current = queue.shift();

            for (const [dx, dy] of [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ]) {
                const x = current.x + dx;
                const y = current.y + dy;

                if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) continue;

                const totalDistance = current.distance + this.tileValue(map[y * mapSize + x].tileType);

                if (!visited[x][y] && this.isValidPosition(moveBudget, game, { x, y, distance: totalDistance })) {
                    queue.push({ x, y, distance: totalDistance });
                    coordPath.push({ x, y });
                    visited[x][y] = true;
                }
            }

            queue.sort((a, b) => a.distance - b.distance);
        }

        const temp = coordPath.reduce((structure, coord) => {
            const endPosition = this.convertToPosition(coord, mapSize);
            structure[endPosition] = this.shortestPath(moveBudget, game, startPosition, endPosition).path;
            return structure;
        }, {});

        return temp;
    }
}
