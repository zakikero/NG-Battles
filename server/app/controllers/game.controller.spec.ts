import { GameValidationService } from '@app/services/game-validation.service';
import { GameService } from '@app/services/game.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { GameStructure } from '@common/game-structure';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

describe('GameController', () => {
    let gameController: GameController;
    let gameService: GameService;
    let gameValidationService: GameValidationService;

    const gameData: GameStructure = {
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
            controllers: [GameController],
            providers: [
                {
                    provide: GameValidationService,
                    useValue: {
                        validateNewGame: jest.fn(),
                        validateUpdatedGame: jest.fn(),
                        idExists: jest.fn(),
                    },
                },
                {
                    provide: GameService,
                    useValue: {
                        create: jest.fn(),
                        update: jest.fn(),
                        changeVisibility: jest.fn(),
                        delete: jest.fn(),
                        get: jest.fn(),
                        getAll: jest.fn(),
                    },
                },
                {
                    provide: LogSenderService,
                    useValue: {},
                },
            ],
        }).compile();

        gameController = module.get<GameController>(GameController);
        gameService = module.get<GameService>(GameService);
        gameValidationService = module.get<GameValidationService>(GameValidationService);
    });

    it('should be defined', () => {
        expect(gameController).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call validateGame method of validationService and return HTTP exception', async () => {
        const errors = ['error1', 'error2'];
        jest.spyOn(gameValidationService, 'idExists').mockResolvedValue(true);
        jest.spyOn(gameValidationService, 'validateNewGame').mockResolvedValue(errors);
        jest.spyOn(gameValidationService, 'validateUpdatedGame').mockResolvedValue(errors);
        await expect(gameController.uploadGame(gameData)).rejects.toThrow(HttpException);
        await expect(gameController.updateGame(gameData)).rejects.toThrow(HttpException);
        expect(gameValidationService.validateNewGame).toHaveBeenCalledWith(gameData);
        expect(gameValidationService.validateUpdatedGame).toHaveBeenCalledWith(gameData);
    });

    it('should call idExists method of gameValidationService and return HTTP exception', async () => {
        jest.spyOn(gameValidationService, 'idExists').mockResolvedValue(false);
        await expect(gameController.updateGame(gameData)).rejects.toThrow(HttpException);
        expect(gameValidationService.idExists).toHaveBeenCalledWith(gameData.id);
    });

    it('should call create method of gameService', async () => {
        jest.spyOn(gameValidationService, 'validateNewGame').mockResolvedValue([]);
        await gameController.uploadGame(gameData);
        expect(gameService.create).toHaveBeenCalledWith(gameData);
    });

    it('should call update method of gameService', async () => {
        jest.spyOn(gameValidationService, 'idExists').mockResolvedValue(true);
        jest.spyOn(gameValidationService, 'validateUpdatedGame').mockResolvedValue([]);
        await gameController.updateGame(gameData);
        expect(gameService.update).toHaveBeenCalledWith(gameData);
    });

    it('should call changeVisibility method of gameService', async () => {
        await gameController.changeVisibility('123');
        expect(gameService.changeVisibility).toHaveBeenCalledWith('123');
    });

    it('should call delete method of gameService', async () => {
        await gameController.deleteGame('123');
        expect(gameService.delete).toHaveBeenCalledWith('123');
    });

    it('should call get method of gameService', async () => {
        await gameController.getGame('123');
        expect(gameService.get).toHaveBeenCalledWith('123');
    });

    it('should call getAll method of gameService', async () => {
        await gameController.getAllGames();
        expect(gameService.getAll).toHaveBeenCalled();
    });
});
