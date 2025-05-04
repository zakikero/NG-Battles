import { GameInstance } from '@app/data-structures/game-instance';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { GameService } from '@app/services/game.service';
import { MovementService } from '@app/services/movement/movement.service';
import { GameStructure, TileStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionButtonService } from './action-button.service';
/* eslint-disable */
describe('ActionButtonService', () => {
    let service: ActionButtonService;
    let activeGamesService: ActiveGamesService;
    let combatService: CombatService;
    let actionService: ActionService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getPlayersAround: jest.fn(),
                        getDoorsAround: jest.fn(),
                    },
                },
                {
                    provide: ActionService,
                    useValue: {
                        interactWithDoor: jest.fn(),
                        startCombat: jest.fn(),
                        movePlayer: jest.fn(),
                        performAction: jest.fn(),
                    },
                },
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn(),
                    },
                },
                {
                    provide: CombatService,
                    useValue: {
                        startCombat: jest.fn(),
                    },
                },
                ActionButtonService,
                MovementService,
            ],
        }).compile();
        service = module.get<ActionButtonService>(ActionButtonService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        combatService = module.get<CombatService>(CombatService);
        actionService = module.get<ActionService>(ActionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return available indexes for players and doors around the active player', () => {
        const roomId = '123abc';
        const activePlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 5 } as PlayerCoord;
        const mockPlayersAround = [{ player: { id: 'opponentId' }, position: 6 }] as PlayerCoord[];
        const mockDoorsAround = [{ idx: 7, tileType: TileTypes.DOOR, item: 'wall', hasPlayer: false }];

        jest.spyOn(service, 'getPlayersAround').mockReturnValue(mockPlayersAround);
        jest.spyOn(service, 'getDoorsAround').mockReturnValue(mockDoorsAround);

        const result = service.getAvailableIndexes(roomId, activePlayer);

        expect(result).toEqual([mockPlayersAround[0].position, mockDoorsAround[0].idx]);
    });

    it('should start combat with the given fighters', () => {
        const roomId = '123abc';
        const fighters: PlayerCoord[] = [
            { player: { id: 'player1' } as Player, position: 1 },
            { player: { id: 'player2' } as Player, position: 2 },
        ] as PlayerCoord[];

        jest.spyOn(combatService, 'startCombat').mockImplementation(() => {
            return null;
        });

        service.startCombat(roomId, fighters);

        expect(combatService.startCombat).toHaveBeenCalledWith(roomId, fighters);
    });

    it('should start combat if tile has a player', () => {
        const roomId = '123abc';
        const originalPlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 50 } as PlayerCoord;
        const position = 50;

        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const game: GameStructure = {
            id: 'f01d532b-31f8-4158-9398-29a03c39e646',
            gameName: 'BRUH',
            gameDescription: 'One day...',
            mapSize: '10',
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };
        game.map[position] = {
            idx: position,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: true,
        };
        game.map[position + 1] = {
            idx: position + 1,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: true,
        };
        game.map[position - 1] = {
            idx: 49,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: true,
        };
        game.map[position - parseInt(game.mapSize, 10)] = {
            idx: 40,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: true,
        };
        game.map[position + parseInt(game.mapSize, 10)] = {
            idx: 60,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: true,
        };

        const playerCoordsMap: PlayerCoord[] = Array.from({ length: 100 }, (_, idx) => ({ player: { id: 'WORKS !' } as Player, position: idx }));

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: playerCoordsMap,
        } as GameInstance);

        jest.spyOn(service, 'startCombat');

        service.chosenAction(roomId, originalPlayer, position);
        expect(service.startCombat).toHaveBeenCalled();
    });
    it('should interact with door if tile is a door', () => {
        const roomId = '123abc';
        const originalPlayer: PlayerCoord = { player: { id: 'playerId' } as Player, position: 50 } as PlayerCoord;
        const position = 50;

        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const game: GameStructure = {
            id: 'f01d532b-31f8-4158-9398-29a03c39e646',
            gameName: 'BRUH',
            gameDescription: 'One day...',
            mapSize: '10',
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };
        game.map[position] = {
            idx: position,
            tileType: TileTypes.DOORCLOSED,
            item: '',
            hasPlayer: false,
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: [],
        } as GameInstance);

        jest.spyOn(actionService, 'interactWithDoor');

        service.chosenAction(roomId, originalPlayer, position);
        expect(actionService.interactWithDoor).toHaveBeenCalledWith(roomId, originalPlayer.player.id, originalPlayer.position);
    });

    it('should return doors around the given player position', () => {
        const roomId = '123abc';
        const player: PlayerCoord = { player: { id: 'playerId' } as Player, position: 45 } as PlayerCoord;
        const mapSize = '10';
        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        mockMap[46] = { idx: 46, tileType: TileTypes.DOOR, item: '', hasPlayer: false };
        mockMap[44] = { idx: 44, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false };
        mockMap[35] = { idx: 35, tileType: TileTypes.DOOROPEN, item: '', hasPlayer: false };
        mockMap[55] = { idx: 55, tileType: TileTypes.DOOR, item: '', hasPlayer: false };

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: [],
        } as GameInstance);

        const result = service.getDoorsAround(roomId, player);

        expect(result).toEqual([mockMap[46], mockMap[44], mockMap[35], mockMap[55]]);
    });

    it('should return an empty array if no doors are around the given player position', () => {
        const roomId = '123abc';
        const player: PlayerCoord = { player: { id: 'playerId' } as Player, position: 45 } as PlayerCoord;
        const mapSize = '10';
        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: [],
        } as GameInstance);

        const result = service.getDoorsAround(roomId, player);

        expect(result).toEqual([]);
    });

    it('should return an empty array if no players are around the given position', () => {
        const roomId = '123abc';
        const position = 5;
        const mapSize = '3';
        const mockMap = [
            { idx: 0, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 1, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 2, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 3, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 4, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 5, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 6, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 7, tileType: 'tile', item: '', hasPlayer: false },
            { idx: 8, tileType: 'tile', item: '', hasPlayer: false },
        ] as TileStructure[];

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: [],
        } as GameInstance);

        const result = service.getPlayersAround(roomId, position);

        expect(result).toEqual([]);
    });

    it('should return players around the given position', () => {
        const roomId = '123abc';
        const position = 45;
        const mapSize = '10';
        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const playerCoordsMap: PlayerCoord[] = Array.from({ length: 100 }, (_, idx) => ({
            player: { id: `player${idx}` } as Player,
            position: idx,
        }));

        mockMap[46].hasPlayer = true;
        mockMap[44].hasPlayer = true;
        mockMap[35].hasPlayer = true;
        mockMap[55].hasPlayer = true;

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: playerCoordsMap,
        } as GameInstance);

        const result = service.getPlayersAround(roomId, position);

        expect(result).toEqual([playerCoordsMap[46], playerCoordsMap[44], playerCoordsMap[35], playerCoordsMap[55]]);
    });
    it('should return players around the given position when it is the 0 position', () => {
        const roomId = '123abc';
        const position = 0;
        const mapSize = '10';
        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const playerCoordsMap: PlayerCoord[] = Array.from({ length: 100 }, (_, idx) => ({
            player: { id: `player${idx}` } as Player,
            position: idx,
        }));

        mockMap[1].hasPlayer = true;
        mockMap[10].hasPlayer = true;

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: playerCoordsMap,
        } as GameInstance);

        const result = service.getPlayersAround(roomId, position);

        expect(result).toEqual([playerCoordsMap[1], playerCoordsMap[10]]);
    });

    it('should return players around the given position when it is the 0 position', () => {
        const roomId = '123abc';
        const position = 90;
        const mapSize = '10';
        const mockMap = Array.from({ length: 100 }, (_, idx) => ({
            idx,
            tileType: TileTypes.BASIC,
            item: '',
            hasPlayer: false,
        })) as TileStructure[];

        const playerCoordsMap: PlayerCoord[] = Array.from({ length: 100 }, (_, idx) => ({
            player: { id: `player${idx}` } as Player,
            position: idx,
        }));

        mockMap[91].hasPlayer = true;

        const game: GameStructure = {
            id: 'gameId',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize,
            map: mockMap,
            gameType: 'classic',
            isVisible: true,
            creationDate: '2024-11-11T19:59:26.518Z',
            lastModified: '16/11/2024, 12:39:04',
        };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue({
            game,
            playersCoord: playerCoordsMap,
        } as GameInstance);

        const result = service.getPlayersAround(roomId, position);

        expect(result).toEqual([playerCoordsMap[91]]);
    });
});
