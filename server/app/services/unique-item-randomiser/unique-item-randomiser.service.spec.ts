import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { TileStructure } from '@common/game-structure';
import { ItemTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
/* eslint-disable */
describe('UniqueItemRandomizerService', () => {
    let service: UniqueItemRandomizerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UniqueItemRandomizerService,
                {
                    provide: LogSenderService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<UniqueItemRandomizerService>(UniqueItemRandomizerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should return used unique items', () => {
        const map = [
            { item: ItemTypes.AA1 },
            { item: ItemTypes.EMPTY },
            { item: ItemTypes.AA2 },
            { item: ItemTypes.STARTINGPOINT },
            { item: ItemTypes.FLAG_A },
            { item: ItemTypes.FLAG_B },
            { item: ItemTypes.RANDOMITEM },
            { item: ItemTypes.AC1 },
        ] as TileStructure[];

        const result = (service as any).getUsedUniqueItems(map);
        expect(result).toEqual([ItemTypes.AA1, ItemTypes.AA2, ItemTypes.AC1]);
    });
    it('should return available unique items', () => {
        const map = [
            { item: ItemTypes.AA1 },
            { item: ItemTypes.EMPTY },
            { item: ItemTypes.AA2 },
            { item: ItemTypes.STARTINGPOINT },
            { item: ItemTypes.FLAG_A },
            { item: ItemTypes.FLAG_B },
            { item: ItemTypes.RANDOMITEM },
            { item: ItemTypes.AC1 },
        ] as TileStructure[];

        const result = (service as any).getAvailableUniqueItems(map);
        expect(result).toEqual([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]);
    });
    it('should return random items with unique items assigned', () => {
        const map = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.EMPTY },
            { idx: 2, item: ItemTypes.AA2 },
            { idx: 3, item: ItemTypes.STARTINGPOINT },
            { idx: 4, item: ItemTypes.FLAG_A },
            { idx: 5, item: ItemTypes.FLAG_B },
            { idx: 6, item: ItemTypes.RANDOMITEM },
            { idx: 7, item: ItemTypes.RANDOMITEM },
            { idx: 8, item: ItemTypes.AC1 },
        ] as TileStructure[];

        const result = (service as any).getRandomItems(map);
        expect(result.length).toBe(2);
        expect(result[0].idx).toBe(6);
        expect(result[1].idx).toBe(7);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(result[0].item);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(result[1].item);
    });
    it('should randomize unique items in the map', () => {
        const map = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.EMPTY },
            { idx: 2, item: ItemTypes.AA2 },
            { idx: 3, item: ItemTypes.STARTINGPOINT },
            { idx: 4, item: ItemTypes.FLAG_A },
            { idx: 5, item: ItemTypes.FLAG_B },
            { idx: 6, item: ItemTypes.RANDOMITEM },
            { idx: 7, item: ItemTypes.RANDOMITEM },
            { idx: 8, item: ItemTypes.AC1 },
        ] as TileStructure[];

        const result = service.randomizeUniqueItems(map);
        expect(result.length).toBe(2);
        expect(result[0].idx).toBe(6);
        expect(result[1].idx).toBe(7);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(result[0].item);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(result[1].item);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(map[6].item);
        expect([ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2]).toContain(map[7].item);
    });
});
