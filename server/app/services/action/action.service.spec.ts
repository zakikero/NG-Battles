import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MovementService } from '@app/services/movement/movement.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
/* eslint-disable */

describe('ActionService', () => {
    let service: ActionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActiveGamesService,
                UniqueItemRandomizerService,
                InventoryService,
                LogSenderService,
                {
                    provide: ActionService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: GameService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: CombatService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                DebugModeService,
                {
                    provide: MovementService,
                    useValue: {
                        shortestPath: jest.fn(),
                        availableMoves: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ActionService>(ActionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('isCurrentPlayersTurn', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        });

        it("should return true if it is the current player's turn", () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: playerId } }],
            } as any;
            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.isCurrentPlayersTurn(roomId, playerId);

            expect(result).toBe(true);
        });

        it("should return false if it is not the current player's turn", () => {
            const roomId = 'room1';
            const playerId = 'player2';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: 'player1' } }],
            } as any;
            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.isCurrentPlayersTurn(roomId, playerId);

            expect(result).toBe(false);
        });
    });
    describe('getCurrentPlayer', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        });

        it('should return the current player ID', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: playerId } }],
            } as any;
            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.getCurrentPlayer(roomId);

            expect(result).toBe(playerId);
        });

        it('should return the correct player ID when turn is not zero', () => {
            const roomId = 'room1';
            const playerId = 'player2';
            const gameInstance = {
                turn: 1,
                playersCoord: [{ player: { id: 'player1' } }, { player: { id: playerId } }],
            } as any;
            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.getCurrentPlayer(roomId);

            expect(result).toBe(playerId);
        });
    });
    describe('movePlayer', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;
        let movementService: MovementService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {
                            shortestPath: jest.fn(),
                        },
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
            movementService = module.get<MovementService>(MovementService);
        });

        it('should return path from movement service', () => {
            const roomId = 'room1';
            const startPosition = 0;
            const endPosition = 2;
            const expectedPath = [0, 1, 2];
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'shortestPath').mockReturnValue({
                path: expectedPath,
                moveCost: 2,
            });

            const result = service.movePlayer(roomId, startPosition, endPosition);

            expect(result).toEqual(expectedPath);
            expect(movementService.shortestPath).toHaveBeenCalledWith(5, gameInstance.game, startPosition, endPosition);
        });

        it('should handle zero movement cost', () => {
            const roomId = 'room1';
            const startPosition = 1;
            const endPosition = 1;
            const expectedPath = [1];
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'shortestPath').mockReturnValue({
                path: expectedPath,
                moveCost: 0,
            });

            const result = service.movePlayer(roomId, startPosition, endPosition);

            expect(result).toEqual(expectedPath);
            expect(movementService.shortestPath).toHaveBeenCalledWith(5, gameInstance.game, startPosition, endPosition);
        });

        it('should use correct game instance for multiple active games', () => {
            const roomId1 = 'room1';
            const roomId2 = 'room2';
            const startPosition = 0;
            const endPosition = 1;
            const expectedPath = [0, 1];
            const gameInstance1 = {
                game: {},
                currentPlayerMoveBudget: 5,
            } as any;
            const gameInstance2 = {
                game: {},
                currentPlayerMoveBudget: 3,
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockImplementation((roomId) => {
                if (roomId === roomId1) return gameInstance1;
                if (roomId === roomId2) return gameInstance2;
            });
            jest.spyOn(movementService, 'shortestPath').mockReturnValue({
                path: expectedPath,
                moveCost: 1,
            });

            const result = service.movePlayer(roomId2, startPosition, endPosition);

            expect(result).toEqual(expectedPath);
            expect(movementService.shortestPath).toHaveBeenCalledWith(3, gameInstance2.game, startPosition, endPosition);
        });

        it('should pass correct parameters to shortestPath', () => {
            const roomId = 'room1';
            const startPosition = 0;
            const endPosition = 2;
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            const shortestPathSpy = jest.spyOn(movementService, 'shortestPath').mockReturnValue({ path: [0], moveCost: 0 });

            service.movePlayer(roomId, startPosition, endPosition);

            expect(shortestPathSpy).toHaveBeenCalledWith(5, gameInstance.game, startPosition, endPosition);
        });
    });
    describe('availablePlayerMoves', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;
        let movementService: MovementService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {
                            availableMoves: jest.fn(),
                        },
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
            movementService = module.get<MovementService>(MovementService);
        });

        it('should return available moves for the player', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const expectedMoves = { 0: [1, 2], 1: [0, 2] };
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
                playersCoord: [{ player: { id: playerId }, position: 0 }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockReturnValue(expectedMoves);

            const result = service.availablePlayerMoves(playerId, roomId);

            expect(result).toEqual(expectedMoves);
            expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 0);
        });

        it('should handle no available moves', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const expectedMoves = {};
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
                playersCoord: [{ player: { id: playerId }, position: 0 }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockReturnValue(expectedMoves);

            const result = service.availablePlayerMoves(playerId, roomId);

            expect(result).toEqual(expectedMoves);
            expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 0);
        });

        it('should handle multiple players', () => {
            const roomId = 'room1';
            const playerId1 = 'player1';
            const playerId2 = 'player2';
            const expectedMoves1 = { 0: [1, 2], 1: [0, 2] };
            const expectedMoves2 = { 1: [0, 2], 2: [1, 3] };
            const gameInstance = {
                game: {},
                currentPlayerMoveBudget: 5,
                playersCoord: [
                    { player: { id: playerId1 }, position: 0 },
                    { player: { id: playerId2 }, position: 1 },
                ],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockImplementation((budget, game, position) => {
                if (position === 0) return expectedMoves1;
                if (position === 1) return expectedMoves2;
            });

            const result1 = service.availablePlayerMoves(playerId1, roomId);
            const result2 = service.availablePlayerMoves(playerId2, roomId);

            expect(result1).toEqual(expectedMoves1);
            expect(result2).toEqual(expectedMoves2);
            expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 0);
            expect(movementService.availableMoves).toHaveBeenCalledWith(5, gameInstance.game, 1);
        });
    });
    describe('availablePlayerMovesOnBudget', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;
        let movementService: MovementService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {
                            availableMoves: jest.fn(),
                        },
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
            movementService = module.get<MovementService>(MovementService);
        });

        it('should return available moves for the player with given budget', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const moveBudget = 3;
            const expectedMoves = { 0: [1, 2], 1: [0, 2] };
            const gameInstance = {
                game: {},
                playersCoord: [{ player: { id: playerId }, position: 0 }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockReturnValue(expectedMoves);

            const result = service.availablePlayerMovesOnBudget(playerId, roomId, moveBudget);

            expect(result).toEqual(expectedMoves);
            expect(movementService.availableMoves).toHaveBeenCalledWith(moveBudget, gameInstance.game, 0);
        });

        it('should handle no available moves with given budget', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const moveBudget = 3;
            const expectedMoves = {};
            const gameInstance = {
                game: {},
                playersCoord: [{ player: { id: playerId }, position: 0 }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockReturnValue(expectedMoves);

            const result = service.availablePlayerMovesOnBudget(playerId, roomId, moveBudget);

            expect(result).toEqual(expectedMoves);
            expect(movementService.availableMoves).toHaveBeenCalledWith(moveBudget, gameInstance.game, 0);
        });

        it('should handle multiple players with given budget', () => {
            const roomId = 'room1';
            const playerId1 = 'player1';
            const playerId2 = 'player2';
            const moveBudget = 3;
            const expectedMoves1 = { 0: [1, 2], 1: [0, 2] };
            const expectedMoves2 = { 1: [0, 2], 2: [1, 3] };
            const gameInstance = {
                game: {},
                playersCoord: [
                    { player: { id: playerId1 }, position: 0 },
                    { player: { id: playerId2 }, position: 1 },
                ],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(movementService, 'availableMoves').mockImplementation((budget, game, position) => {
                if (position === 0) return expectedMoves1;
                if (position === 1) return expectedMoves2;
            });

            const result1 = service.availablePlayerMovesOnBudget(playerId1, roomId, moveBudget);
            const result2 = service.availablePlayerMovesOnBudget(playerId2, roomId, moveBudget);

            expect(result1).toEqual(expectedMoves1);
            expect(result2).toEqual(expectedMoves2);
            expect(movementService.availableMoves).toHaveBeenCalledWith(moveBudget, gameInstance.game, 0);
            expect(movementService.availableMoves).toHaveBeenCalledWith(moveBudget, gameInstance.game, 1);
        });
    });
    describe('interactWithDoor', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        });

        it('should open the door if it is closed and player is adjacent', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const doorPosition = 5;
            const mapSize = 10;
            const gameInstance = {
                game: {
                    mapSize: mapSize.toString(),
                    map: [{}, {}, {}, {}, {}, { tileType: TileTypes.DOORCLOSED }],
                },
                playersCoord: [{ player: { id: playerId }, position: 4 }],
                currentPlayerActionPoint: 1,
                globalStatsService: {
                    addUsedDoor: jest.fn(),
                },
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.interactWithDoor(roomId, playerId, doorPosition);

            expect(result).toBe(true);
            expect(gameInstance.game.map[doorPosition].tileType).toBe(TileTypes.DOOROPEN);
            expect(gameInstance.currentPlayerActionPoint).toBe(0);
            expect(gameInstance.globalStatsService.addUsedDoor).toHaveBeenCalledWith(doorPosition);
        });

        it('should close the door if it is open and player is adjacent', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const doorPosition = 5;
            const mapSize = 10;
            const gameInstance = {
                game: {
                    mapSize: mapSize.toString(),
                    map: [{}, {}, {}, {}, {}, { tileType: TileTypes.DOOROPEN }],
                },
                playersCoord: [{ player: { id: playerId }, position: 4 }],
                currentPlayerActionPoint: 1,
                globalStatsService: {
                    addUsedDoor: jest.fn(),
                },
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.interactWithDoor(roomId, playerId, doorPosition);

            expect(result).toBe(true);
            expect(gameInstance.game.map[doorPosition].tileType).toBe(TileTypes.DOORCLOSED);
            expect(gameInstance.currentPlayerActionPoint).toBe(0);
            expect(gameInstance.globalStatsService.addUsedDoor).toHaveBeenCalledWith(doorPosition);
        });

        it('should return false if player is not adjacent to the door', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const doorPosition = 5;
            const mapSize = 10;
            const gameInstance = {
                game: {
                    mapSize: mapSize.toString(),
                    map: [{}, {}, {}, {}, {}, { tileType: TileTypes.DOORCLOSED }],
                },
                playersCoord: [{ player: { id: playerId }, position: 0 }],
                currentPlayerActionPoint: 1,
                globalStatsService: {
                    addUsedDoor: jest.fn(),
                },
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            const result = service.interactWithDoor(roomId, playerId, doorPosition);

            expect(result).toBe(false);
            expect(gameInstance.game.map[doorPosition].tileType).toBe(TileTypes.DOORCLOSED);
            expect(gameInstance.currentPlayerActionPoint).toBe(1);
            expect(gameInstance.globalStatsService.addUsedDoor).not.toHaveBeenCalled();
        });
    });
    describe('quitGame', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        });

        it('should remove the player from the game instance', () => {
            const roomId = 'room1';
            const playerId = 'player1';
            const gameInstance = {
                game: {
                    map: [{ hasPlayer: true }, { hasPlayer: true }],
                },
                playersCoord: [
                    { player: { id: playerId }, position: 0 },
                    { player: { id: 'player2' }, position: 1 },
                ],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            service.quitGame(roomId, playerId);

            expect(gameInstance.playersCoord.length).toBe(1);
            expect(gameInstance.playersCoord[0].player.id).toBe('player2');
            expect(gameInstance.game.map[0].hasPlayer).toBe(false);
        });

        it('should handle multiple players correctly', () => {
            const roomId = 'room1';
            const playerId1 = 'player1';
            const playerId2 = 'player2';
            const gameInstance = {
                game: {
                    map: [{ hasPlayer: true }, { hasPlayer: true }],
                },
                playersCoord: [
                    { player: { id: playerId1 }, position: 0 },
                    { player: { id: playerId2 }, position: 1 },
                ],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            service.quitGame(roomId, playerId1);

            expect(gameInstance.playersCoord.length).toBe(1);
            expect(gameInstance.playersCoord[0].player.id).toBe(playerId2);
            expect(gameInstance.game.map[0].hasPlayer).toBe(false);
            expect(gameInstance.game.map[1].hasPlayer).toBe(true);
        });
    });
    describe('endGame', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;
        let logSenderService: LogSenderService;
        let server: Server;

        beforeEach(async () => {
            const mockGlobalStats = {
                getFinalStats: jest.fn().mockReturnValue({
                    matchLength: 0,
                    nbTurns: 0,
                    visitedTilesPercent: 0,
                    usedDoorsPercent: 0,
                    nbPlayersHeldFlag: 0,
                }),
                startTimerInterval: jest.fn(),
                endTimerInterval: jest.fn(),
            };

            const mockGameInstance = {
                globalStatsService: mockGlobalStats,
                playersCoord: [{ player: { name: 'Player1', id: 'player1' } }],
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn().mockReturnValue(mockGameInstance),
                            removeGameInstance: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {
                            sendEndGameLog: jest.fn(),
                        },
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
            logSenderService = module.get<LogSenderService>(LogSenderService);
            server = new Server();
            server.to = jest.fn().mockReturnValue({
                emit: jest.fn(),
            });
        });

        it('should send end game log', () => {
            const roomId = 'room1';
            const player = {
                player: {
                    name: 'Player1',
                    id: 'player1',
                },
                position: 0,
            } as any;

            service.endGame(roomId, server, player);

            expect(logSenderService.sendEndGameLog).toHaveBeenCalledWith(server, roomId, player.player.name);
        });

        it('should emit endGame event with correct data', () => {
            const roomId = 'room1';
            const player = { player: { name: 'Player1' } } as any;
            const globalStats = { someStat: 1 };
            const players = [
                { id: 'player1', position: 0 },
                { id: 'player2', position: 0 },
            ];
            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
                globalStatsService: {
                    getFinalStats: jest.fn().mockReturnValue(globalStats),
                },
                playersCoord: players.map((player) => ({ player })),
            } as any);

            service.endGame(roomId, server, player);

            expect(server.to(roomId).emit).toHaveBeenCalledWith('endGame', {
                globalStats,
                players,
                endGameMessage: `${player.player.name} a gagné la partie`,
            });
        });

        it('should remove game instance', () => {
            const roomId = 'room1';
            const player = { player: { name: 'Player1' } } as any;

            service.endGame(roomId, server, player);

            expect(activeGamesService.removeGameInstance).toHaveBeenCalledWith(roomId);
        });
    });
    describe('nextTurn', () => {
        let service: ActionService;
        let activeGamesService: ActiveGamesService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    ActionService,
                    {
                        provide: ActiveGamesService,
                        useValue: {
                            getActiveGame: jest.fn(),
                        },
                    },
                    {
                        provide: MovementService,
                        useValue: {},
                    },
                    {
                        provide: LogSenderService,
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<ActionService>(ActionService);
            activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
            service.quitGame = jest.fn();
        });

        it("should advance to the next player's turn", () => {
            const roomId = 'room1';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: 'player1' } }, { player: { id: 'player2' } }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            service.nextTurn(roomId, false);

            expect(gameInstance.turn).toBe(1);
        });

        it("should wrap around to the first player after the last player's turn", () => {
            const roomId = 'room1';
            const gameInstance = {
                turn: 1,
                playersCoord: [{ player: { id: 'player1' } }, { player: { id: 'player2' } }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);

            service.nextTurn(roomId, false);

            expect(gameInstance.turn).toBe(0);
        });

        it('should remove the current player if it is the last turn', () => {
            const roomId = 'room1';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: 'player1' } }, { player: { id: 'player2' } }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            const quitGameSpy = jest.spyOn(service, 'quitGame');

            service.nextTurn(roomId, true);

            expect(quitGameSpy).toHaveBeenCalledWith(roomId, 'player1');
            expect(gameInstance.turn).toBe(1);
        });

        it('should set the turn to the next player after removing the current player', () => {
            const roomId = 'room1';
            const gameInstance = {
                turn: 0,
                playersCoord: [{ player: { id: 'player1' } }, { player: { id: 'player2' } }],
            } as any;

            jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance);
            jest.spyOn(service, 'quitGame').mockImplementation((roomId, playerId) => {
                gameInstance.playersCoord.splice(0, 1);
            });

            service.nextTurn(roomId, true);

            expect(gameInstance.turn).toBe(0);
            expect(gameInstance.playersCoord[0].player.id).toBe('player2');
        });
    });
});
