import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionStateService } from '@app/services/action-state.service';
import { CombatStateService } from '@app/services/combat-state.service';
import { GameControllerService } from '@app/services/game-controller.service';
import { MapGameService } from '@app/services/map-game.service';
import { MovingStateService } from '@app/services/moving-state.service';
import { NotPlayingStateService } from '@app/services/not-playing-state.service';
import { GameMapComponent } from './game-map.component';
/* eslint-disable */

describe('GameMapComponent', () => {
    let component: GameMapComponent;
    let fixture: ComponentFixture<GameMapComponent>;
    let mapGameServiceStub: Partial<MapGameService>;

    beforeEach(async () => {
        mapGameServiceStub = {};

        await TestBed.configureTestingModule({
            imports: [GameMapComponent],
            providers: [
                { provide: MapGameService, useValue: mapGameServiceStub },
                NotPlayingStateService,
                GameControllerService,
                MovingStateService,
                ActionStateService,
                CombatStateService,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
