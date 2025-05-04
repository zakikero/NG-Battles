import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'dgram';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MovementService } from '@app/services/movement/movement.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
/* eslint-disable */
describe('DebugModeService', () => {
    let service: DebugModeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DebugModeService,
                ActiveGamesService,
                LogSenderService,
                ActionService,
                GameService,
                UniqueItemRandomizerService,
                MovementService,
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<DebugModeService>(DebugModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should turn on debug mode for a given room', () => {
        const roomId = 'room1';
        service.debugModeOn(roomId);
        expect(service.getDebugMode(roomId)).toBe(true);
    });
    it('should turn off debug mode for a given room', () => {
        const roomId = 'room1';
        service.debugModeOn(roomId);
        service.debugModeOff(roomId);
        expect(service.getDebugMode(roomId)).toBe(false);
    });

    it('should switch debug mode on if it is off', () => {
        const roomId = 'room1';
        service.debugModeOff(roomId);
        service.switchDebugMode(roomId);
        expect(service.getDebugMode(roomId)).toBe(true);
    });

    it('should switch debug mode off if it is on', () => {
        const roomId = 'room1';
        service.debugModeOn(roomId);
        service.switchDebugMode(roomId);
        expect(service.getDebugMode(roomId)).toBe(false);
    });
    it('should handle disconnect and emit responseDebugMode with correct data', () => {
        const serverMock = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;
        const clientMock = {} as Socket;
        const roomId = 'room1';
        const isAdmin = true;

        service.debugModeOn(roomId);
        service.handleDisconnect(serverMock as any, clientMock as any, isAdmin, roomId);

        expect(service.getDebugMode(roomId)).toBe(false);
        expect(serverMock.to).toHaveBeenCalledWith(roomId);
        expect(serverMock.emit).toHaveBeenCalledWith('responseDebugMode', { isDebugMode: false });
    });

    it('should handle teleport player and emit teleportResponse with correct data', () => {
        const serverMock = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;
        const data = { roomId: 'room1', playerId: 'player1', index: 5 };
        const gameInstanceMock = {
            playersCoord: [{ player: { id: 'player1' }, position: 1 }],
            currentPlayerMoveBudget: 3,
            game: {
                map: [
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                    { hasPlayer: true, tileType: TileTypes.BASIC },
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                ],
            },
        } as any;
        jest.spyOn(service, 'getDebugMode').mockReturnValue(true);
        jest.spyOn(service['activeGamesService'], 'getActiveGame').mockReturnValue(gameInstanceMock);
        jest.spyOn(service['action'], 'availablePlayerMoves').mockReturnValue(['move1', 'move2'] as any);

        service.handleTeleportPlayer(data, serverMock as any);

        expect(service['activeGamesService'].getActiveGame).toHaveBeenCalledWith(data.roomId);
        expect(service['action'].availablePlayerMoves).toHaveBeenCalledWith(data.playerId, data.roomId);
        expect(serverMock.to).toHaveBeenCalledWith(data.roomId);
        expect(serverMock.emit).toHaveBeenCalledWith('teleportResponse', {
            playerId: data.playerId,
            newPosition: data.index,
            availableMoves: ['move1', 'move2'],
            currentPlayerMoveBudget: 3,
        });
        expect(gameInstanceMock.game.map[1].hasPlayer).toBe(false);
        expect(gameInstanceMock.game.map[5].hasPlayer).toBe(true);
        expect(gameInstanceMock.playersCoord[0].position).toBe(5);
    });
});
