import { ShortestPathByTile } from '@common/game-structure';

export interface State {
    getAvailableTiles(): number[];
    setAvailableTiles(availableTiles: number[]): void;

    availablesTilesIncludes(index: number): boolean;

    initializePrevizualisation(accessibleTiles: ShortestPathByTile | number[]): void;

    getShortestPathByIndex(index: number): number[];

    onRightClick(index: number): void;
    onMouseDown(index: number): void;
    onMouseEnter(): void;
}
