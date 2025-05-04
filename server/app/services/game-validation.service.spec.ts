import { Game } from '@app/model/schema/game.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Query } from 'mongoose';
import { GameValidationService } from './game-validation.service';
import { MapValidationService } from './map-validation.service';
import { PROPERTIES_TO_CHECK } from './validation-constants';
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('GameValidationService', () => {
    let service: GameValidationService;
    let mapValidationService: MapValidationService;
    let model: Model<Game>;

    const validGame = {
        id: '123',
        gameName: 'Game e34wdwd23',
        gameDescription: 'This is an example game description.',
        mapSize: '3',
        map: [
            { idx: 0, tileType: '', item: '', hasPlayer: false },
            { idx: 1, tileType: '', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 4, tileType: 'door', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: '', hasPlayer: false },
        ],
        gameType: 'ctf',
        isVisible: true,
        creationDate: '2024-09-18T10:30:00.000Z',
        lastModified: '18/09/2024 10:30:00',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameValidationService,
                {
                    provide: MapValidationService,
                    useValue: {
                        hasStartingPoints: jest.fn(),
                        hasCorrectGroundAmount: jest.fn(),
                        areAllTilesAccessible: jest.fn(),
                        areAllDoorsValid: jest.fn(),
                    },
                },
                {
                    provide: getModelToken('Game'),
                    useValue: {
                        find: jest.fn(),
                        exec: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<GameValidationService>(GameValidationService);
        mapValidationService = module.get<MapValidationService>(MapValidationService);
        model = module.get<Model<Game>>(getModelToken('Game'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call all validation methods for updated game', () => {
        jest.spyOn(service, 'validateProperties').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateMap').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateGameName').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateUniqueNameUpdate').mockResolvedValueOnce(undefined);
        service.validateUpdatedGame(validGame);
        expect(service.validateProperties).toHaveBeenCalled();
        expect(service.validateMap).toHaveBeenCalled();
        expect(service.validateGameName).toHaveBeenCalled();
        expect(service.validateUniqueNameUpdate).toHaveBeenCalled();
    });

    it('should call all validation methods for new game', () => {
        jest.spyOn(service, 'validateProperties').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateMap').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateGameName').mockImplementationOnce(() => {});
        jest.spyOn(service, 'validateUniqueChecks').mockResolvedValueOnce(undefined);
        service.validateNewGame(validGame);
        expect(service.validateProperties).toHaveBeenCalled();
        expect(service.validateMap).toHaveBeenCalled();
        expect(service.validateGameName).toHaveBeenCalled();
        expect(service.validateUniqueChecks).toHaveBeenCalled();
    });

    it('should return true for valid TileJson', () => {
        const tile = {
            idx: 0,
            tileType: 'tileType',
            item: 'item',
            hasPlayer: true,
        };
        expect(service.isValidTileJson(tile)).toBeTruthy();
    });

    it('should return false for invalid TileJson', () => {
        const tile = {
            idx: 'string',
            tileType: 12,
            item: 'item',
            hasPlayer: true,
        };
        expect(service.isValidTileJson(tile as any)).toBeFalsy();
    });

    it('should not add errors for valid GameJson', () => {
        const game = {
            gameName: 'ValidGame',
            id: '123',
            gameDescription: 'A valid game',
            mapSize: '10',
            gameType: 'type',
            creationDate: '2023-01-01',
            map: [],
            isVisible: true,
            lastModified: '2023-01-01',
        };
        service.validateProperties(game);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for missing properties', () => {
        const game = {};
        service.validateProperties(game as any);
        expect(service.errors.length).toBe(PROPERTIES_TO_CHECK.length * 2);
    });

    it('should add errors for incorrect property types', () => {
        const game = {
            gameName: 123,
            id: 123,
            gameDescription: 123,
            mapSize: 123,
            gameType: 123,
            creationDate: 123,
            map: [],
            isVisible: 123,
            lastModified: 123,
        };
        service.validateProperties(game as any);
        expect(service.errors.length).toBe(PROPERTIES_TO_CHECK.length);
    });

    it('should add errors for empty map', () => {
        const game = {
            map: [],
        };
        service.validateMap(game as any);
        expect(service.errors.length).toBeGreaterThan(0);
    });

    it('should add errors for invalid map (not an array)', () => {
        const game = { map: 'invalid' };
        service.validateMap(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should add errors for invalid tiles in the map', () => {
        const game = { map: [{ tileType: 'grass', item: 123 }] };
        service.validateMap(game as any);
        expect(service.errors.length).toBeGreaterThan(0);
    });

    it('should not add errors for valid game name', () => {
        const game = { gameName: 'ValidGame' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for game name with double spaces or leading/trailing spaces', () => {
        const game = { gameName: ' Invalid Game ' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should add errors for game name with invalid symbols', () => {
        const game = { gameName: 'Invalid/Game!' };
        service.validateGameName(game as any);
        expect(service.errors.length).toBe(1);
    });

    it('should return true if id of updated game does not exist', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([{}]),
        } as unknown as Query<Game[], Game>);
        const id = '123';
        const result = await service.idExists(id);
        expect(result).toBeTruthy();
    });

    it('should return false if id of updated game does not exist', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
        } as unknown as Query<Game[], Game>);
        const id = '123';
        const result = await service.idExists(id);
        expect(result).toBeFalsy();
    });

    it('should not add errors for new unique game name and id', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'UniqueGame', id: 'unique-id' };
        await service.validateUniqueChecks(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for new non-unique game name and game id', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([{}]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'NonUniqueGame', id: 'non-unique-id' };
        await service.validateUniqueChecks(game as any);
        expect(service.errors.length).toBe(2);
    });

    it('should not add errors for updated game with same name', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'sameName', id: 'id' };
        await service.validateUniqueNameUpdate(game.gameName, game.id);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for updated game with new non-unique name', async () => {
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValue([{}]),
        } as unknown as Query<Game[], Game>);
        const game = { gameName: 'NonUniqueName', id: 'id' };
        await service.validateUniqueNameUpdate(game.gameName, game.id);
        expect(service.errors.length).toBe(1);
    });

    it('should not add errors for valid map services', () => {
        const game = { map: [{}, {}, {}, {}], mapSize: '2' };
        jest.spyOn(mapValidationService, 'hasStartingPoints').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'hasCorrectGroundAmount').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'areAllTilesAccessible').mockReturnValue(true);
        jest.spyOn(mapValidationService, 'areAllDoorsValid').mockReturnValue(true);
        service.validateMapServices(game as any);
        expect(service.errors.length).toBe(0);
    });

    it('should add errors for invalid map services but with valid map size', () => {
        const game = { map: [{}, {}, {}, {}], mapSize: '2' };
        jest.spyOn(mapValidationService, 'hasStartingPoints').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'hasCorrectGroundAmount').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'areAllTilesAccessible').mockReturnValue(false);
        jest.spyOn(mapValidationService, 'areAllDoorsValid').mockReturnValue(false);
        service.validateMapServices(game as any);
        expect(service.errors.length).toBeGreaterThan(0);
    });

    it('should add errors for invalid mapSize', () => {
        const game = { map: [{}, {}], mapSize: '3' };
        service.validateMapServices(game as any);
        expect(service.errors.length).toBe(1);
    });
    it('should add an error if there is no flag on the map for CTF game mode', () => {
        const game = {
            gameName: 'CTFGame',
            id: '123',
            gameDescription: 'A CTF game',
            mapSize: '10',
            gameType: 'ctf',
            creationDate: '2023-01-01',
            map: [], // No flag on the map
            isVisible: true,
            lastModified: '2023-01-01',
        };
        service.validateCtfGameMode(game as any);
        expect(service.errors).toContain("Il n'y a pas de drapeau sur la carte");
    });

    it('should not add an error if there is a flag on the map for CTF game mode', () => {
        const game = {
            gameName: 'CTFGame',
            id: '123',
            gameDescription: 'A CTF game',
            mapSize: '10',
            gameType: 'classic',
            creationDate: '2023-01-01',
            map: [{ item: 'drapeau-A' }], // Flag on the map
            isVisible: true,
            lastModified: '2023-01-01',
        };
        service.validateCtfGameMode(game as any);
        expect(service.errors).not.toContain("Il n'y a pas de drapeau sur la carte");
    });
});
