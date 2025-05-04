import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { Player } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
/* eslint-disable */
describe('ActionHandlerService', () => {
    let service: ActionHandlerService;

    beforeEach(async () => {
        const mockCombatService = {
            currentTurnMap: new Map(),
            combatTimerMap: new Map(),
            activeGamesService: {},
            debugModeService: {},
            logSender: {},
            attackerStats: {},
            defenderStats: {},
            playerActionService: {},
            inventoryService: {},
            actionHandler: {},
            virtualPlayer: {},
            fightersMap: new Map(),
            actionButton: {},
            disperseKilledPlayerObjects: jest.fn(),
            killPlayer: jest.fn(),
            endCombat: jest.fn(),
            startCombat: jest.fn(),
            startAction: jest.fn(),
            fight: jest.fn(),
            resetHealth: jest.fn(),
            whoIsFirstPlayer: jest.fn(),
            isPlayerInCombat: jest.fn(),
            addNewFighters: jest.fn(),
            handlePlayerTurn: jest.fn(),
            getActionCost: jest.fn(),
            canAffordAction: jest.fn(),
            handleEscapeAttempt: jest.fn(),
            handleAttack: jest.fn(),
            handleItemUse: jest.fn(),
            handleEndTurn: jest.fn(),
            handleEndCombat: jest.fn(),
            hasEnoughRemainingActions: jest.fn(),
            hasSufficientActions: jest.fn(),
            isValidTarget: jest.fn(),
            getFighters: jest.fn(),
            getFighterByPlayerId: jest.fn(),
            getCurrentTurn: jest.fn(),
            getDefender: jest.fn(),
            getAttacker: jest.fn(),
            isCombatTimerRunning: jest.fn(),
            startCombatTimer: jest.fn(),
            stopCombatTimer: jest.fn(),
            resetCombatTimer: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActionHandlerService, // Keep only one instance
                {
                    provide: MovementService,
                    useValue: {
                        tileValue: jest.fn(),
                    },
                },
                {
                    provide: ActionService,
                    useValue: {
                        availablePlayerMovesOnBudget: jest.fn(),
                    },
                },
                {
                    provide: MatchService,
                    useValue: {
                        rooms: new Map(),
                    },
                },
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn(),
                    },
                },
                {
                    provide: InventoryService,
                    useValue: {
                        getSlippingChance: jest.fn(),
                        hasAF1Item: jest.fn(),
                    },
                },
                {
                    provide: DebugModeService,
                    useValue: {
                        isDebugMode: jest.fn(),
                    },
                },
                {
                    provide: LogSenderService,
                    useValue: {},
                },
                {
                    provide: CombatService,
                    useValue: mockCombatService,
                },
                {
                    provide: VirtualPlayerService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<ActionHandlerService>(ActionHandlerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('syncDelay', () => {
        let startTime: number;

        beforeEach(() => {
            startTime = Date.now();
        });

        it('should delay execution for specified milliseconds', () => {
            const delayMs = 100;
            service.syncDelay(delayMs);
            const elapsedTime = Date.now() - startTime;
            expect(elapsedTime).toBeGreaterThanOrEqual(delayMs);
        });

        it('should delay for at least the minimum time specified', () => {
            const delayMs = 50;
            service.syncDelay(delayMs);
            const elapsedTime = Date.now() - startTime;
            expect(elapsedTime).toBeGreaterThanOrEqual(delayMs);
            expect(elapsedTime).toBeLessThan(delayMs + 50); // Allow small overhead
        });

        it('should work with zero delay', () => {
            service.syncDelay(0);
            const elapsedTime = Date.now() - startTime;
            expect(elapsedTime).toBeGreaterThanOrEqual(0);
        });
    });
    describe('updatePlayerPosition', () => {
        let mockServer: { to: jest.Mock };

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();
        });

        it('should emit playerPositionUpdate event to the room with correct data', () => {
            const roomId = 'test-room';
            const playerId = 'player-1';
            const newPosition = 42;

            service.updatePlayerPosition(mockServer as any, roomId, playerId, newPosition);

            expect(mockServer.to).toHaveBeenCalledWith(roomId);
            expect(mockServer.to().emit).toHaveBeenCalledWith('playerPositionUpdate', {
                playerId,
                newPlayerPosition: newPosition,
            });
        });

        it('should call server.to() with the correct room ID', () => {
            const roomId = 'room-123';
            service.updatePlayerPosition(mockServer as any, roomId, 'player-1', 1);
            expect(mockServer.to).toHaveBeenCalledWith(roomId);
        });

        it('should pass the correct payload structure', () => {
            service.updatePlayerPosition(mockServer as any, 'room-1', 'player-1', 5);

            const emittedPayload = {
                playerId: 'player-1',
                newPlayerPosition: 5,
            };

            expect(mockServer.to().emit).toHaveBeenCalledWith('playerPositionUpdate', emittedPayload);
        });
    });
    describe('handleGetAvailableMovesOnBudget', () => {
        let mockClient: { emit: jest.Mock };
        let actionServiceMock: { availablePlayerMovesOnBudget: jest.Mock };

        beforeEach(() => {
            mockClient = {
                emit: jest.fn(),
            };
            actionServiceMock = service['action'] as any;
            actionServiceMock.availablePlayerMovesOnBudget = jest.fn();
        });

        it('should call availablePlayerMovesOnBudget with correct parameters', () => {
            const data = {
                roomId: 'test-room',
                playerId: 'player-1',
                currentBudget: 5,
            };

            service.handleGetAvailableMovesOnBudget(data, mockClient as any);

            expect(actionServiceMock.availablePlayerMovesOnBudget).toHaveBeenCalledWith(data.playerId, data.roomId, data.currentBudget);
        });

        it('should emit availableMovesOnBudget event with result', () => {
            const data = {
                roomId: 'test-room',
                playerId: 'player-1',
                currentBudget: 5,
            };
            const mockAvailableMoves = [1, 2, 3];
            actionServiceMock.availablePlayerMovesOnBudget.mockReturnValue(mockAvailableMoves);

            service.handleGetAvailableMovesOnBudget(data, mockClient as any);

            expect(mockClient.emit).toHaveBeenCalledWith('availableMovesOnBudget', mockAvailableMoves);
        });
    });
    describe('handleQuitGame', () => {
        let mockServer: { to: jest.Mock };
        let mockClient: { id: string };
        let combatServiceMock;
        let activeGamesServiceMock;
        let logSenderServiceMock;
        let actionMock;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            mockClient = { id: 'player-1' };

            activeGamesServiceMock = {
                getActiveGame: jest.fn(),
            };

            combatServiceMock = {
                disperseKilledPlayerObjects: jest.fn(),
                fightersMap: new Map(),
                killPlayer: jest.fn(),
            };

            activeGamesServiceMock = {
                getActiveGameByPlayerId: jest.fn(),
                removeGameInstance: jest.fn(),
            };

            logSenderServiceMock = {
                sendQuitGameLog: jest.fn(),
                sendEndGameLog: jest.fn(),
            };

            actionMock = {
                quitGame: jest.fn(),
            };

            service['combatService'] = combatServiceMock;
            service['activeGamesService'] = activeGamesServiceMock;
            service['logSenderService'] = logSenderServiceMock;
            service['action'] = actionMock;
        });

        it('should do nothing if no active game found', () => {
            activeGamesServiceMock.getActiveGameByPlayerId.mockReturnValue(null);
            service.handleQuitGame(mockServer as any, mockClient as any);
            expect(combatServiceMock.disperseKilledPlayerObjects).not.toHaveBeenCalled();
        });

        it('should handle player quitting during their turn', () => {
            const mockActiveGame = {
                roomId: 'room-1',
                playersCoord: [{ player: { id: 'player-1', name: 'Player 1' }, position: 0 }],
                turn: 0,
            };
            activeGamesServiceMock.getActiveGameByPlayerId.mockReturnValue(mockActiveGame);

            jest.spyOn(service, 'handleEndTurn').mockImplementation(() => {});

            service.handleQuitGame(mockServer as any, mockClient as any);

            expect(logSenderServiceMock.sendQuitGameLog).toHaveBeenCalled();
            expect(mockServer.to().emit).toHaveBeenCalledWith('quitGame', 'player-1');
            expect(mockServer.to().emit).toHaveBeenCalledWith('lastManStanding');
        });

        it('should handle player quitting during combat', () => {
            const mockActiveGame = {
                roomId: 'room-1',
                playersCoord: [
                    { player: { id: 'player-1', name: 'Player 1' }, position: 0 },
                    { player: { id: 'player-2', name: 'Player 2' }, position: 1 },
                ],
                turn: 0,
            };
            activeGamesServiceMock.getActiveGameByPlayerId.mockReturnValue(mockActiveGame);
            jest.spyOn(service, 'handleEndTurn').mockImplementation(() => {});

            const fighters = new Map();
            fighters.set('player-1', { player: { id: 'player-1' } });
            combatServiceMock.fightersMap.set('room-1', fighters);

            service.handleQuitGame(mockServer as any, mockClient as any);

            expect(combatServiceMock.killPlayer).toHaveBeenCalled();
            expect(mockServer.to().emit).toHaveBeenCalledWith('quitGame', 'player-1');
        });

        it('should handle last player quitting', () => {
            const mockActiveGame = {
                roomId: 'room-1',
                playersCoord: [{ player: { id: 'player-1', name: 'Player 1' }, position: 0 }],
                turn: 0,
            };
            activeGamesServiceMock.getActiveGameByPlayerId.mockReturnValue(mockActiveGame);
            jest.spyOn(service, 'handleEndTurn').mockImplementation(() => {});

            service.handleQuitGame(mockServer as any, mockClient as any);

            expect(logSenderServiceMock.sendEndGameLog).toHaveBeenCalledWith(mockServer, 'room-1', 'Player 1');
            expect(activeGamesServiceMock.removeGameInstance).toHaveBeenCalledWith('room-1');
        });

        it('should handle player quitting when not their turn', () => {
            const mockActiveGame = {
                roomId: 'room-1',
                playersCoord: [
                    { player: { id: 'player-1', name: 'Player 1' }, position: 0 },
                    { player: { id: 'player-2', name: 'Player 2' }, position: 1 },
                ],
                turn: 1, // player-2's turn
            };
            activeGamesServiceMock.getActiveGameByPlayerId.mockReturnValue(mockActiveGame);
            jest.spyOn(service, 'handleEndTurn').mockImplementation(() => {});

            service.handleQuitGame(mockServer as any, mockClient as any);

            expect(actionMock.quitGame).toHaveBeenCalledWith('room-1', 'player-1');
            expect(mockServer.to().emit).toHaveBeenCalledWith('quitGame', 'player-1');
        });
    });
    describe('handleInteractDoor', () => {
        let mockServer: { to: jest.Mock };
        let mockClient: { emit: jest.Mock };
        let actionServiceMock;
        let logSenderServiceMock;
        let activeGamesServiceMock;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            mockClient = { emit: jest.fn() };

            actionServiceMock = {
                interactWithDoor: jest.fn(),
                availablePlayerMoves: jest.fn(),
            };

            logSenderServiceMock = {
                sendDoorInteractionLog: jest.fn(),
            };

            activeGamesServiceMock = {
                getActiveGame: jest.fn(),
            };

            service['action'] = actionServiceMock;
            service['logSenderService'] = logSenderServiceMock;
            service['activeGamesService'] = activeGamesServiceMock;
        });

        it('should do nothing if player has no remaining action points', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                doorPosition: 5,
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue({
                currentPlayerActionPoint: 0,
                game: { map: [] },
            });

            service.handleInteractDoor(data, mockServer as any);

            expect(actionServiceMock.interactWithDoor).not.toHaveBeenCalled();
            expect(mockServer.to().emit).not.toHaveBeenCalled();
        });

        it('should handle door interaction when player has action points', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                doorPosition: 0,
            };

            const mockActiveGame = {
                currentPlayerActionPoint: 1,
                game: {
                    map: [{ tileType: TileTypes.DOORCLOSED }],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            name: 'Test Player',
                        },
                    },
                ],
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.interactWithDoor.mockReturnValue(true);
            actionServiceMock.availablePlayerMoves.mockReturnValue([1, 2, 3]);

            service.handleInteractDoor(data, mockServer as any);

            expect(actionServiceMock.interactWithDoor).toHaveBeenCalledWith(data.roomId, data.playerId, data.doorPosition);
            expect(mockServer.to().emit).toHaveBeenCalledWith('interactDoor', {
                isToggable: true,
                doorPosition: data.doorPosition,
                availableMoves: [1, 2, 3],
            });
            expect(logSenderServiceMock.sendDoorInteractionLog).toHaveBeenCalled();
        });

        it('should emit correct door interaction result when door cannot be toggled', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                doorPosition: 0,
            };

            const mockActiveGame = {
                currentPlayerActionPoint: 1,
                game: {
                    map: [{ tileType: TileTypes.DOORCLOSED }],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            name: 'Test Player',
                        },
                    },
                ],
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.interactWithDoor.mockReturnValue(false);
            actionServiceMock.availablePlayerMoves.mockReturnValue([]);

            service.handleInteractDoor(data, mockServer as any);

            expect(mockServer.to().emit).toHaveBeenCalledWith('interactDoor', {
                isToggable: false,
                doorPosition: data.doorPosition,
                availableMoves: [],
            });
        });
    });
    describe('isOnHomePosition', () => {
        it('should return true when player has flag and is on home position', () => {
            const player = {
                inventory: ['drapeau-A'],
                homePosition: 42,
                id: 'player-1',
                name: 'Test Player',
            } as unknown as Player;

            const result = service.isOnHomePosition(player, 42);

            expect(result).toBe(true);
        });

        it('should return false when player has flag but is not on home position', () => {
            const player = {
                inventory: ['drapeau-A'],
                homePosition: 42,
                id: 'player-1',
                name: 'Test Player',
            } as unknown as Player;

            const result = service.isOnHomePosition(player, 24);

            expect(result).toBe(false);
        });

        it('should return false when player is on home position but has no flag', () => {
            const player = {
                inventory: [],
                homePosition: 42,
                id: 'player-1',
                name: 'Test Player',
            } as Player;

            const result = service.isOnHomePosition(player, 42);

            expect(result).toBe(false);
        });

        it('should return false when player has no flag and is not on home position', () => {
            const player = {
                inventory: [],
                homePosition: 42,
                id: 'player-1',
                name: 'Test Player',
            } as Player;

            const result = service.isOnHomePosition(player, 24);

            expect(result).toBe(false);
        });
    });
    describe('handleEndTurn', () => {
        let mockServer: { to: jest.Mock };
        let actionServiceMock;
        let activeGamesServiceMock;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            actionServiceMock = {
                isCurrentPlayersTurn: jest.fn(),
                nextTurn: jest.fn(),
            };

            activeGamesServiceMock = {
                getActiveGame: jest.fn(),
            };

            service['action'] = actionServiceMock;
            service['activeGamesService'] = activeGamesServiceMock;
        });

        it('should handle end turn when it is current player turn', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                lastTurn: false,
            };

            const mockActiveGame = {
                playersCoord: [{ player: { id: 'player-1' } }, { player: { id: 'player-2' } }],
                turn: 0,
                turnTimer: {
                    resetTimer: jest.fn(),
                    startTimer: jest.fn(),
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);

            service.handleEndTurn(data, mockServer as any);

            expect(mockActiveGame.turnTimer.resetTimer).toHaveBeenCalled();
            expect(mockActiveGame.turnTimer.startTimer).toHaveBeenCalled();
            expect(actionServiceMock.nextTurn).toHaveBeenCalledWith('room-1', false);
            expect(mockServer.to().emit).toHaveBeenCalledWith('endTurn', 'player-1');
        });

        it('should not process end turn when it is not current player turn', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-2',
                lastTurn: false,
            };

            const mockActiveGame = {
                playersCoord: [{ player: { id: 'player-1' } }, { player: { id: 'player-2' } }],
                turn: 0,
                turnTimer: {
                    resetTimer: jest.fn(),
                    startTimer: jest.fn(),
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(false);

            service.handleEndTurn(data, mockServer as any);

            expect(actionServiceMock.nextTurn).not.toHaveBeenCalled();
            expect(mockServer.to().emit).not.toHaveBeenCalled();
        });

        it('should handle virtual player turn', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                lastTurn: false,
            };

            const mockActiveGame = {
                playersCoord: [{ player: { id: 'player-1' } }, { player: { id: 'virtual-player', isVirtual: true } }],
                turn: 1,
                turnTimer: {
                    resetTimer: jest.fn(),
                    startTimer: jest.fn(),
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);

            jest.spyOn(service, 'handleStartTurn').mockImplementation(() => {});

            service.handleEndTurn(data, mockServer as any);

            expect(service.handleStartTurn).toHaveBeenCalledWith({ roomId: 'room-1', playerId: 'virtual-player' }, mockServer, null);
        });

        it('should handle last turn', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                lastTurn: true,
            };

            const mockActiveGame = {
                playersCoord: [{ player: { id: 'player-1' } }, { player: { id: 'player-2' } }],
                turn: 0,
                turnTimer: {
                    resetTimer: jest.fn(),
                    startTimer: jest.fn(),
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);

            service.handleEndTurn(data, mockServer as any);

            expect(actionServiceMock.nextTurn).toHaveBeenCalledWith('room-1', true);
        });
    });
    describe('handleStartTurn', () => {
        let mockServer: { to: jest.Mock };
        let mockClient: { emit: jest.Mock };
        let activeGamesServiceMock;
        let actionServiceMock;
        let logSenderServiceMock;
        let virtualPlayerServiceMock;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            mockClient = {
                emit: jest.fn(),
            };

            activeGamesServiceMock = {
                getActiveGame: jest.fn(),
            };

            actionServiceMock = {
                availablePlayerMoves: jest.fn(),
            };

            logSenderServiceMock = {
                sendStartTurnLog: jest.fn(),
            };

            virtualPlayerServiceMock = {
                think: jest.fn(),
            };

            service['activeGamesService'] = activeGamesServiceMock;
            service['action'] = actionServiceMock;
            service['logSenderService'] = logSenderServiceMock;
            service['virtualPlayerService'] = virtualPlayerServiceMock;
        });

        it('should handle start turn for human player correctly', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
            };

            const mockActiveGame = {
                turn: 0,
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            attributes: { speed: 3 },
                        },
                    },
                ],
                globalStatsService: {
                    incrementTurn: jest.fn(),
                    globalStats: {
                        matchLength: 0,
                    },
                },
                currentPlayerMoveBudget: 3,
                currentPlayerActionPoint: 1,
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.availablePlayerMoves.mockReturnValue([1, 2, 3]);

            service.handleStartTurn(data, mockServer as any, mockClient as any);

            expect(mockActiveGame.globalStatsService.incrementTurn).toHaveBeenCalled();
            expect(mockActiveGame.currentPlayerMoveBudget).toBe(3);
            expect(mockActiveGame.currentPlayerActionPoint).toBe(1);
            expect(mockClient.emit).toHaveBeenCalledWith('startTurn', {
                shortestPathByTile: [1, 2, 3],
                currentMoveBudget: 3,
            });
            expect(logSenderServiceMock.sendStartTurnLog).toHaveBeenCalledWith(mockServer, data.roomId, mockActiveGame.playersCoord[0].player);
        });

        it('should handle start turn for virtual player correctly', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'virtual-1',
            };

            const mockActiveGame = {
                turn: 0,
                playersCoord: [
                    {
                        player: {
                            id: 'virtual-1',
                            isVirtual: true,
                            attributes: { speed: 3 },
                        },
                    },
                ],
                globalStatsService: {
                    incrementTurn: jest.fn(),
                    globalStats: {
                        matchLength: 0,
                    },
                },
                currentPlayerMoveBudget: 3,
                currentPlayerActionPoint: 1,
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);

            service.handleStartTurn(data, mockServer as any, mockClient as any);

            expect(mockActiveGame.globalStatsService.incrementTurn).toHaveBeenCalled();
            expect(mockActiveGame.currentPlayerMoveBudget).toBe(3);
            expect(mockActiveGame.currentPlayerActionPoint).toBe(1);
            expect(mockClient.emit).not.toHaveBeenCalled();
            expect(virtualPlayerServiceMock.think).toHaveBeenCalled();
            expect(service['virtualPlayerService'].virtualPlayerId).toBe('virtual-1');
            expect(service['virtualPlayerService'].roomId).toBe('room-1');
            expect(service['virtualPlayerService'].server).toBe(mockServer);
        });

        it('should increment turn counter twice', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
            };

            const mockActiveGame = {
                turn: 0,
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            attributes: { speed: 3 },
                        },
                    },
                ],
                globalStatsService: {
                    incrementTurn: jest.fn(),
                    globalStats: {
                        matchLength: 0,
                    },
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);

            service.handleStartTurn(data, mockServer as any, mockClient as any);

            expect(mockActiveGame.globalStatsService.incrementTurn).toHaveBeenCalledTimes(2);
        });
    });
    describe('handleMove', () => {
        let mockServer: { to: jest.Mock };
        let mockClient: { emit: jest.Mock };
        let actionServiceMock;
        let activeGamesServiceMock;
        let movementServiceMock;
        let debugModeServiceMock;
        let inventoryServiceMock;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            mockClient = {
                emit: jest.fn(),
            };

            actionServiceMock = {
                isCurrentPlayersTurn: jest.fn(),
                movePlayer: jest.fn(),
                availablePlayerMoves: jest.fn(),
                endGame: jest.fn(),
            };

            activeGamesServiceMock = {
                getActiveGame: jest.fn(),
            };

            movementServiceMock = {
                tileValue: jest.fn(),
            };

            debugModeServiceMock = {
                getDebugMode: jest.fn(),
            };

            inventoryServiceMock = {
                addToInventoryAndEmit: jest.fn(),
                getSlippingChance: jest.fn(),
            };

            service['action'] = actionServiceMock;
            service['activeGamesService'] = activeGamesServiceMock;
            service['movementService'] = movementServiceMock;
            service['debugModeService'] = debugModeServiceMock;
            service['inventoryService'] = inventoryServiceMock;
        });

        it('should not process move if it is not current player turn', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(false);
            service.handleMove(data, mockServer as any, mockClient as any);

            expect(actionServiceMock.movePlayer).not.toHaveBeenCalled();
            expect(mockClient.emit).not.toHaveBeenCalled();
        });

        it('should process normal move correctly', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                            inventory: [],
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
            };
            inventoryServiceMock.getSlippingChance.mockReturnValue(0);
            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]);
            actionServiceMock.availablePlayerMoves.mockReturnValue([2, 3, 4]);
            movementServiceMock.tileValue.mockReturnValue(1);
            debugModeServiceMock.getDebugMode.mockReturnValue(false);

            jest.spyOn(service, 'isOnHomePosition').mockImplementation(() => false);

            service.handleMove(data, mockServer as any, mockClient as any);

            expect(mockServer.to().emit).toHaveBeenCalledWith('playerPositionUpdate', {
                playerId: 'player-1',
                newPlayerPosition: 1,
            });
            expect(mockClient.emit).toHaveBeenCalledWith('endMove', {
                availableMoves: [2, 3, 4],
                currentMoveBudget: 2,
                hasSlipped: false,
            });
        });

        it('should handle ice tile slipping', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.ICE, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.ICE, item: ItemTypes.EMPTY, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                            inventory: [],
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
            };
            inventoryServiceMock.getSlippingChance.mockReturnValue(0.1);
            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]);
            debugModeServiceMock.getDebugMode.mockReturnValue(false);

            // Mock Math.random to always return a value less than SLIP_PERCENTAGE
            jest.spyOn(Math, 'random').mockReturnValue(0.05);

            service.handleMove(data, mockServer as any, mockClient as any);

            expect(mockClient.emit).toHaveBeenCalledWith('endMove', {
                availableMoves: undefined,
                currentMoveBudget: 0,
                hasSlipped: true,
            });
        });

        it('should handle item pickup', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.BASIC, item: ItemTypes.FLAG_A, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
                globalStatsService: {
                    addPlayerHeldFlag: jest.fn(),
                },
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]);
            debugModeServiceMock.getDebugMode.mockReturnValue(false);

            jest.spyOn(service, 'isOnHomePosition').mockImplementation(() => false);

            service.handleMove(data, mockServer as any, mockClient as any);

            expect(inventoryServiceMock.addToInventoryAndEmit).toHaveBeenCalledWith(
                mockServer,
                mockClient,
                'room-1',
                mockActiveGame.playersCoord[0],
                ItemTypes.FLAG_A,
            );
            expect(mockActiveGame.game.map[1].item).toBe(ItemTypes.EMPTY);
        });

        it('should handle CTF win condition', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            inventory: [ItemTypes.FLAG_A],
                            homePosition: 1,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]);
            debugModeServiceMock.getDebugMode.mockReturnValue(false);

            service.handleMove(data, mockServer as any, mockClient as any);

            expect(actionServiceMock.endGame).toHaveBeenCalledWith('room-1', mockServer, mockActiveGame.playersCoord[0]);
        });
        it('should handle initial ice tile slipping correctly', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.ICE, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                            inventory: [],
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
            };

            inventoryServiceMock.getSlippingChance.mockReturnValue(0.1);
            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]); // First position is on ice
            debugModeServiceMock.getDebugMode.mockReturnValue(false); // Debug mode off

            // Mock Math.random to return a value less than SLIP_PERCENTAGE (0.1)
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.05);

            service.handleMove(data, mockServer as any, mockClient as any);

            // Verify that budget was set to 0 and slipping occurred at initial position
            expect(mockActiveGame.currentPlayerMoveBudget).toBe(0);
            expect(mockClient.emit).toHaveBeenCalledWith('endMove', {
                availableMoves: undefined,
                currentMoveBudget: 0,
                hasSlipped: true,
            });

            // Clean up
            mockRandom.mockRestore();
        });

        it('should not trigger ice slip in debug mode', () => {
            const data = {
                roomId: 'room-1',
                playerId: 'player-1',
                endPosition: 5,
            };

            const mockActiveGame = {
                currentPlayerMoveBudget: 3,
                game: {
                    map: [
                        { tileType: TileTypes.ICE, item: ItemTypes.EMPTY, hasPlayer: true },
                        { tileType: TileTypes.BASIC, item: ItemTypes.EMPTY, hasPlayer: false },
                    ],
                },
                playersCoord: [
                    {
                        player: {
                            id: 'player-1',
                            isVirtual: false,
                            stats: { visitedTiles: new Set(), visitedTilesPercent: 0 },
                        },
                        position: 0,
                    },
                ],
                maxNbTiles: 10,
            };

            activeGamesServiceMock.getActiveGame.mockReturnValue(mockActiveGame);
            actionServiceMock.isCurrentPlayersTurn.mockReturnValue(true);
            actionServiceMock.movePlayer.mockReturnValue([0, 1]);
            debugModeServiceMock.getDebugMode.mockReturnValue(true); // Debug mode on

            // Mock Math.random to return a value less than SLIP_PERCENTAGE
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.05);

            jest.spyOn(service, 'isOnHomePosition').mockImplementation(() => false);

            service.handleMove(data, mockServer as any, mockClient as any);

            // Verify that ice slipping was not triggered due to debug mode
            expect(mockActiveGame.currentPlayerMoveBudget).not.toBe(0);
            expect(mockClient.emit).toHaveBeenCalledWith('endMove', {
                availableMoves: undefined,
                currentMoveBudget: mockActiveGame.currentPlayerMoveBudget,
                hasSlipped: false,
            });

            // Clean up
            mockRandom.mockRestore();
        });
    });

    describe('handleGameSetup', () => {
        let mockServer: { to: jest.Mock };
        let matchServiceMock;
        let activeGamesServiceMock;
        let mockActiveGame;

        beforeEach(() => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
            };
            mockServer.to().emit = jest.fn();

            mockActiveGame = {
                playersCoord: [
                    { player: { id: 'player-1', isVirtual: false }, position: 0 },
                    { player: { id: 'player-2', isVirtual: false }, position: 1 },
                ],
            };

            matchServiceMock = {
                rooms: new Map(),
            };

            activeGamesServiceMock = {
                gameSetup: jest.fn().mockImplementation(() => Promise.resolve()),
                getActiveGame: jest.fn().mockReturnValue(mockActiveGame),
            };

            service['match'] = matchServiceMock;
            service['activeGamesService'] = activeGamesServiceMock;
        });

        it('should call gameSetup with correct parameters', async () => {
            const roomId = 'room-1';
            const gameId = 'game-1';
            const players = [
                { id: 'player-1', isVirtual: false },
                { id: 'player-2', isVirtual: false },
            ];

            matchServiceMock.rooms.set(roomId, { gameId, players });

            await service.handleGameSetup(mockServer as any, roomId);

            expect(activeGamesServiceMock.gameSetup).toHaveBeenCalledWith(mockServer, roomId, gameId, players);
        });

        it('should trigger virtual player first turn when first player is virtual', async () => {
            const roomId = 'room-1';
            const gameId = 'game-1';
            const mockVirtualGame = {
                playersCoord: [
                    { player: { id: 'virtual-1', isVirtual: true }, position: 0 },
                    { player: { id: 'player-2', isVirtual: false }, position: 1 },
                ],
            };

            matchServiceMock.rooms.set(roomId, { gameId, players: [] });
            activeGamesServiceMock.getActiveGame.mockReturnValue(mockVirtualGame);

            jest.spyOn(service, 'handleStartTurn').mockImplementation(() => {});

            await service.handleGameSetup(mockServer as any, roomId);

            expect(service.handleStartTurn).toHaveBeenCalledWith({ roomId, playerId: 'virtual-1' }, mockServer, null);
        });

        it('should not trigger virtual player turn when first player is human', async () => {
            const roomId = 'room-1';
            const gameId = 'game-1';
            const mockHumanGame = {
                playersCoord: [
                    { player: { id: 'player-1', isVirtual: false }, position: 0 },
                    { player: { id: 'player-2', isVirtual: false }, position: 1 },
                ],
            };

            matchServiceMock.rooms.set(roomId, { gameId, players: [] });
            activeGamesServiceMock.getActiveGame.mockReturnValue(mockHumanGame);

            jest.spyOn(service, 'handleStartTurn').mockImplementation(() => {});

            await service.handleGameSetup(mockServer as any, roomId);

            expect(service.handleStartTurn).not.toHaveBeenCalled();
        });
    });
});
