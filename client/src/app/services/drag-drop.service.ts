import { Injectable } from '@angular/core';
import {
    DEFAULT_MAP_SIZE_MEDIUM,
    DEFAULT_MAP_SIZE_SMALL,
    DEFAULT_STARTING_COUNTER_FOUR,
    DEFAULT_STARTING_COUNTER_ONE,
    DEFAULT_STARTING_COUNTER_SIX,
    DEFAULT_STARTING_COUNTER_TWO,
} from '@app/services/constants';
import { TileStructure } from '@common/game-structure';

@Injectable({
    providedIn: 'root',
})
export class DragDropService {
    startingPointCounter: number = DEFAULT_STARTING_COUNTER_TWO;
    itemCounter: number = DEFAULT_STARTING_COUNTER_TWO;
    flagACounter: number = DEFAULT_STARTING_COUNTER_ONE;

    draggedTile: string = '';
    transparentImage: string = '';

    setDraggedObject(objectType: string) {
        this.draggedTile = objectType;
    }

    resetDraggedObject() {
        this.draggedTile = '';
        this.transparentImage = '';
    }

    setMultipleItemCounter(mapSize: number, map: TileStructure[]) {
        const placedStartingPoints = this.countStartingPoints(map);
        const placedRandomItems = this.countPlacedRandomItems(map);

        let startingCounter: number;
        if (mapSize === DEFAULT_MAP_SIZE_SMALL) {
            startingCounter = DEFAULT_STARTING_COUNTER_TWO;
        } else if (mapSize === DEFAULT_MAP_SIZE_MEDIUM) {
            startingCounter = DEFAULT_STARTING_COUNTER_FOUR;
        } else {
            startingCounter = DEFAULT_STARTING_COUNTER_SIX;
        }

        this.flagACounter = 1;
        this.startingPointCounter = startingCounter - placedStartingPoints < 0 ? 0 : startingCounter - placedStartingPoints;
        this.itemCounter = startingCounter - placedRandomItems < 0 ? 0 : startingCounter - placedRandomItems;
    }

    countStartingPoints(map: TileStructure[]) {
        return map.reduce((acc, tile) => {
            return tile.item === 'startingPoint' ? acc + 1 : acc;
        }, 0);
    }

    countPlacedRandomItems(map: TileStructure[]) {
        return map.reduce((acc, tile) => {
            return tile.item === 'item-aleatoire' ? acc + 1 : acc;
        }, 0);
    }

    reduceStartingPointCounter() {
        if (this.startingPointCounter > 0) this.startingPointCounter--;
    }
    reduceItemCounter() {
        if (this.itemCounter > 0) this.itemCounter--;
    }
    reduceFlagACounter() {
        if (this.flagACounter > 0) this.flagACounter--;
    }
    incrementNumberStartingPoints() {
        this.startingPointCounter++;
    }
    incrementNumberItem() {
        this.itemCounter++;
    }
    incrementFlagACounter() {
        if (this.flagACounter === 0) this.flagACounter++;
    }
}
