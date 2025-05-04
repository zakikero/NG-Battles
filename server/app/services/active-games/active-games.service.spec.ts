import { GameInstance } from '@app/data-structures/game-instance';
import { Game } from '@app/model/schema/game.schema';
import { GameService } from '@app/services/game.service';
import { GameStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
/* eslint-disable */
describe('ActiveGamesService', () => {
    let service: ActiveGamesService;
    let uniqueItemRandomizer = new UniqueItemRandomizerService();
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActiveGamesService,
                { provide: UniqueItemRandomizerService, useValue: uniqueItemRandomizer },
                { provide: GameService, useValue: { get: jest.fn().mockResolvedValue({} as Game) } },
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();

        service = module.get<ActiveGamesService>(ActiveGamesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getActiveGame', () => {
        it('should return the active game instance for the given roomId', () => {
            const roomId = 'room1';
            const gameInstance = { roomId, game: {} } as GameInstance;
            service.activeGames.push(gameInstance);

            const result = service.getActiveGame(roomId);

            expect(result).toEqual(gameInstance);
        });

        it('should return undefined if no active game instance is found for the given roomId', () => {
            const roomId = 'room2';

            const result = service.getActiveGame(roomId);

            expect(result).toBeUndefined();
        });
    });
    describe('getActiveGameByPlayerId', () => {
        it('should return the active game instance for the given playerId', () => {
            const playerId = 'player1';
            const gameInstance = {
                roomId: 'room1',
                playersCoord: [{ player: { id: playerId }, position: 0 }],
                game: {},
            } as GameInstance;
            service.activeGames.push(gameInstance);

            const result = service.getActiveGameByPlayerId(playerId);

            expect(result).toEqual(gameInstance);
        });

        it('should return undefined if no active game instance is found for the given playerId', () => {
            const playerId = 'player2';

            const result = service.getActiveGameByPlayerId(playerId);

            expect(result).toBeUndefined();
        });
    });
    describe('removeGameInstance', () => {
        it('should remove the game instance for the given roomId', () => {
            const roomId = 'room1';
            const gameInstance = { roomId, game: {} } as GameInstance;
            service.activeGames.push(gameInstance);

            service.removeGameInstance(roomId);

            expect(service.activeGames).not.toContain(gameInstance);
        });

        it('should not remove any game instance if the given roomId does not exist', () => {
            const roomId = 'room1';
            const gameInstance = { roomId, game: {} } as GameInstance;
            service.activeGames.push(gameInstance);

            service.removeGameInstance('room2');

            expect(service.activeGames).toContain(gameInstance);
        });
    });
    describe('findStartingPositions', () => {
        it('should return the indices of tiles with item "startingPoint"', () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'wall' }, { item: 'startingPoint' }, { item: 'empty' }],
            } as GameStructure;

            const result = service.findStartingPositions(game);

            expect(result).toEqual([0, 2]);
        });

        it('should return an empty array if no tiles have item "startingPoint"', () => {
            const game = {
                map: [{ item: 'wall' }, { item: 'empty' }, { item: 'door' }],
            } as GameStructure;

            const result = service.findStartingPositions(game);

            expect(result).toEqual([]);
        });

        it('should return an empty array if the map is empty', () => {
            const game = {
                map: [],
            } as GameStructure;

            const result = service.findStartingPositions(game);

            expect(result).toEqual([]);
        });
    });
    describe('randomizePlayerPosition', () => {
        it('should assign unique starting positions to each player', () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }],
            } as GameStructure;
            const players = [
                { id: 'player1', attributes: { speed: 10 } } as Player,
                { id: 'player2', attributes: { speed: 8 } } as Player,
                { id: 'player3', attributes: { speed: 6 } } as Player,
            ];

            const result = service.randomizePlayerPosition(game, players);

            expect(result.length).toBe(players.length);
            const positions = result.map((playerCoord) => playerCoord.position);
            expect(new Set(positions).size).toBe(players.length);
        });

        it('should mark the starting positions as occupied by players', () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }],
            } as GameStructure;
            const players = [
                { id: 'player1', attributes: { speed: 10 } } as Player,
                { id: 'player2', attributes: { speed: 8 } } as Player,
                { id: 'player3', attributes: { speed: 6 } } as Player,
            ];

            const result = service.randomizePlayerPosition(game, players);

            result.forEach((playerCoord) => {
                expect(game.map[playerCoord.position].hasPlayer).toBe(true);
            });
        });

        it('should set player wins to 0', () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }],
            } as GameStructure;
            const players = [
                { id: 'player1', attributes: { speed: 10 }, wins: 5 } as Player,
                { id: 'player2', attributes: { speed: 8 }, wins: 3 } as Player,
                { id: 'player3', attributes: { speed: 6 }, wins: 2 } as Player,
            ];

            service.randomizePlayerPosition(game, players);

            players.forEach((player) => {
                expect(player.wins).toBe(0);
            });
        });

        it('should clear remaining starting positions if any', () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }],
            } as GameStructure;
            const players = [
                { id: 'player1', attributes: { speed: 10 } } as Player,
                { id: 'player2', attributes: { speed: 8 } } as Player,
                { id: 'player3', attributes: { speed: 6 } } as Player,
            ];

            service.randomizePlayerPosition(game, players);

            const startingPointsAmounts = game.map.filter((tile) => tile.item === ItemTypes.STARTINGPOINT).length;
            expect(startingPointsAmounts).toEqual(3);
        });
    });
    describe('checkGameInstance', () => {
        it('should add a new game instance if it does not exist', async () => {
            const roomId = 'room1';
            const gameId = 'game1';
            const game = { map: [] } as Game;
            jest.spyOn(service['gameService'], 'get').mockResolvedValue(game);

            await service.checkGameInstance(roomId, gameId);

            expect(service.activeGames.length).toBe(1);
            expect(service.activeGames[0].roomId).toBe(roomId);
            expect(service.activeGames[0].game).toEqual(game);
        });

        it('should not add a new game instance if it already exists', async () => {
            const roomId = 'room1';
            const gameId = 'game1';
            const gameInstance = { roomId, game: {} } as GameInstance;
            service.activeGames.push(gameInstance);

            await service.checkGameInstance(roomId, gameId);

            expect(service.activeGames.length).toBe(1);
            expect(service.activeGames[0]).toEqual(gameInstance);
        });

        it('should handle errors when fetching the game', async () => {
            const roomId = 'room1';
            const gameId = 'game1';
            jest.spyOn(service['gameService'], 'get').mockRejectedValue(new Error('Game not found'));

            await expect(service.checkGameInstance(roomId, gameId)).rejects.toThrow('Game not found');
        });
    });
    describe('gameSetup', () => {
        let server: Server;
        let roomId: string;
        let gameId: string;
        let players: Player[];

        beforeEach(() => {
            server = new Server();
            roomId = 'room1';
            gameId = 'game1';
            players = [
                { id: 'player1', attributes: { speed: 10 } } as Player,
                { id: 'player2', attributes: { speed: 8 } } as Player,
                { id: 'player3', attributes: { speed: 6 } } as Player,
            ];
        });

        it('should set up the game and emit gameSetup event', async () => {
            const game = {
                map: [{ item: 'startingPoint' }, { item: 'startingPoint' }, { item: 'startingPoint' }],
            } as GameStructure;
            jest.spyOn(service, 'checkGameInstance').mockResolvedValue();
            jest.spyOn(service, 'randomizePlayerPosition').mockReturnValue([
                { player: players[0], position: 0 },
                { player: players[1], position: 1 },
                { player: players[2], position: 2 },
            ]);
            service.activeGames.push({ roomId, game } as GameInstance);
            jest.spyOn(server, 'to').mockReturnValue({
                emit: jest.fn(),
            } as any);

            await service.gameSetup(server, roomId, gameId, players);

            expect(service.checkGameInstance).toHaveBeenCalledWith(roomId, gameId);
            // expect(service.uniqueItemRandomizer.randomizeUniqueItems).toHaveBeenCalledWith(game.map);
            expect(server.to(roomId).emit).toHaveBeenCalledWith('gameSetup', expect.any(Object));
        });

        it('should handle errors during game setup', async () => {
            jest.spyOn(service, 'checkGameInstance').mockRejectedValue(new Error('Game not found'));

            await expect(service.gameSetup(server, roomId, gameId, players)).rejects.toThrow('Game not found');
        });
    });
    describe('sortPlayersBySpeed', () => {
        it('should sort players by speed in descending order', () => {
            const playersCoord = [
                { player: { id: 'player1', attributes: { speed: 10 } }, position: 0 } as PlayerCoord,
                { player: { id: 'player2', attributes: { speed: 8 } }, position: 1 } as PlayerCoord,
                { player: { id: 'player3', attributes: { speed: 6 } }, position: 2 } as PlayerCoord,
            ];

            const result = service.sortPlayersBySpeed(playersCoord);

            expect(result[0].player.id).toBe('player1');
            expect(result[1].player.id).toBe('player2');
            expect(result[2].player.id).toBe('player3');
        });

        it('should sort players with the same speed randomly', () => {
            const playersCoord = [
                { player: { id: 'player1', attributes: { speed: 10 } }, position: 0 } as PlayerCoord,
                { player: { id: 'player2', attributes: { speed: 10 } }, position: 1 } as PlayerCoord,
                { player: { id: 'player3', attributes: { speed: 10 } }, position: 2 } as PlayerCoord,
            ];

            const result = service.sortPlayersBySpeed(playersCoord);

            expect(result.length).toBe(3);
            expect(new Set(result.map((playerCoord) => playerCoord.player.id)).size).toBe(3);
        });

        it('should handle an empty array', () => {
            const playersCoord: PlayerCoord[] = [];

            const result = service.sortPlayersBySpeed(playersCoord);

            expect(result).toEqual([]);
        });
    });
});
