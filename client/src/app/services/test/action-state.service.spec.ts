import { TestBed } from '@angular/core/testing';

import { GameState } from '@common/game-structure';
import { ActionStateService } from '../action-state.service';
import { TEST_AVAILABLE_TILES } from '../constants';
import { GameControllerService } from '../game-controller.service';
/* eslint-disable */

describe('ActionStateService', () => {
    let service: ActionStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ActionStateService, GameControllerService],
        });
        service = TestBed.inject(ActionStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize previsualization with accessible tiles', () => {
        const accessibleTiles = TEST_AVAILABLE_TILES;
        spyOn(service, 'setAvailableTiles');
        service.initializePrevisualization(accessibleTiles);
        expect(service.setAvailableTiles).toHaveBeenCalledWith(accessibleTiles);
    });

    it('should return NOTPLAYING state on mouse down if tile is accessible', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(true);
        spyOn(service.gameController, 'requestAction');
        const result = service.onMouseDown(1);
        expect(service.availablesTilesIncludes).toHaveBeenCalledWith(1);
        expect(service.gameController.requestAction).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.NOTPLAYING);
    });

    it('should return MOVING state on mouse down if tile is not accessible', () => {
        spyOn(service, 'availablesTilesIncludes').and.returnValue(false);
        const result = service.onMouseDown(1);
        expect(service.availablesTilesIncludes).toHaveBeenCalledWith(1);
        expect(result).toBe(GameState.MOVING);
    });
});
