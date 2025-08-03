import { TestBed } from '@angular/core/testing';

import { GameState, ShortestPathByTile } from '@common/game-structure';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { BaseStateService } from '../base-state.service';
import { TEST_SHORTEST_PATH_BY_INDEX } from '../constants';
import { GameControllerService } from '../game-controller.service';
import { MovingStateService } from '../moving-state.service';
/* eslint-disable */

describe('MovingStateService', () => {
    let service: MovingStateService;
    let gameControllerService: GameControllerService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MovingStateService,
                { provide: BaseStateService, useValue: {} },
                {
                    provide: GameControllerService,
                    useValue: {
                        isDebugModeActive: false,
                        requestTeleport: jasmine.createSpy('requestTeleport'),
                        requestMove: jasmine.createSpy('requestMove'),
                        isActivePlayer: jasmine.createSpy('isActivePlayer'),
                    },
                },
            ],
        });
        service = TestBed.inject(MovingStateService);
        gameControllerService = TestBed.inject(GameControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize previsualization', () => {
        const accessibleTiles: ShortestPathByTile = TEST_SHORTEST_PATH_BY_INDEX;
        spyOn(service, 'setAvailableTiles');
        spyOn(service, 'setShortestPathByTile');

        service.initializePrevisualization(accessibleTiles);

        expect(service.setAvailableTiles).toHaveBeenCalledWith([1, 2]);
        expect(service.setShortestPathByTile).toHaveBeenCalledWith(accessibleTiles);
    });

    it('should handle onMouseDown with available tile', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(true);
        spyOn(service, 'resetMovementPrevisualization');

        const result = service.onMouseDown(1);

        expect(service.resetMovementPrevisualization).toHaveBeenCalled();
        expect(gameControllerService.requestMove).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.NOTPLAYING);
    });

    it('should handle onMouseDown with unavailable tile', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(false);

        const result = service.onMouseDown(1);

        expect(result).toBe(GameState.MOVING);
    });
    it('should handle onRightClick in debug mode with valid tile', () => {
        const tile = { idx: 1, tileType: 'FLOOR', hasPlayer: false, item: 'EMPTY' } as any;
        gameControllerService.isDebugModeActive = true;
        gameControllerService.isActivePlayer = jasmine.createSpy('isActivePlayer').and.returnValue(true);
        spyOn(service, 'checkIfTileIsValid').and.returnValue(true);
        spyOn((service as any).dialog, 'open');

        service.onRightClick(tile);

        expect(service.checkIfTileIsValid).toHaveBeenCalledWith(tile);
        expect(gameControllerService.requestTeleport).toHaveBeenCalledWith(tile.idx);
        expect((service as any).dialog.open).not.toHaveBeenCalled();
    });

    it('should handle onRightClick in non-debug mode', () => {
        const tile = { idx: 1, tileType: 'FLOOR', hasPlayer: false, item: 'EMPTY' } as any;
        gameControllerService.isDebugModeActive = false;
        gameControllerService.isActivePlayer = jasmine.createSpy('isActivePlayer').and.returnValue(true);
        spyOn((service as any).dialog, 'open');

        service.onRightClick(tile);

        expect((service as any).dialog.open).toHaveBeenCalled();
    });
    it('should return true for a valid tile', () => {
        const tile = { tileType: TileTypes.WATER, hasPlayer: false, item: ItemTypes.EMPTY } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeTrue();
    });

    it('should return false for a tile with type DOORCLOSED', () => {
        const tile = { tileType: TileTypes.DOORCLOSED, hasPlayer: false, item: ItemTypes.EMPTY } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeFalse();
    });

    it('should return false for a tile with type WALL', () => {
        const tile = { tileType: TileTypes.WALL, hasPlayer: false, item: ItemTypes.EMPTY } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeFalse();
    });

    it('should return false for a tile that has a player', () => {
        const tile = { tileType: TileTypes.BASIC, hasPlayer: true, item: ItemTypes.EMPTY } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeFalse();
    });

    it('should return false for a tile with an invalid item', () => {
        const tile = { tileType: TileTypes.BASIC, hasPlayer: false, item: ItemTypes.AA1 } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeFalse();
    });

    it('should return true for a tile with item STARTINGPOINT', () => {
        const tile = { tileType: TileTypes.BASIC, hasPlayer: false, item: ItemTypes.STARTINGPOINT } as any;

        const result = service.checkIfTileIsValid(tile);

        expect(result).toBeTrue();
    });
});
