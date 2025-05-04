import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player, PlayerCoord, PlayerStats } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { LeaderboardComponent } from './leaderboard.component';
/* eslint-disable */

describe('LeaderboardComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeaderboardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LeaderboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update dataSource and afkPlayerIds correctly on ngOnChanges', () => {
        const player1: Player = {
            id: '1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar1.png',
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 5,
            stats: {} as PlayerStats,
            isVirtual: false,
            inventory: [],
        };

        const player2: Player = {
            id: '2',
            name: 'Player 2',
            isAdmin: false,
            avatar: 'avatar2.png',
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 3,
            stats: {} as PlayerStats,
            isVirtual: false,
            inventory: [],
        };

        const player3: Player = {
            id: '3',
            name: 'Player 3',
            isAdmin: false,
            avatar: 'avatar3.png',
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            stats: {} as PlayerStats,
            isActive: true,
            abandoned: false,
            wins: 2,
            isVirtual: false,
            inventory: [],
        };

        const playerCoord1: PlayerCoord = { player: player1, position: 1 };
        const playerCoord2: PlayerCoord = { player: player2, position: 2 };
        const playerCoord3: PlayerCoord = { player: player3, position: 3 };

        component.playerCoords = [playerCoord1, playerCoord2];
        component.afklist = [playerCoord3];
        component.activePlayer = player1;
        component.ngOnChanges();

        expect(component.dataSource).toEqual([player1, player2, player3]);
        expect(component.afkPlayerIds).toEqual([player3.id]);
    });

    it('should update dataSource correctly when activePlayer is not in playerCoords or afklist', () => {
        const player1: Player = {
            id: '1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar1.png',
            stats: {} as PlayerStats,
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 5,
            isVirtual: false,
            inventory: [],
        };

        const player2: Player = {
            id: '2',
            name: 'Player 2',
            isAdmin: false,
            avatar: 'avatar2.png',
            stats: {} as PlayerStats,
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 3,
            isVirtual: false,
            inventory: [],
        };

        const player3: Player = {
            id: '3',
            name: 'Player 3',
            isAdmin: false,
            avatar: 'avatar3.png',
            stats: {} as PlayerStats,
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 2,
            isVirtual: false,
            inventory: [],
        };

        const playerCoord2: PlayerCoord = { player: player2, position: 2 };
        const playerCoord3: PlayerCoord = { player: player3, position: 3 };

        component.playerCoords = [playerCoord2];
        component.afklist = [playerCoord3];
        component.activePlayer = player1;
        component.ngOnChanges();

        expect(component.dataSource).toEqual([player1, player2, player3]);
        expect(component.afkPlayerIds).toEqual([player3.id]);
    });

    it('should return true if player has FLAG_A in inventory', () => {
        const player: Player = {
            id: '1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar1.png',
            stats: {} as PlayerStats,
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 5,
            isVirtual: false,
            inventory: [ItemTypes.FLAG_A],
        };

        expect(component.hasFlag(player)).toBe(true);
    });

    it('should return false if player does not have FLAG_A in inventory', () => {
        const player: Player = {
            id: '1',
            name: 'Player 1',
            isAdmin: false,
            avatar: 'avatar1.png',
            stats: {} as PlayerStats,
            attributes: {
                health: 10,
                speed: 8,
                attack: 7,
                defense: 5,
                dice: '6',
            },
            isActive: true,
            abandoned: false,
            wins: 5,
            isVirtual: false,
            inventory: [],
        };

        expect(component.hasFlag(player)).toBe(false);
    });
});
