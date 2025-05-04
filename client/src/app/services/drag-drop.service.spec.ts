import { TestBed } from '@angular/core/testing';
import { TileStructure } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';
import { DragDropService } from './drag-drop.service';
/* eslint-disable */

describe('DragDropService', () => {
    let service: DragDropService;

    const MAP_SIZE_SMALL = 10;
    const MAP_SIZE_MEDIUM = 15;
    const MAP_SIZE_LARGE = 20;
    const STARTING_COUNTER_TWO = 2;
    const RANDOM_ITEM_COUNTER_TWO = 2;
    const STARTING_COUNTER_FOUR = 4;
    const RANDOM_ITEM_COUNTER_FOUR = 4;
    const STARTING_COUNTER_SIX = 6;
    const RANDOM_ITEM_COUNTER_SIX = 6;

    function createTiles(size: number) {
        return Array(size * size)
            .fill(0)
            .map((_, index) => {
                // Assign a unique id based on the index
                return {
                    idx: index, // Unique ID for each tile
                    tileType: TileTypes.BASIC, // Tile type
                    item: '',
                    hasPlayer: false,
                };
            }) as TileStructure[];
    }

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DragDropService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the dragged object', () => {
        const objectType = 'exampleObjectType';
        service.setDraggedObject(objectType);
        expect(service.draggedTile).toBe(objectType);
    });

    it('should reset the dragged object', () => {
        service.resetDraggedObject();
        expect(service.draggedTile).toBe('');
        expect(service.transparentImage).toBe('');
    });

    it('should reduce the number of starting points', () => {
        const STARTING_COUNTER = 5;
        const REDUCE_COUNTER = 4;
        service.startingPointCounter = STARTING_COUNTER;
        service.reduceStartingPointCounter();
        expect(service.startingPointCounter).toBe(REDUCE_COUNTER);
        const REDUCE_COUNTER_ZERO = 0;
        service.startingPointCounter = REDUCE_COUNTER_ZERO;
        service.reduceStartingPointCounter();
        expect(service.startingPointCounter).toBe(REDUCE_COUNTER_ZERO);
    });

    it('should increment the number of starting points', () => {
        const STARTING_COUNTER = 5;
        const STARTING_COUNTER_INCREMENT = 6;
        service.startingPointCounter = STARTING_COUNTER;
        service.incrementNumberStartingPoints();
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_INCREMENT);
    });

    it('should count starting points correctly', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'startingPoint';
        const count = service.countStartingPoints(tiles);
        expect(count).toBe(2);
    });

    it('should count placed random items correctly', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'item-aleatoire';
        tiles[1].item = 'item-aleatoire';
        tiles[2].item = 'item-aleatoire';
        const count = service.countPlacedRandomItems(tiles);
        expect(count).toBe(3);
    });

    it('should handle flag counters correctly', () => {
        service.flagACounter = 1;

        service.reduceFlagACounter();
        expect(service.flagACounter).toBe(0);

        service.incrementFlagACounter();
        expect(service.flagACounter).toBe(1);

        // Should not increment above 1
        service.incrementFlagACounter();
        expect(service.flagACounter).toBe(1);
    });

    it('should reduce item counter', () => {
        service.itemCounter = 5;
        service.reduceItemCounter();
        expect(service.itemCounter).toBe(4);

        service.itemCounter = 0;
        service.reduceItemCounter();
        expect(service.itemCounter).toBe(0);
    });

    it('should increment item counter', () => {
        service.itemCounter = 5;
        service.incrementNumberItem();
        expect(service.itemCounter).toBe(6);
    });

    it('should set multiple item counter correctly for small map size', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'item-aleatoire';

        service.setMultipleItemCounter(MAP_SIZE_SMALL, tiles);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_TWO - 1);
        expect(service.itemCounter).toBe(RANDOM_ITEM_COUNTER_TWO - 1);
        expect(service.flagACounter).toBe(1);
    });

    it('should set multiple item counter correctly for medium map size', () => {
        const tiles = createTiles(MAP_SIZE_MEDIUM);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'startingPoint';
        tiles[2].item = 'item-aleatoire';
        tiles[3].item = 'item-aleatoire';

        service.setMultipleItemCounter(MAP_SIZE_MEDIUM, tiles);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_FOUR - 2);
        expect(service.itemCounter).toBe(RANDOM_ITEM_COUNTER_FOUR - 2);
        expect(service.flagACounter).toBe(1);
    });

    it('should set multiple item counter correctly for large map size', () => {
        const tiles = createTiles(MAP_SIZE_LARGE);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'startingPoint';
        tiles[2].item = 'startingPoint';
        tiles[3].item = 'item-aleatoire';
        tiles[4].item = 'item-aleatoire';
        tiles[5].item = 'item-aleatoire';

        service.setMultipleItemCounter(MAP_SIZE_LARGE, tiles);
        expect(service.startingPointCounter).toBe(STARTING_COUNTER_SIX - 3);
        expect(service.itemCounter).toBe(RANDOM_ITEM_COUNTER_SIX - 3);
        expect(service.flagACounter).toBe(1);
    });

    it('should not set negative counters', () => {
        const tiles = createTiles(MAP_SIZE_SMALL);
        tiles[0].item = 'startingPoint';
        tiles[1].item = 'startingPoint';
        tiles[2].item = 'startingPoint';
        tiles[3].item = 'item-aleatoire';
        tiles[4].item = 'item-aleatoire';
        tiles[5].item = 'item-aleatoire';

        service.setMultipleItemCounter(MAP_SIZE_SMALL, tiles);
        expect(service.startingPointCounter).toBe(0);
        expect(service.itemCounter).toBe(0);
        expect(service.flagACounter).toBe(1);
    });
});
