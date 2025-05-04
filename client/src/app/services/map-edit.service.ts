import { inject, Injectable } from '@angular/core';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { DragDropService } from '@app/services/drag-drop.service';
import { TileStructure } from '@common/game-structure';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { MapBaseService } from './map-base.service';

@Injectable({
    providedIn: 'root',
})
export class MapEditService extends MapBaseService {
    selectedTileType: string = '';
    selectedItem: string = '';
    selectedMode: CurrentMode = CurrentMode.NotSelected;

    isMouseDown = false;
    isLeftClick = false;
    isDraggingItem = false;
    draggedItem: string = '';
    draggedFromIndex: number = -1;

    dragDropService = inject(DragDropService);

    changeSelectedTile(tileType: string): void {
        this.selectedItem = '';
        this.selectedTileType = tileType;
        this.selectedMode = CurrentMode.TileTool;
    }

    changeSelectedItem(itemType: string): void {
        this.selectedItem = itemType;
        this.selectedTileType = TileTypes.BASIC;
        this.selectedMode = CurrentMode.ItemTool;
    }

    setTiles(tiles: TileStructure[]) {
        this.tiles = tiles;
    }

    setTileType(index: number, tileType: string) {
        const currentTileType = this.tiles[index].tileType;
        if (tileType === TileTypes.WALL || tileType === TileTypes.DOOR) {
            this.deleteItem(index);
        }
        tileType = this.chooseTileType(currentTileType, tileType);
        this.tiles[index].tileType = tileType;
    }

    chooseTileType(currentTileType: string, newTileType: string): string {
        if (newTileType === TileTypes.DOOR) {
            if (currentTileType === TileTypes.DOORCLOSED) {
                newTileType = TileTypes.DOOROPEN;
            } else {
                newTileType = TileTypes.DOORCLOSED;
            }
        }
        return newTileType;
    }

    canItemBePlaced(index: number, itemType: string): boolean {
        if (this.dragDropService.draggedTile === '') return false;
        if (this.isWallOrDoor(this.tiles[index].tileType)) return false;
        if (this.hasNoAvailableCounter(itemType)) return false;
        if (this.isUniqueItemAlreadyPlaced(itemType)) return false;

        return true;
    }

    setItemCounterHandler(currentItemType: string) {
        if (currentItemType === ItemTypes.STARTINGPOINT) {
            this.dragDropService.incrementNumberStartingPoints();
        } else if (currentItemType === ItemTypes.FLAG_A) {
            this.dragDropService.incrementFlagACounter();
        }
        if (!this.isItemType(currentItemType)) {
            this.dragDropService.reduceItemCounter();
        }
    }

    setItemType(index: number, itemType: string) {
        const currentItemType = this.tiles[index].item;
        if (!this.canItemBePlaced(index, itemType)) return;

        switch (itemType) {
            case ItemTypes.STARTINGPOINT:
                this.setStartingPointCounterHandler(currentItemType);
                break;
            case ItemTypes.FLAG_A:
                this.setFlagACounterHandler(currentItemType);
                break;
            case ItemTypes.FLAG_B:
                this.setFlagBCounterHandler(currentItemType);
                break;
            default:
                this.setItemCounterHandler(currentItemType);
                break;
        }
        this.tiles[index].item = itemType;
        this.dragDropService.resetDraggedObject();
    }

    isItemType(itemType: string): boolean {
        return this.isUniqueItemType(itemType) || itemType === ItemTypes.RANDOMITEM;
    }

    isUniqueItemType(itemType: string): boolean {
        return (
            itemType === ItemTypes.AA1 ||
            itemType === ItemTypes.AA2 ||
            itemType === ItemTypes.AC1 ||
            itemType === ItemTypes.AC2 ||
            itemType === ItemTypes.AF1 ||
            itemType === ItemTypes.AF2
        );
    }

    deleteItem(index: number) {
        const currentItemType = this.tiles[index].item;

        if (currentItemType === ItemTypes.STARTINGPOINT) {
            this.dragDropService.incrementNumberStartingPoints();
        } else if (currentItemType === ItemTypes.FLAG_A) {
            this.dragDropService.incrementFlagACounter();
        } else if (this.isItemType(currentItemType)) {
            this.dragDropService.incrementNumberItem();
        }

        this.tiles[index].item = '';
    }

    deleteTile(index: number) {
        this.tiles[index].tileType = TileTypes.BASIC;
    }

    delete(index: number) {
        if (this.tiles[index].item !== '') {
            this.deleteItem(index);
        } else {
            this.deleteTile(index);
        }
    }

    placeTile(index: number) {
        if (this.isMouseDown && this.isLeftClick && this.selectedTileType && this.selectedMode === CurrentMode.TileTool) {
            this.setTileType(index, this.selectedTileType);
        }
    }

    startItemDrag(index: number) {
        this.isDraggingItem = true;
        this.draggedItem = this.tiles[index].item;
        this.draggedFromIndex = index;
    }

    endItemDrag(index: number) {
        // check if the tile is not a wall or door and not the same tile from which the item is dragged
        if (
            this.tiles[index].tileType !== TileTypes.WALL &&
            this.tiles[index].tileType !== TileTypes.DOORCLOSED &&
            this.tiles[index].tileType !== TileTypes.DOOROPEN &&
            this.tiles[index].item === '' &&
            index !== this.draggedFromIndex
        ) {
            this.tiles[index].item = this.draggedItem;
            this.tiles[this.draggedFromIndex].item = '';
            this.draggedItem = '';
            this.draggedFromIndex = -1;
        }
        this.isDraggingItem = false;
    }

    onMouseDown(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isMouseDown = true;

        if (event.button === 0) {
            // priority to drag item from one tile to another
            if (this.tiles[index].item !== '') {
                this.startItemDrag(index);
                return;
            }

            this.isLeftClick = true;
            this.placeTile(index);
        }
    }

    onMouseUp(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isMouseDown = false;
        this.isLeftClick = false;
        // to drag item from one tile to another
        if (this.isDraggingItem) {
            this.endItemDrag(index);
            return;
        }

        if (event.button === 0) this.setItemType(index, this.dragDropService.draggedTile);
    }

    onMouseEnter(index: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        // ignore placement or deletion if dragging item from one tile to another
        if (!this.isDraggingItem) {
            if (this.isMouseDown && this.isLeftClick) {
                this.placeTile(index);
            } else if (this.isMouseDown && !this.isLeftClick) {
                this.deleteTile(index);
            }
        }
    }

    onExit() {
        this.isMouseDown = false;
        this.isLeftClick = false;
    }

    onRightClick(index: number) {
        this.delete(index);
    }

    onDrop(index: number) {
        this.setItemType(index, this.dragDropService.draggedTile);
    }

    private setStartingPointCounterHandler(currentItemType: string) {
        if (this.isItemType(currentItemType)) {
            this.dragDropService.incrementNumberItem();
        } else if (currentItemType === ItemTypes.FLAG_A) {
            this.dragDropService.incrementFlagACounter();
        }
        if (currentItemType !== ItemTypes.STARTINGPOINT) {
            this.dragDropService.reduceStartingPointCounter();
        }
    }

    private setFlagACounterHandler(currentItemType: string) {
        if (this.isItemType(currentItemType)) {
            this.dragDropService.incrementNumberItem();
        } else if (currentItemType === ItemTypes.STARTINGPOINT) {
            this.dragDropService.incrementNumberStartingPoints();
        }
        if (currentItemType !== ItemTypes.FLAG_A) {
            this.dragDropService.reduceFlagACounter();
        }
    }

    private setFlagBCounterHandler(currentItemType: string) {
        if (this.isItemType(currentItemType)) {
            this.dragDropService.incrementNumberItem();
        } else if (currentItemType === ItemTypes.STARTINGPOINT) {
            this.dragDropService.incrementNumberStartingPoints();
        } else if (currentItemType === ItemTypes.FLAG_A) {
            this.dragDropService.incrementFlagACounter();
        }
    }

    private isWallOrDoor(tileType: string): boolean {
        return tileType === TileTypes.WALL || tileType === TileTypes.DOORCLOSED || tileType === TileTypes.DOOROPEN;
    }

    private hasNoAvailableCounter(itemType: string): boolean {
        return (
            (itemType === ItemTypes.STARTINGPOINT && this.dragDropService.startingPointCounter === 0) ||
            (this.isItemType(itemType) && this.dragDropService.itemCounter === 0) ||
            (itemType === ItemTypes.FLAG_A && this.dragDropService.flagACounter === 0)
        );
    }

    private isUniqueItemAlreadyPlaced(itemType: string): boolean {
        const itemAlreadyExists = this.tiles.find((tile) => tile.item === itemType) !== undefined;
        return this.isUniqueItemType(itemType) && itemAlreadyExists;
    }
}
