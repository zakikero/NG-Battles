import { Game } from '@app/model/schema/game.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Query } from 'mongoose';
import { ActionHandlerService } from './action-handler/action-handler.service';
import { ActionService } from './action/action.service';
import { ActiveGamesService } from './active-games/active-games.service';
import { CombatService } from './combat/combat.service';
import { DebugModeService } from './debug-mode/debug-mode.service';
import { GameService } from './game.service';
import { InventoryService } from './inventory/inventory.service';
import { LogSenderService } from './log-sender/log-sender.service';
import { MatchService } from './match.service';
import { MovementService } from './movement/movement.service';
import { UniqueItemRandomizerService } from './unique-item-randomiser/unique-item-randomiser.service';
import { VirtualPlayerService } from './virtual-player/virtual-player.service';
/* eslint-disable */
const gameData = {
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

describe('GameService', () => {
    let service: GameService;
    let model: Model<Game>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getModelToken('Game'),
                    useValue: {
                        create: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        deleteOne: jest.fn(),
                        exec: jest.fn(),
                    },
                },
                {
                    provide: LogSenderService,
                    useValue: {},
                },
                {
                    provide: VirtualPlayerService,
                    useValue: {},
                },

                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                ActionService,
                MatchService,
                ActiveGamesService,
                InventoryService,
                DebugModeService,
                CombatService,
                MovementService,
                UniqueItemRandomizerService,
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        model = module.get<Model<Game>>(getModelToken('Game'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a game', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(model, 'create').mockImplementationOnce(async () => Promise.resolve(gameData as any));
        const result = await service.create(gameData);
        expect(result).toEqual(gameData);
    });

    it('should update a game', async () => {
        jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(gameData),
        } as unknown as Query<Game, Game>);
        const result = await service.update(gameData);
        expect(result).toEqual(gameData);
    });

    it('should change visibility of a game', async () => {
        jest.spyOn(model, 'findOne').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(gameData),
        } as unknown as Query<Game, Game>);

        const updatedGameData = { ...gameData, isVisible: !gameData.isVisible };

        jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(updatedGameData),
        } as unknown as Query<Game, Game>);

        const result = await service.changeVisibility('123');
        expect(model.findOne).toBeCalled();
        expect(result).toEqual(updatedGameData);
    });

    it('should delete a game', async () => {
        await service.delete('123');
        expect(model.deleteOne).toBeCalled();
    });

    it('should return a game by id', async () => {
        jest.spyOn(model, 'findOne').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(gameData),
        } as unknown as Query<Game, Game>);
        const result = await service.get('123');
        expect(result).toEqual(gameData);
    });

    it('should return all games', async () => {
        const mockGames = [gameData, gameData, gameData];
        jest.spyOn(model, 'find').mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(mockGames),
        } as unknown as Query<Game[], Game>);
        const result = await service.getAll();
        expect(result).toEqual(mockGames);
    });
});
