import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TileInfoModalComponent } from '@app/components/tile-info-modal/tile-info-modal.component';
import { GameTile, ShortestPathByTile } from '@common/game-structure';
import { BaseStateService } from './base-state.service';
import { RANDOM_TILE_INDEX, TEST_AVAILABLE_TILES, TEST_SHORTEST_PATH, TEST_SHORTEST_PATH_BY_INDEX } from './constants';
import { GameControllerService } from './game-controller.service';
/* eslint-disable */

describe('BaseStateService', () => {
    let service: BaseStateService;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameControllerSpy: jasmine.SpyObj<GameControllerService>;

    beforeEach(() => {
        const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
        const gameControllerSpyObj = jasmine.createSpyObj('GameControllerService', ['isActivePlayer']);

        TestBed.configureTestingModule({
            providers: [
                { provide: MatDialog, useValue: dialogSpyObj },
                { provide: GameControllerService, useValue: gameControllerSpyObj },
                BaseStateService,
            ],
        });

        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        gameControllerSpy = TestBed.inject(GameControllerService) as jasmine.SpyObj<GameControllerService>;
        service = TestBed.inject(BaseStateService);
    });

    it('should set available tiles', () => {
        const tiles = TEST_AVAILABLE_TILES;
        service.setAvailableTiles(tiles);
        expect(service.getAvailableTiles()).toEqual(tiles);
    });

    it('should reset available tiles', () => {
        service.setAvailableTiles(TEST_AVAILABLE_TILES);
        service.resetAvailableTiles();
        expect(service.getAvailableTiles()).toEqual([]);
    });

    it('should check if available tiles include a specific index', () => {
        service.setAvailableTiles(TEST_AVAILABLE_TILES);
        expect(service.availablesTilesIncludes(2)).toBeTrue();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.availablesTilesIncludes(4)).toBeFalse();
    });

    it('should set and get shortest path by tile', () => {
        const shortestPath: ShortestPathByTile = TEST_SHORTEST_PATH;
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByTile()).toEqual(shortestPath);
    });

    it('should reset shortest path by tile', () => {
        service.setShortestPathByTile(TEST_SHORTEST_PATH);
        service.resetShortestPathByTile();
        expect(service.getShortestPathByTile()).toEqual({});
    });

    it('should reset movement previsualization', () => {
        service.setAvailableTiles(TEST_AVAILABLE_TILES);
        service.setShortestPathByTile(TEST_SHORTEST_PATH);
        service.resetMovementPrevisualization();
        expect(service.getAvailableTiles()).toEqual([]);
        expect(service.getShortestPathByTile()).toEqual({});
    });

    it('should open dialog on right click if active player', () => {
        const tile = { idx: 1, tileType: 'ice' } as GameTile;
        gameControllerSpy.isActivePlayer.and.returnValue(true);
        service.onRightClick(tile);
        expect(dialogSpy.open).toHaveBeenCalledWith(TileInfoModalComponent, { data: { tile } });
    });

    it('should not open dialog on right click if not active player', () => {
        const tile = { idx: 1, tileType: 'ice' } as GameTile;
        gameControllerSpy.isActivePlayer.and.returnValue(false);
        service.onRightClick(tile);
        expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('should get shortest path by index', () => {
        const shortestPath: ShortestPathByTile = TEST_SHORTEST_PATH_BY_INDEX;
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByIndex(1)).toEqual(shortestPath[1]);
        expect(service.getShortestPathByIndex(2)).toEqual(shortestPath[2]);
    });

    it('should return undefined for non-existing index in shortest path', () => {
        const shortestPath: ShortestPathByTile = TEST_SHORTEST_PATH;
        service.setShortestPathByTile(shortestPath);
        expect(service.getShortestPathByIndex(RANDOM_TILE_INDEX)).toBeUndefined();
    });

    it('should initialize previsualization with accessible tiles', () => {
        const accessibleTiles: ShortestPathByTile = TEST_SHORTEST_PATH;
        service.initializePrevisualization(accessibleTiles);
        expect(() => service.initializePrevisualization(accessibleTiles)).not.toThrow();
    });

    it('should initialize previsualization with accessible tile indices', () => {
        const accessibleTiles: number[] = TEST_AVAILABLE_TILES;
        service.initializePrevisualization(accessibleTiles);
        expect(() => service.initializePrevisualization(accessibleTiles)).not.toThrow();
    });
});
