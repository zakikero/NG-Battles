import { TestBed } from '@angular/core/testing';

import { DELAY } from '@app/pages/game-page/constant';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { MOCK_PLAYER, MOCK_PLAYER_TWO, TEST_MOVE_BUDGET } from '../constants';
import { GameControllerService } from '../game-controller.service';

/* eslint-disable max-lines */

describe('GameControllerService', () => {
    let service: GameControllerService;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('SocketService', ['emit']);

        TestBed.configureTestingModule({
            providers: [GameControllerService, { provide: SocketService, useValue: { emit: spy } }],
        });

        service = TestBed.inject(GameControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set room and player IDs', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        expect(service.roomId).toBe('room1');
        expect(service.playerId).toBe(MOCK_PLAYER.id);
    });

    it('should initialize players and set active player', () => {
        const player1: Player = MOCK_PLAYER;

        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );

        expect(service.player).toBe(player1);
        expect(service.activePlayer).toBe(player1);
    });

    it('should initialize players and set other active player', () => {
        const player1: Player = MOCK_PLAYER;
        const player2: Player = MOCK_PLAYER_TWO;

        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            1,
        );

        expect(service.player).toBe(player1);
        expect(service.activePlayer).toBe(player2);
    });

    it('should update player coordinates', () => {
        const playerCoord: PlayerCoord = { player: MOCK_PLAYER, position: 2 };
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.updatePlayerCoords(playerCoord);
        expect(service.playerCoords[0].position).toBe(2);
    });

    it('should update player', () => {
        const updatedPlayer: Player = { ...MOCK_PLAYER, name: 'Updated Player' };
        const playerCoord: PlayerCoord = { player: updatedPlayer, position: 0 };
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.updatePlayer(playerCoord);
        expect(service.player.name).toBe('Updated Player');
    });

    it('should update player coordinates list', () => {
        const updatedPlayerCoord: PlayerCoord = { player: MOCK_PLAYER, position: 2 };
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.updatePlayerCoordsList([updatedPlayerCoord]);
        expect(service.playerCoords[0].position).toBe(2);
    });

    it('should get player coordinates', () => {
        const playerCoords: PlayerCoord[] = [
            { player: MOCK_PLAYER, position: 0 },
            { player: MOCK_PLAYER_TWO, position: 1 },
        ];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(playerCoords, 0);
        expect(service.getPlayerCoords()).toEqual(playerCoords);
    });

    it('should find player coordinate by ID', () => {
        const playerCoords: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        expect(service.findPlayerCoordById(MOCK_PLAYER.id)).toEqual(playerCoords[0]);
    });

    it('should set active player', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setActivePlayer(MOCK_PLAYER.id);
        expect(service.activePlayer).toBe(MOCK_PLAYER);
    });

    it('should check if active player', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setActivePlayer(MOCK_PLAYER.id);
        expect(service.isActivePlayer()).toBeTrue();
    });

    it('should remove player from player coordinates', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.removePlayerFromPlayerCoord(MOCK_PLAYER.id);
        expect(service.playerCoords.length).toBe(1);
    });

    it('should feed AFK list', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.findPlayerCoordById = jasmine.createSpy().and.returnValue({ player: MOCK_PLAYER, position: 0 });
        service.feedAfkList(MOCK_PLAYER.id);
        expect(service.afklist.length).toBe(1);
        expect(service.playerCoords.length).toBe(1);
    });

    it('should feed AFK list', () => {
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers([{ player: MOCK_PLAYER, position: 0 }], 0);
        service.findPlayerCoordById = jasmine.createSpy().and.returnValue({ player: MOCK_PLAYER, position: 0 });
        service.feedAfkList(MOCK_PLAYER.id);
        expect(service.afklist.length).toBe(1);
        expect(service.playerCoords.length).toBe(0);
    });

    it('should set fighters', () => {
        const fighters: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setFighters(fighters);
        expect(service.fighters).toEqual(fighters);
    });

    it('should reset fighters', () => {
        const fighters: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setFighters(fighters);
        service.resetFighters();
        expect(service.fighters.length).toBe(0);
    });

    it('should check if player is a fighter', () => {
        const fighters: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setFighters(fighters);
        expect(service.isFighter(fighters)).toBeTrue();
    });

    it('should check if in combat', () => {
        const fighters: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setFighters(fighters);
        expect(service.isInCombat()).toBeTrue();
    });

    it('should update active fighter', () => {
        const playerCoords: PlayerCoord[] = [{ player: MOCK_PLAYER, position: 0 }];
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.updateActiveFighter(playerCoords, MOCK_PLAYER.id);
        expect(service.activePlayer).toBe(MOCK_PLAYER);
    });

    it('should request game setup', (done) => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.requestGameSetup();
        setTimeout(() => {
            expect(service['socketService'].emit).toHaveBeenCalledWith('gameSetup', 'room1');
            done();
        }, DELAY);
    });

    it('should request start turn', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setActivePlayer(MOCK_PLAYER.id);
        service.requestStartTurn();
        expect(service['socketService'].emit).toHaveBeenCalledWith('startTurn', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should request move', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestMove(2);
        expect(service['socketService'].emit).toHaveBeenCalledWith('move', { roomId: 'room1', playerId: MOCK_PLAYER.id, endPosition: 2 });
    });

    it('should request end turn', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestEndTurn(true);
        expect(service['socketService'].emit).toHaveBeenCalledWith('endTurn', { roomId: 'room1', playerId: MOCK_PLAYER.id, lastTurn: true });
    });

    it('should request end turn with false value by default', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestEndTurn();
        expect(service['socketService'].emit).toHaveBeenCalledWith('endTurn', { roomId: 'room1', playerId: MOCK_PLAYER.id, lastTurn: false });
    });

    it('should request start action', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.setActivePlayer(MOCK_PLAYER.id);
        service.requestStartAction();
        expect(service['socketService'].emit).toHaveBeenCalledWith('startAction', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should request check action', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestCheckAction();
        expect(service['socketService'].emit).toHaveBeenCalledWith('checkAction', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should request action', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestAction(2);
        expect(service['socketService'].emit).toHaveBeenCalledWith('action', { roomId: 'room1', playerId: MOCK_PLAYER.id, target: 2 });
    });

    it('should request combat action', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestCombatAction('attack');
        expect(service['socketService'].emit).toHaveBeenCalledWith('attack', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should request available moves on budget', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestAvailableMovesOnBudget(TEST_MOVE_BUDGET);
        expect(service['socketService'].emit).toHaveBeenCalledWith('getAvailableMovesOnBudget', {
            roomId: 'room1',
            playerId: MOCK_PLAYER.id,
            currentBudget: TEST_MOVE_BUDGET,
        });
    });

    it('should request debug mode', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestDebugMode();
        expect(service['socketService'].emit).toHaveBeenCalledWith('requestDebugMode', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should turn off debug mode', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.turnOffDebugMode();
        expect(service['socketService'].emit).toHaveBeenCalledWith('turnOffDebugMode', { roomId: 'room1', playerId: MOCK_PLAYER.id });
    });

    it('should request update inventory', () => {
        spyOn(service['socketService'], 'emit');
        const allItems = [ItemTypes.AA1, ItemTypes.FLAG_A, ItemTypes.AF2];
        const droppedItem = ItemTypes.AF2;
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestUpdateInventory(allItems, droppedItem);
        expect(service['socketService'].emit).toHaveBeenCalledWith('updateInventory', {
            roomId: 'room1',
            playerId: MOCK_PLAYER.id,
            allItems,
            droppedItem,
        });
    });

    it('should request teleport', () => {
        spyOn(service['socketService'], 'emit');
        service.setRoom('room1', MOCK_PLAYER.id);
        service.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );
        service.requestTeleport(2);
        expect(service['socketService'].emit).toHaveBeenCalledWith('teleportPlayer', { roomId: 'room1', playerId: MOCK_PLAYER.id, index: 2 });
    });
});
