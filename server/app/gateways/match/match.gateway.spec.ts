import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchGateway } from './match.gateway';
/* eslint-disable */
describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchService: MatchService;
    let debugModeService: DebugModeService;
    let actionHandlerService: ActionHandlerService;

    beforeEach(async () => {
        const mockMatchService = {
            createRoom: jest.fn(),
            joinRoom: jest.fn(),
            isCodeValid: jest.fn(),
            isRoomLocked: jest.fn(),
            getAllPlayersInRoom: jest.fn(),
            leaveRoom: jest.fn(),
            lockRoom: jest.fn(),
            unlockRoom: jest.fn(),
            kickPlayer: jest.fn(),
            startGame: jest.fn(),
            getMaxPlayers: jest.fn(),
            roomMessage: jest.fn(),
            loadAllMessages: jest.fn(),
            leaveAllRooms: jest.fn(),
            rooms: {} as any,
        };

        const mockActionHandlerService = {
            handleQuitGame: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,

                { provide: ActionHandlerService, useValue: { handleQuitGame: jest.fn() } },

                ActionService,
                ActiveGamesService,
                { provide: DebugModeService, useValue: { switchDebugMode: jest.fn(), handleDisconnect: jest.fn(), handleTeleportPlayer: jest.fn() } },
                MovementService,
                { provide: LogSenderService, useValue: jest.fn() },
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: jest.fn() },
                { provide: MatchService, useValue: mockMatchService },
                { provide: ActionHandlerService, useValue: mockActionHandlerService },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
        matchService = module.get<MatchService>(MatchService);
        debugModeService = module.get<DebugModeService>(DebugModeService);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('should handle createRoom', () => {
        const data = { gameId: 'gameId', playerName: 'playerName', avatar: 'avatar', attributes: {} as any };
        const client = { id: 'clientId' } as any;
        gateway.handleCreateRoom(data, client);
        expect(matchService.createRoom).toHaveBeenCalledWith(gateway['server'], client, data.gameId, {
            playerName: data.playerName,
            avatar: data.avatar,
            attributes: data.attributes,
        });
    });
    it('should handle joinRoom', () => {
        const data = {
            roomId: 'roomId',
            playerName: 'playerName',
            avatar: 'avatar',
            attributes: {} as any,
            isVirtual: false,
            virtualProfile: 'virtualProfile',
        };
        const client = { id: 'clientId' } as any;
        gateway.handleJoinRoom(data, client);
        expect(matchService.joinRoom).toHaveBeenCalledWith(
            gateway['server'],
            client,
            data.roomId,
            {
                playerName: data.playerName,
                avatar: data.avatar,
                attributes: data.attributes,
                virtualProfile: data.virtualProfile,
            },
            data.isVirtual,
        );
    });
    it('should handle validRoom', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleValidRoom(roomId, client);
        expect(matchService.isCodeValid).toHaveBeenCalledWith(roomId, client);
    });
    it('should handle isRoomLocked', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleIsRoomLocked(roomId, client);
        expect(matchService.isRoomLocked).toHaveBeenCalledWith(roomId, client);
    });

    it('should handle getPlayers', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleGetPlayers(roomId, client);
        expect(matchService.getAllPlayersInRoom).toHaveBeenCalledWith(roomId, client);
    });
    it('should handle leaveRoom', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleLeaveRoom(roomId, client);
        expect(matchService.leaveRoom).toHaveBeenCalledWith(gateway['server'], client, roomId);
    });
    it('should handle lockRoom', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleLockRoom(roomId, client);
        expect(matchService.lockRoom).toHaveBeenCalledWith(gateway['server'], client, roomId);
    });

    it('should handle unlockRoom', () => {
        const roomId = 'roomId';
        const client = { id: 'clientId' } as any;
        gateway.handleUnlockRoom(roomId, client);
        expect(matchService.unlockRoom).toHaveBeenCalledWith(gateway['server'], client, roomId);
    });

    it('should handle kickPlayer', () => {
        const data = { roomId: 'roomId', playerId: 'playerId' };
        const client = { id: 'clientId' } as any;
        gateway.handleKickPlayer(data, client);
        expect(matchService.kickPlayer).toHaveBeenCalledWith(gateway['server'], client, data.roomId, data.playerId);
    });
    it('should handle startGame', () => {
        const data = { roomId: 'roomId' };
        const client = { id: 'clientId' } as any;
        gateway.startGame(data, client);
        expect(matchService.startGame).toHaveBeenCalledWith(gateway['server'], client, data.roomId);
    });

    it('should handle getMaxPlayers', () => {
        const data = { roomId: 'roomId' };
        const client = { id: 'clientId' } as any;
        gateway.getMaxPlayers(data, client);
        expect(matchService.getMaxPlayers).toHaveBeenCalledWith(data.roomId, client);
    });

    it('should handle roomMessage', () => {
        const data = { roomId: 'roomId', message: 'message', date: 'date' };
        const client = { id: 'clientId' } as any;
        gateway.roomMessage(data, client);
        expect(matchService.roomMessage).toHaveBeenCalledWith(gateway['server'], client, data.roomId, data.message, data.date);
    });

    it('should handle loadAllMessages', () => {
        const data = { roomId: 'roomId' };
        const client = { id: 'clientId' } as any;
        gateway.loadAllMessages(data, client);
        expect(matchService.loadAllMessages).toHaveBeenCalledWith(client, data.roomId);
    });
    it('should handle requestDebugMode', () => {
        const data = { roomId: 'roomId', playerId: 'playerId' };
        const mockServer = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
        gateway['server'] = mockServer;
        debugModeService.switchDebugMode = jest.fn();
        debugModeService.getDebugMode = jest.fn().mockReturnValue(true);
        const mockLogService = { sendDebugModeLog: jest.fn() };
        gateway['logService'] = mockLogService as any;

        gateway.handleDebugMode(data);

        expect(debugModeService.switchDebugMode).toHaveBeenCalledWith(data.roomId);
        expect(mockLogService.sendDebugModeLog).toHaveBeenCalledWith(mockServer, data.roomId, data.playerId, true);
        expect(mockServer.to).toHaveBeenCalledWith(data.roomId);
        expect(mockServer.emit).toHaveBeenCalledWith('responseDebugMode', { isDebugMode: true });
    });
    it('should handle teleportPlayer', () => {
        const data = { roomId: 'roomId', playerId: 'playerId', index: 1 };
        const mockServer = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
        gateway['server'] = mockServer;
        debugModeService.handleTeleportPlayer = jest.fn();

        gateway.handleTeleportPlayer(data);

        expect(debugModeService.handleTeleportPlayer).toHaveBeenCalledWith(data, mockServer);
    });
    it('should handle disconnect', () => {
        const client = { id: 'clientId' } as any;
        const mockServer = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
        gateway['server'] = mockServer;

        const mockRoom = {
            id: 'roomId',
            players: [{ id: 'clientId', isAdmin: true }],
        };
        matchService.rooms = [mockRoom] as any;

        gateway.handleDisconnect(client);

        expect(debugModeService.handleDisconnect).toHaveBeenCalledWith(mockServer, client, true, 'roomId');
        expect(actionHandlerService.handleQuitGame).toHaveBeenCalledWith(mockServer, client);
        expect(matchService.leaveAllRooms).toHaveBeenCalledWith(mockServer, client);
    });

    it('should initialize the server afterInit', () => {
        const mockServer = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
        gateway.afterInit(mockServer);
        expect(gateway['server']).toBe(mockServer);
    });
});
