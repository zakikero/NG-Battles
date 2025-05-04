import { TestBed } from '@angular/core/testing';

import { GameState } from '@common/game-structure';
import { CombatStateService } from './combat-state.service';
import { GameControllerService } from './game-controller.service';
/* eslint-disable */

describe('CombatStateService', () => {
    let service: CombatStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CombatStateService, GameControllerService],
        });
        service = TestBed.inject(CombatStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return GameState.COMBAT on mouse down', () => {
        const result = service.onMouseDown();
        expect(result).toBe(GameState.COMBAT);
    });
});
