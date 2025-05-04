import { Test, TestingModule } from '@nestjs/testing';
import { ActiveGamesService } from './active-games/active-games.service';
import { GameService } from './game.service';
import { LogSenderService } from './log-sender/log-sender.service';
import { MapValidationService } from './map-validation.service';
import { UniqueItemRandomizerService } from './unique-item-randomiser/unique-item-randomiser.service';
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('MapValidationService', () => {
    let service: MapValidationService;

    beforeEach(async () => {
        service = new MapValidationService();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActiveGamesService,
                { provide: LogSenderService, useValue: {} },
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return true if a small map has starting points', () => {
        const smallMap = new Array(100).fill({ idx: 0, tileType: '', item: '', hasPlayer: false });
        smallMap[0] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        smallMap[99] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        expect(service.hasStartingPoints(smallMap, 10)).toBe(true);
    });

    it('should return true if a medium map has starting points', () => {
        const mediumMap = new Array(225).fill({ idx: 0, tileType: '', item: '', hasPlayer: false });
        mediumMap[0] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        mediumMap[1] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        mediumMap[2] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        mediumMap[3] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        expect(service.hasStartingPoints(mediumMap, 15)).toBe(true);
    });

    it('should return true if a large map has starting points', () => {
        const largeMap = new Array(400).fill({ idx: 0, tileType: '', item: '', hasPlayer: false });
        largeMap[0] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        largeMap[1] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        largeMap[2] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        largeMap[3] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        largeMap[4] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        largeMap[5] = { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false };
        expect(service.hasStartingPoints(largeMap, 20)).toBe(true);
    });

    it('should return false if a map has no starting points', () => {
        const map = new Array(100).fill({ idx: 0, tileType: '', item: '', hasPlayer: false });
        expect(service.hasStartingPoints(map, 10)).toBe(false);
    });

    it('should return true if map has correct ground amount', () => {
        const map = new Array(100).fill({ idx: 0, tileType: 'grass', item: '', hasPlayer: false });
        expect(service.hasCorrectGroundAmount(map)).toBe(true);
    });

    it('should return false if map has incorrect ground amount', () => {
        const map = new Array(100).fill({ idx: 0, tileType: 'wall', item: '', hasPlayer: false });
        expect(service.hasCorrectGroundAmount(map)).toBe(false);
    });

    it('should return true if all tiles are accessible', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: '', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: '', item: '', hasPlayer: false },
            { idx: 4, tileType: '', item: '', hasPlayer: false },
            { idx: 5, tileType: '', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllTilesAccessible(map, 3)).toBe(true);
    });

    it('should return false if all tiles are not accessible', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: '', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 4, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: 'ice', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllTilesAccessible(map, 3)).toBe(false);
    });

    it('should return true if vertical door is valid', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: 'water', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 4, tileType: 'doorClosed', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllDoorsValid(map, 3)).toBe(true);
    });

    it('should return true if horizontal door is valid', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'ice', item: '', hasPlayer: false },
            { idx: 4, tileType: 'doorClosed', item: '', hasPlayer: false },
            { idx: 5, tileType: '', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllDoorsValid(map, 3)).toBe(true);
    });

    it('should return false if vertical door is invalid', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 4, tileType: 'doorClosed', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: '', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllDoorsValid(map, 3)).toBe(false);
    });

    it('should return false if horizontal door is invalid', () => {
        const map = [
            { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 2, tileType: '', item: '', hasPlayer: false },
            { idx: 3, tileType: '', item: '', hasPlayer: false },
            { idx: 4, tileType: 'doorClosed', item: '', hasPlayer: false },
            { idx: 5, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 6, tileType: '', item: '', hasPlayer: false },
            { idx: 7, tileType: 'wall', item: '', hasPlayer: false },
            { idx: 8, tileType: '', item: 'startingPoint', hasPlayer: false },
        ];
        expect(service.areAllDoorsValid(map, 3)).toBe(false);
    });
});
