import { PlayerAttribute } from '@common/player';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { ActionHandlerService } from './action-handler/action-handler.service';
import { ActiveGamesService } from './active-games/active-games.service';
import { GameService } from './game.service';
import { LogSenderService } from './log-sender/log-sender.service';
import { MatchService } from './match.service';
import { UniqueItemRandomizerService } from './unique-item-randomiser/unique-item-randomiser.service';
import { VirtualPlayerService } from './virtual-player/virtual-player.service';

/* eslint-disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable object-shorthand */

describe('MatchService', () => {
    let service: MatchService;
    let gameService: GameService;
    let client: Socket;
    let server: Server;

    beforeEach(async () => {
        client = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchService,
                {
                    provide: LogSenderService,
                    useValue: {},
                },
                {
                    provide: VirtualPlayerService,
                    useValue: {},
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
                {
                    provide: ActiveGamesService,
                    useValue: {},
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: UniqueItemRandomizerService,
                    useValue: {},
                },
                {
                    provide: GameService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: Server,
                    useValue: {
                        sockets: {
                            sockets: new Map(),
                        },
                        to: jest.fn().mockReturnThis(),
                        emit: jest.fn(),
                    },
                },
                {
                    provide: Socket,
                    useValue: {
                        id: '123',
                        join: jest.fn(),
                        emit: jest.fn(),
                        leave: jest.fn(),
                        disconnect: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MatchService>(MatchService);
        gameService = module.get<GameService>(GameService);
        server = module.get<Server>(Server);
        client = module.get<Socket>(Socket);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a room', async () => {
        const gameId = 'gameId';
        const game = {
            mapSize: '10',
        } as any;
        const maxPlayers = 2;
        const roomId = '123';
        const player = {
            id: client.id,
            name: 'playerName',
            isAdmin: true,
            avatar: 'avatar',
            attributes: {
                health: 100,
                speed: 100,
                attack: 100,
                defense: 100,
                dice: '6',
            } as PlayerAttribute,
            abandoned: true,
            isActive: true,
            wins: 0,
            inventory: [],
            stats: {
                combatCount: 0,
                defeatCount: 0,
                escapeCount: 0,
                totalHealthLost: 0,
                totalHealthTaken: 0,
                uniqueItemsCollected: 0,
                victoryCount: 0,
                visitedTiles: new Set(),
                visitedTilesPercent: 0,
            } as any,
            isVirtual: false,
        };

        const room = {
            gameId,
            id: roomId,
            players: [player],
            isLocked: false,
            maxPlayers: 2,
            messages: [],
        };

        jest.spyOn(service, 'generateMatchId').mockReturnValue(roomId);
        jest.spyOn(service, 'getGame').mockResolvedValue(game);
        jest.spyOn(service, 'updatePlayers').mockImplementation();

        const playerData = { playerName: player.name, avatar: 'avatar', attributes: player.attributes, virtualProfile: '' };
        await service.createRoom(server, client, gameId, playerData);

        expect(service.rooms.get(roomId)).toEqual(room);
        expect(client.join).toHaveBeenCalledWith(roomId);
        expect(client.emit).toHaveBeenCalledWith('roomJoined', { roomId, playerId: client.id });
        expect(service.updatePlayers).toHaveBeenCalledWith(server, room);
    });

    it('should set max players for map size 10', () => {
        const mapSize = '10';

        const maxPlayers = service.setMaxPlayers(mapSize);

        expect(maxPlayers).toBe(2);
    });

    it('should set max players for map size 15', () => {
        const mapSize = '15';

        const maxPlayers = service.setMaxPlayers(mapSize);

        expect(maxPlayers).toBe(4);
    });

    it('should set max players for map size 20', () => {
        const mapSize = '20';

        const maxPlayers = service.setMaxPlayers(mapSize);

        expect(maxPlayers).toBe(6);
    });

    it('should set max players to 0 for invalid map size', () => {
        const mapSize = '30';

        const maxPlayers = service.setMaxPlayers(mapSize);

        expect(maxPlayers).toBe(0);
    });

    it('should check if room code is valid and emit true', () => {
        const roomId = '123';

        service.rooms.set(roomId, {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: false,
            maxPlayers: 2,
            messages: [],
        });

        service.isCodeValid(roomId, client);

        expect(client.emit).toHaveBeenCalledWith('validRoom', true);
    });

    it('should check if room code is valid and emit false', () => {
        const roomId = '123';

        service.rooms.set(roomId, {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: true,
            maxPlayers: 2,
            messages: [],
        });

        service.isCodeValid(roomId, client);

        expect(client.emit).toHaveBeenCalledWith('validRoom', false);
    });

    it('should check if room is locked and return lock status', () => {
        const roomId = '123';

        service.rooms.set(roomId, {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: true,
            maxPlayers: 2,
            messages: [],
        });

        service.isRoomLocked(roomId, client);

        expect(client.emit).toHaveBeenCalledWith('isRoomLocked', true);
    });

    it('should not return lock status if room does not exist', () => {
        const roomId = '123';

        service.isRoomLocked(roomId, client);

        expect(client.emit).not.toHaveBeenCalled();
    });

    it('should get all players in room', () => {
        const roomId = '123';

        service.rooms.set(roomId, {
            gameId: 'gameId',
            id: roomId,
            players: [
                {
                    id: '123',
                    name: 'playerName',
                    isAdmin: true,
                    avatar: 'avatar',
                    attributes: {
                        health: 100,
                        speed: 100,
                        attack: 100,
                        defense: 100,
                        dice: '6',
                    },
                    isActive: false,
                    abandoned: false,
                    wins: 0,
                    inventory: [],
                    stats: {} as any,
                    isVirtual: false,
                },
            ],
            isLocked: true,
            maxPlayers: 2,
            messages: [],
        });

        service.getAllPlayersInRoom(roomId, client);

        expect(client.emit).toHaveBeenCalledWith('getPlayers', [
            {
                id: '123',
                name: 'playerName',
                isAdmin: true,
                avatar: 'avatar',
                attributes: {
                    health: 100,
                    speed: 100,
                    attack: 100,
                    defense: 100,
                    dice: '6',
                },
                abandoned: false,
                isActive: false,
                wins: 0,
                inventory: [],
                stats: {} as any,
                isVirtual: false,
            },
        ]);
    });

    it('should not join room if room does not exist', async () => {
        const roomId = '123';
        const playerName = 'playerName';
        const avatar = 'avatar';
        const attributes = {
            health: 100,
            speed: 100,
            attack: 100,
            defense: 100,
            dice: '6',
        };

        const playerData = { playerName, avatar, attributes, virtualProfile: '' };
        await service.joinRoom(server, client, roomId, playerData, false);

        expect(client.emit).toHaveBeenCalledWith('error', 'Room not found');
    });

    it('should not join room if room is locked', async () => {
        const roomId = '123';
        const playerName = 'playerName';
        const avatar = 'avatar';
        const attributes = {
            health: 100,
            speed: 100,
            attack: 100,
            defense: 100,
            dice: '6',
        };

        const room = {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: true,
            maxPlayers: 2,
            messages: [],
        };

        service.rooms.set(roomId, room);

        const playerData = { playerName, avatar, attributes, virtualProfile: '' };
        await service.joinRoom(server, client, roomId, playerData, false);

        expect(client.emit).toHaveBeenCalledWith('error', 'Room is locked');
    });

    it('should join room', async () => {
        const roomId = '123';
        const playerName = 'playerName';
        const avatar = 'avatar';
        const attributes = {
            health: 100,
            speed: 100,
            attack: 100,
            defense: 100,
            dice: '6',
        };

        const room = {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: false,
            maxPlayers: 2,
            messages: [],
        };

        service.rooms.set(roomId, room);

        jest.spyOn(service, 'checkAndSetPlayerName').mockReturnValue(playerName);
        jest.spyOn(service, 'updatePlayers').mockImplementation();

        const playerData = { playerName, avatar, attributes, virtualProfile: '' };
        await service.joinRoom(server, client, roomId, playerData, false);

        expect(room.players).toEqual([
            {
                id: client.id,
                name: playerName,
                isAdmin: false,
                avatar,
                attributes,
                abandoned: true,
                isActive: true,
                inventory: [],
                stats: {
                    combatCount: 0,
                    defeatCount: 0,
                    escapeCount: 0,
                    totalHealthLost: 0,
                    totalHealthTaken: 0,
                    uniqueItemsCollected: 0,
                    victoryCount: 0,
                    visitedTiles: new Set(),
                    visitedTilesPercent: 0,
                } as any,
                virtualProfile: '',
                wins: 0,
                isVirtual: false,
            },
        ]);
    });

    it('should lock room if max players reached', async () => {
        const roomId = '123';
        const playerName = 'playerName';
        const avatar = 'avatar';
        const attributes = {
            health: 100,
            speed: 100,
            attack: 100,
            defense: 100,
            dice: '6',
        };

        const room = {
            gameId: 'gameId',
            id: roomId,
            players: [
                {
                    id: '123',
                    name: 'playerName',
                    isAdmin: true,
                    avatar: 'avatar',
                    attributes: {
                        health: 100,
                        speed: 100,
                        attack: 100,
                        defense: 100,
                        dice: '6',
                    },
                    isActive: true,
                    abandoned: true,
                    wins: 0,
                    inventory: [],
                    stats: {} as any,
                    isVirtual: false,
                },
            ],
            isLocked: false,
            maxPlayers: 2,
            messages: [],
        };

        service.rooms.set(roomId, room);

        jest.spyOn(service, 'checkAndSetPlayerName').mockReturnValue(playerName);
        jest.spyOn(service, 'updatePlayers').mockImplementation();

        const playerData = { playerName, avatar, attributes, virtualProfile: '' };
        await service.joinRoom(server, client, roomId, playerData, false);

        expect(room.isLocked).toBe(true);
    });

    it('should join room with virtual player and generate ID', async () => {
        const roomId = '123';
        const playerName = 'playerName';
        const avatar = 'avatar';
        const attributes = {
            health: 100,
            speed: 100,
            attack: 100,
            defense: 100,
            dice: '6',
        };

        const room = {
            gameId: 'gameId',
            id: roomId,
            players: [],
            isLocked: false,
            maxPlayers: 2,
            messages: [],
        };

        service.rooms.set(roomId, room);

        jest.spyOn(service, 'checkAndSetPlayerName').mockReturnValue(playerName);
        jest.spyOn(service, 'updatePlayers').mockImplementation();
        const generatedId = 'generated-id';
        jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue(generatedId) }));

        const playerData = { playerName, avatar, attributes, virtualProfile: '' };
        service.joinRoom(server, client, roomId, playerData, true);

        expect(room.players[0].name).toEqual(playerName);
    });

    it('should update players', () => {
        const room = {
            id: '123',
            players: [
                {
                    id: '123',
                    name: 'playerName',
                    isAdmin: true,
                    avatar: 'avatar',
                    attributes: {
                        health: 100,
                        speed: '100',
                        attack: 100,
                        defense: 100,
                    },
                },
            ],
        } as any;

        service.updatePlayers(server, room);

        expect(server.to).toHaveBeenCalledWith(room.id);
        expect(server.emit).toHaveBeenCalledWith('updatePlayers', room.players);
    });

    it('should check and set player name', () => {
        const room = {
            players: [
                {
                    name: 'playerName',
                },
            ],
        } as any;

        const updatedRoom = {
            players: [
                {
                    name: 'playerName',
                },
                {
                    name: 'playerName-2',
                },
            ],
        } as any;

        const playerName = 'playerName';

        const checkedPlayerName = service.checkAndSetPlayerName(room, playerName);
        const checkedPlayerNameAgain = service.checkAndSetPlayerName(updatedRoom, playerName);

        expect(checkedPlayerName).toBe('playerName-2');
        expect(checkedPlayerNameAgain).toBe('playerName-3');
    });

    it('should not leave room if room does not exist', () => {
        const roomId = '123';

        service.leaveRoom(server, client, roomId);

        expect(client.leave).not.toHaveBeenCalled();
    });

    it('should leave room', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                },
            ],
        } as any;

        service.rooms.set(roomId, room);

        service.leaveRoom(server, client, roomId);

        expect(client.leave).toHaveBeenCalledWith(roomId);
        expect(room.players).toEqual([]);
    });

    it('should remove every player from room if emitting client id is admin (first in list)', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    name: 'playerName',
                    isAdmin: true,
                },
                {
                    id: '456',
                    name: 'playerName2',
                    isAdmin: false,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);
        server.sockets.sockets.set('456', { id: '456', leave() {}, emit() {}, disconnect() {} } as any);

        service.leaveRoom(server, client, roomId);

        expect(room.players).toEqual([]);
    });

    it('should lock room', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);

        service.lockRoom(server, client, roomId);

        expect(room.isLocked).toBe(true);
    });

    it('should not lock room if player is not admin', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: false,
                },
            ],
            isLocked: false,
        } as any;

        service.rooms.set(roomId, room);

        service.lockRoom(server, client, roomId);

        expect(room.isLocked).toBe(false);
    });

    it('should not lock room if room does not exist', () => {
        const roomId = '123';

        service.lockRoom(server, client, roomId);

        expect(server.to).not.toHaveBeenCalled();
    });

    it('should unlock room', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
            ],
            isLocked: true,
        } as any;

        service.rooms.set(roomId, room);

        service.unlockRoom(server, client, roomId);

        expect(room.isLocked).toBe(false);
    });

    it('should not unlock room if player is not admin', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: false,
                },
            ],
            isLocked: true,
        } as any;

        service.rooms.set(roomId, room);

        service.unlockRoom(server, client, roomId);

        expect(room.isLocked).toBe(true);
    });

    it('should not unlock room if room does not exist', () => {
        const roomId = '123';

        service.unlockRoom(server, client, roomId);

        expect(server.to).not.toHaveBeenCalled();
    });

    it('should not unlock room if max players reached', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
                {
                    id: '456',
                    isAdmin: false,
                },
            ],
            isLocked: true,
            maxPlayers: 2,
        } as any;

        service.rooms.set(roomId, room);

        service.unlockRoom(server, client, roomId);

        expect(room.isLocked).toBe(true);
    });

    it('should kick player', () => {
        const roomId = '123';
        const playerId = '456';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
                {
                    id: '456',
                    isAdmin: false,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);
        server.sockets.sockets.set('456', { id: '456', leave() {}, emit() {}, disconnect() {} } as any);

        service.kickPlayer(server, client, roomId, playerId);

        expect(room.players).toEqual([
            {
                id: '123',
                isAdmin: true,
            },
        ]);
    });

    it('should not kick player if player is not admin', () => {
        const roomId = '123';
        const playerId = '456';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: false,
                },
                {
                    id: '456',
                    isAdmin: false,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);

        service.kickPlayer(server, client, roomId, playerId);

        expect(room.players).toEqual([
            {
                id: '123',
                isAdmin: false,
            },
            {
                id: '456',
                isAdmin: false,
            },
        ]);
    });

    it('should not kick player if room does not exist', () => {
        const roomId = '123';
        const playerId = '456';

        service.kickPlayer(server, client, roomId, playerId);

        expect(server.to).not.toHaveBeenCalled();
    });

    it('should leave all rooms', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                },
            ],
        } as any;

        service.rooms.set(roomId, room);
        jest.spyOn(service, 'leaveRoom').mockImplementation();

        service.leaveAllRooms(server, client);

        expect(service.leaveRoom).toHaveBeenCalledWith(server, client, roomId);
    });

    it('should generate match id', () => {
        jest.spyOn(Math, 'floor').mockReturnValueOnce(1234);
        service.rooms.set('1234', {} as any);
        const matchId = service.generateMatchId();

        expect(matchId).toHaveLength(4);
    });

    it('should start game', () => {
        const roomId = '123';

        const room = {
            gameId: 'gameId',
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
                {
                    id: '456',
                    isAdmin: false,
                },
            ],
            isLocked: true,
        } as any;

        service.rooms.set(roomId, room);

        service.startGame(server, client, roomId);

        expect(server.to).toHaveBeenCalledWith(roomId);
        expect(server.emit).toHaveBeenCalledWith('gameStarted', {
            gameId: 'gameId',
            players: [
                { id: '123', isAdmin: true },
                { id: '456', isAdmin: false },
            ],
        });
    });

    it("should not start game if there's less than 2 players", () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);

        service.startGame(server, client, roomId);

        expect(server.to).not.toHaveBeenCalled();
        expect(client.emit).toHaveBeenCalled();
    });

    it('should not start game if game is not locked', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    isAdmin: true,
                },
                {
                    id: '456',
                    isAdmin: false,
                },
            ],
            isLocked: false,
        } as any;

        service.rooms.set(roomId, room);

        service.startGame(server, client, roomId);

        expect(server.to).not.toHaveBeenCalled();
        expect(client.emit).toHaveBeenCalled();
    });

    it('should get game', async () => {
        const gameId = 'gameId';

        const game = {
            id: gameId,
        } as any;

        jest.spyOn(gameService, 'get').mockResolvedValue(game);

        const result = await service.getGame(client, gameId);

        expect(result).toEqual(game);
    });

    it('should send a room message', () => {
        const roomId = '123';
        const playerName = 'playerName';
        const message = 'message';
        const date = 'date';
        const player = {
            name: playerName,
            id: '123',
            isAdmin: true,
        };

        const room = {
            id: roomId,
            players: [player],
            messages: [],
        } as any;

        service.rooms.set(roomId, room);

        service.roomMessage(server, client, roomId, message, date);
        const messageData = { name: playerName, message, date };

        expect(room.messages).toEqual([messageData]);
        expect(server.emit).toHaveBeenCalledWith('singleMessage', messageData);
    });

    it('should load all messages', () => {
        const roomId = '123';
        const messages = [
            {
                name: 'playerName',
                message: 'message',
                date: 'randomDate',
            },
        ];

        const room = {
            id: roomId,
            messages: messages,
        } as any;

        service.rooms.set(roomId, room);

        service.loadAllMessages(client, roomId);

        expect(client.emit).toHaveBeenCalledWith('loadAllMessages', { messages });
    });

    it('should get max players', () => {
        const roomId = '123';

        const room = {
            id: roomId,
            maxPlayers: 2,
        } as any;

        service.rooms.set(roomId, room);

        service.getMaxPlayers(roomId, client);

        expect(client.emit).toHaveBeenCalledWith('maxPlayers', 2);
    });

    it('should remove virtual player without emitting', () => {
        const roomId = '123';
        const playerId = '456';

        const room = {
            id: roomId,
            players: [
                {
                    id: '123',
                    name: 'playerName',
                    isAdmin: true,
                    avatar: 'avatar',
                    attributes: {
                        health: 100,
                        speed: 100,
                        attack: 100,
                        defense: 100,
                        dice: '6',
                    },
                    abandoned: false,
                    isActive: false,
                    wins: 0,
                    inventory: [],
                    stats: {} as any,
                    isVirtual: false,
                },
                {
                    id: '456',
                    name: 'playerName',
                    isAdmin: false,
                    avatar: 'avatar',
                    attributes: {
                        health: 100,
                        speed: 100,
                        attack: 100,
                        defense: 100,
                        dice: '6',
                    },
                    abandoned: false,
                    isActive: false,
                    wins: 0,
                    inventory: [],
                    stats: {} as any,
                    isVirtual: true,
                },
            ],
        } as any;

        service.rooms.set(roomId, room);

        service.kickPlayer(server, client, roomId, playerId);

        expect(room.players).toEqual([
            {
                id: '123',
                name: 'playerName',
                isAdmin: true,
                avatar: 'avatar',
                attributes: {
                    health: 100,
                    speed: 100,
                    attack: 100,
                    defense: 100,
                    dice: '6',
                },
                abandoned: false,
                isActive: false,
                wins: 0,
                inventory: [],
                stats: {} as any,
                isVirtual: false,
            },
        ]);

        expect(server.to).toHaveBeenCalledWith(roomId);
        expect(server.emit).toHaveBeenCalledWith('updatePlayers', room.players);
    });

    it('should not leave room if client is undefined', () => {
        const roomId = '123';

        service.rooms.set(roomId, {
            id: roomId,
            players: [
                {
                    id: '123',
                },
            ],
        } as any);

        service.leaveRoom(server, undefined as any, roomId);

        expect(server.to).not.toHaveBeenCalled();
    });
});
