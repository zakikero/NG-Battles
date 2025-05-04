import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAttribute, PlayerCoord, PlayerStats } from '@common/player';
import { GamePanelComponent } from './game-panel.component';
/* eslint-disable */

describe('GamePanelComponent', () => {
    let component: GamePanelComponent;
    let fixture: ComponentFixture<GamePanelComponent>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(GamePanelComponent);
        component = fixture.componentInstance;
        component.playerCoords = [];
        component.game = 'game';
        component.activePlayer = {
            id: '1',
            name: 'Player1',
            isAdmin: false,
            avatar: 'avatar1.png',
            attributes: {} as PlayerAttribute,
            isActive: true,
            abandoned: false,
            wins: 0,
            stats: {} as PlayerStats,
            isVirtual: false,
            inventory: [],
        };
        fixture.detectChanges();
        component.mapSize = 10;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should update nPlayers when playerCoords changes', () => {
        component.playerCoords = [
            {
                player: {
                    id: '1',
                    name: 'Player1',
                    isAdmin: false,
                    avatar: 'avatar1.png',
                    attributes: {} as PlayerAttribute,
                    isActive: true,
                    abandoned: false,
                    wins: 0,
                },
                position: 1,
            } as PlayerCoord,
            {
                player: {
                    id: '2',
                    name: 'Player2',
                    isAdmin: false,
                    avatar: 'avatar2.png',
                    attributes: {} as PlayerAttribute,
                    isActive: true,
                    abandoned: false,
                    wins: 0,
                },
                position: 2,
            } as PlayerCoord,
        ];
        component.ngOnChanges();
        expect(component.nPlayers).toBe(2);
    });
});
