import { TileStructure } from '@common/game-structure';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UniqueItemRandomizerService {
    randomizeUniqueItems(map: TileStructure[]): { idx: number; item: ItemTypes }[] {
        const randomItems = this.getRandomItems(map);

        randomItems.forEach((randomItem) => {
            map[randomItem.idx].item = randomItem.item;
        });

        return randomItems;
    }
    private getUsedUniqueItems(map: TileStructure[]): string[] {
        const uniqueItems = map.reduce((acc: string[], tile) => {
            if (
                tile.item !== ItemTypes.EMPTY &&
                tile.item !== ItemTypes.STARTINGPOINT &&
                tile.item !== ItemTypes.FLAG_A &&
                tile.item !== ItemTypes.FLAG_B &&
                tile.item !== ItemTypes.RANDOMITEM
            ) {
                acc.push(tile.item);
            }
            return acc;
        }, []);

        return uniqueItems;
    }

    private getAvailableUniqueItems(map: TileStructure[]): ItemTypes[] {
        const uniqueItems = this.getUsedUniqueItems(map);
        const availableUniqueItems = [ItemTypes.AA1, ItemTypes.AA2, ItemTypes.AC1, ItemTypes.AC2, ItemTypes.AF1, ItemTypes.AF2].filter(
            (item) => !uniqueItems.includes(item),
        );
        return availableUniqueItems;
    }

    private getRandomItems(map: TileStructure[]): { idx: number; item: ItemTypes }[] {
        const availableUniqueItems = this.getAvailableUniqueItems(map);

        const randomItems = map.filter((tile) => tile.item === ItemTypes.RANDOMITEM).map((tile) => tile.idx);

        return randomItems.map((randomItemIndex) => {
            const uniqueItemIndex = Math.floor(Math.random() * availableUniqueItems.length);
            const uniqueItem = availableUniqueItems.splice(uniqueItemIndex, 1);
            return { idx: randomItemIndex, item: uniqueItem[0] };
        });
    }
}
