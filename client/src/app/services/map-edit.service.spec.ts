/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
import { TileStructure } from '@common/game-structure';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { DragDropService } from './drag-drop.service';
import { MapEditService } from './map-edit.service';
/* eslint-disable */

describe('MapEditService', () => {
    let service: MapEditService;
    const dragDropServiceSpy = jasmine.createSpyObj('DragDropService', [
        'incrementNumberStartingPoints',
        'incrementNumberItem',
        'resetDraggedObject',
        'reduceItemCounter',
        'reduceStartingPointCounter',
        'reduceFlagACounter',
        'incrementFlagACounter',
    ]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DragDropService, useValue: dragDropServiceSpy }],
        });
        service = TestBed.inject(MapEditService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeSelectedTile should set selectedTileType and selectedMode', () => {
        service.selectedItem = 'test';
        service.selectedTileType = '';
        service.changeSelectedTile('test');
        expect(service.selectedItem).toBe('');
        expect(service.selectedTileType).toBe('test');
        expect(service.selectedMode).toBe(CurrentMode.TileTool);
    });
    it('changeSelectedItem should set selectedItem and selectedMode', () => {
        service.selectedItem = '';
        service.selectedTileType = 'test';
        service.changeSelectedItem('test');
        expect(service.selectedItem).toBe('test');
        expect(service.selectedTileType).toBe(TileTypes.BASIC);
        expect(service.selectedMode).toBe(CurrentMode.ItemTool);
    });
    it('setTiles should set the tiles array correctly', () => {
        const tiles: TileStructure[] = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: 'AC1', hasPlayer: true },
        ];
        service.setTiles(tiles);
        expect(service.tiles).toEqual(tiles);
    });
    it('chooseTileType should return newTileType if newTileType is not a door', () => {
        const currentTileType = 'wall';
        const newTileType = 'water';
        expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
    });

    it('chooseTileType should return DOORCLOSED if newTileType is door and currentTileType is not DOORCLOSED', () => {
        const currentTileType = 'wall';
        const newTileType = TileTypes.DOOR;
        expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOORCLOSED);
    });

    it('chooseTileType should return DOOROPEN if newTileType is door and currentTileType is DOORCLOSED', () => {
        const currentTileType = TileTypes.DOORCLOSED;
        const newTileType = TileTypes.DOOR;
        expect(service.chooseTileType(currentTileType, newTileType)).toBe(TileTypes.DOOROPEN);
    });

    it('chooseTileType should return newTileType if currentTileType is DOOROPEN and newTileType is not door', () => {
        const currentTileType = TileTypes.DOOROPEN;
        const newTileType = 'ice';
        expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
    });

    it('chooseTileType should return newTileType if currentTileType is DOORCLOSED and newTileType is not door', () => {
        const currentTileType = TileTypes.DOORCLOSED;
        const newTileType = 'ice';
        expect(service.chooseTileType(currentTileType, newTileType)).toBe(newTileType);
    });

    it('setTileType should call deleteItem if the new tile type is wall', () => {
        const tiles: TileStructure[] = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: 'AC1', hasPlayer: true },
        ];
        service.setTiles(tiles);
        spyOn(service, 'deleteItem');
        spyOn(service, 'chooseTileType').and.returnValue('wall');

        service.setTileType(0, 'wall');

        expect(service.deleteItem).toHaveBeenCalledWith(0);
        expect(service.chooseTileType).toHaveBeenCalledWith('ice', 'wall');
        expect(service.tiles[0].tileType).toBe('wall');
    });

    it('setTileType should call deleteItem if the new tile type is door', () => {
        const tiles: TileStructure[] = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: 'AC1', hasPlayer: true },
        ];
        service.setTiles(tiles);
        spyOn(service, 'deleteItem');
        spyOn(service, 'chooseTileType').and.returnValue(TileTypes.DOORCLOSED);

        service.setTileType(0, TileTypes.DOOR);

        expect(service.deleteItem).toHaveBeenCalledWith(0);
        expect(service.chooseTileType).toHaveBeenCalledWith('ice', TileTypes.DOOR);
        expect(service.tiles[0].tileType).toBe(TileTypes.DOORCLOSED);
    });

    it('setTileType should not call deleteItem if the new tile type is not wall or door', () => {
        const tiles: TileStructure[] = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: 'AC1', hasPlayer: true },
        ];
        service.setTiles(tiles);
        spyOn(service, 'deleteItem');
        spyOn(service, 'chooseTileType').and.returnValue('water');
        service.setTileType(0, 'water');
        expect(service.deleteItem).not.toHaveBeenCalled();
        expect(service.chooseTileType).toHaveBeenCalledWith('ice', 'water');
        expect(service.tiles[0].tileType).toBe('water');
    });
    it('deleteTile should set the tile type to BASIC', () => {
        const tiles: TileStructure[] = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'wall', item: 'AC1', hasPlayer: true },
        ];
        service.setTiles(tiles);
        service.deleteTile(0);
        expect(service.tiles[0].tileType).toBe(TileTypes.BASIC);
    });
    it('delete should call deleteItem if the tile has an item', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        spyOn(service, 'deleteItem');
        spyOn(service, 'deleteTile');

        service.delete(0);

        expect(service.deleteItem).toHaveBeenCalledWith(0);
        expect(service.deleteTile).not.toHaveBeenCalled();
    });

    it('delete should call deleteTile if the tile does not have an item', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        spyOn(service, 'deleteItem');
        spyOn(service, 'deleteTile');

        service.delete(0);

        expect(service.deleteTile).toHaveBeenCalledWith(0);
        expect(service.deleteItem).not.toHaveBeenCalled();
    });
    it('placeTile should call setTileType if isMouseDown, isLeftClick, selectedTileType is not empty, and selectedMode is TileTool', () => {
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.selectedTileType = 'wall';
        service.selectedMode = CurrentMode.TileTool;
        spyOn(service, 'setTileType');
        service.placeTile(0);
        expect(service.setTileType).toHaveBeenCalledWith(0, 'wall');
    });

    it('placeTile should not call setTileType if isMouseDown is false', () => {
        service.isMouseDown = false;
        service.isLeftClick = true;
        service.selectedTileType = 'wall';
        service.selectedMode = CurrentMode.TileTool;
        spyOn(service, 'setTileType');
        service.placeTile(0);
        expect(service.setTileType).not.toHaveBeenCalled();
    });

    it('placeTile should not call setTileType if isLeftClick is false', () => {
        service.isMouseDown = true;
        service.isLeftClick = false;
        service.selectedTileType = 'wall';
        service.selectedMode = CurrentMode.TileTool;
        spyOn(service, 'setTileType');
        service.placeTile(0);
        expect(service.setTileType).not.toHaveBeenCalled();
    });

    it('placeTile should not call setTileType if selectedTileType is empty', () => {
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.selectedTileType = '';
        service.selectedMode = CurrentMode.TileTool;
        spyOn(service, 'setTileType');
        service.placeTile(0);
        expect(service.setTileType).not.toHaveBeenCalled();
    });

    it('placeTile should not call setTileType if selectedMode is not TileTool', () => {
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.selectedTileType = 'wall';
        service.selectedMode = CurrentMode.ItemTool;
        spyOn(service, 'setTileType');
        service.placeTile(0);
        expect(service.setTileType).not.toHaveBeenCalled();
    });
    it('startItemDrag should set isDraggingItem to true', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        service.startItemDrag(0);
        expect(service.isDraggingItem).toBeTrue();
    });

    it('startItemDrag should set draggedItem to the item of the tile at the given index', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        service.startItemDrag(0);
        expect(service.draggedItem).toBe('item-aleatoire');
    });

    it('startItemDrag should set draggedFromIndex to the given index', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        service.startItemDrag(0);
        expect(service.draggedFromIndex).toBe(0);
    });
    it('endItemDrag should place the dragged item on a new tile if conditions are met', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        service.draggedItem = 'item-aleatoire';
        service.draggedFromIndex = 0;
        service.endItemDrag(1);
        expect(service.tiles[1].item).toBe('item-aleatoire');
        expect(service.tiles[0].item).toBe('');
        expect(service.isDraggingItem).toBeFalse();
    });

    it('endItemDrag should not place the dragged item if the target tile is a wall', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: TileTypes.WALL, item: '', hasPlayer: false },
        ];
        service.draggedItem = 'item-aleatoire';
        service.draggedFromIndex = 0;
        service.endItemDrag(1);
        expect(service.tiles[1].item).toBe('');
        expect(service.tiles[0].item).toBe('item-aleatoire');
        expect(service.isDraggingItem).toBeFalse();
    });

    it('endItemDrag should not place the dragged item if the target tile is a doorClosed', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false },
        ];
        service.draggedItem = 'item-aleatoire';
        service.draggedFromIndex = 0;
        service.endItemDrag(1);
        expect(service.tiles[1].item).toBe('');
        expect(service.tiles[0].item).toBe('item-aleatoire');
        expect(service.isDraggingItem).toBeFalse();
    });

    it('endItemDrag should not place the dragged item if the target tile is a doorOpen', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: TileTypes.DOOROPEN, item: '', hasPlayer: false },
        ];
        service.draggedItem = 'item-aleatoire';
        service.draggedFromIndex = 0;
        service.endItemDrag(1);
        expect(service.tiles[1].item).toBe('');
        expect(service.tiles[0].item).toBe('item-aleatoire');
        expect(service.isDraggingItem).toBeFalse();
    });

    it('endItemDrag should not place the dragged item if the target tile is the same as the draggedFromIndex', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        service.draggedItem = 'item-aleatoire';
        service.draggedFromIndex = 0;
        service.endItemDrag(0);
        expect(service.tiles[0].item).toBe('item-aleatoire');
        expect(service.isDraggingItem).toBeFalse();
    });
    it('onMouseDown should set isMouseDown to true', () => {
        const mockEvent = new MouseEvent('mousedown');
        service.isMouseDown = false;
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        service.onMouseDown(0, mockEvent);
        expect(service.isMouseDown).toBeTrue();
    });

    it('onMouseDown should call startItemDrag if the tile has an item', () => {
        const startItemDragSpy = spyOn(service, 'startItemDrag');
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        const mockEvent = new MouseEvent('mousedown');

        service.onMouseDown(0, mockEvent);
        expect(startItemDragSpy).toHaveBeenCalledWith(0);
    });

    it('onMouseDown should set isLeftClick to true and call placeTile if the tile has no item and left button is clicked', () => {
        const placeTileSpy = spyOn(service, 'placeTile');
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        const mockEvent = new MouseEvent('mousedown', { button: 0 });

        service.onMouseDown(0, mockEvent);
        expect(service.isLeftClick).toBeTrue();
        expect(placeTileSpy).toHaveBeenCalledWith(0);
    });

    it('onMouseDown should not call startItemDrag or placeTile if the right button is clicked', () => {
        const startItemDragSpy = spyOn(service, 'startItemDrag');
        const placeTileSpy = spyOn(service, 'placeTile');
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'item-aleatoire', hasPlayer: false }];
        const mockEvent = new MouseEvent('mousedown', { button: 2 });

        service.onMouseDown(0, mockEvent);
        expect(startItemDragSpy).not.toHaveBeenCalled();
        expect(placeTileSpy).not.toHaveBeenCalled();
    });
    it('onMouseUp should set isMouseDown and isLeftClick to false', () => {
        const mockEvent = new MouseEvent('mouseup');
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        service.isDraggingItem = false;
        dragDropServiceSpy.draggedTile = 'test-tile';
        spyOn(service, 'setItemType');
        service.onMouseUp(0, mockEvent);
        expect(service.isMouseDown).toBeFalse();
        expect(service.isLeftClick).toBeFalse();
        expect(service.setItemType).toHaveBeenCalledWith(0, 'test-tile');
    });

    it('onMouseUp should call endItemDrag if isDraggingItem is true', () => {
        const endItemDragSpy = spyOn(service, 'endItemDrag');
        service.isDraggingItem = true;
        const mockEvent = new MouseEvent('mouseup');

        service.onMouseUp(0, mockEvent);

        expect(endItemDragSpy).toHaveBeenCalledWith(0);
    });

    it('onMouseEnter should call placeTile if isMouseDown is true and isLeftClick is true', () => {
        const placeTileSpy = spyOn(service, 'placeTile');
        const mockEvent = new MouseEvent('mouseenter');
        service.isDraggingItem = false;
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.onMouseEnter(0, mockEvent);
        expect(placeTileSpy).toHaveBeenCalledWith(0);
    });

    it('onMouseEnter should call deleteTile if isMouseDown is true and isLeftClick is false', () => {
        const deleteTileSpy = spyOn(service, 'deleteTile');
        const mockEvent = new MouseEvent('mouseenter');
        service.isDraggingItem = false;
        service.isMouseDown = true;
        service.isLeftClick = false;
        service.onMouseEnter(0, mockEvent);
        expect(deleteTileSpy).toHaveBeenCalledWith(0);
    });

    it('onMouseEnter should not call placeTile if isDraggingItem is true', () => {
        const placeTileSpy = spyOn(service, 'placeTile');
        const mockEvent = new MouseEvent('mouseenter');
        service.isDraggingItem = true;
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.onMouseEnter(0, mockEvent);
        expect(placeTileSpy).not.toHaveBeenCalled();
    });

    it('onMouseEnter should not call deleteTile if isDraggingItem is true', () => {
        const deleteTileSpy = spyOn(service, 'deleteTile');
        const mockEvent = new MouseEvent('mouseenter');
        service.isDraggingItem = true;
        service.isMouseDown = true;
        service.isLeftClick = false;
        service.onMouseEnter(0, mockEvent);
        expect(deleteTileSpy).not.toHaveBeenCalled();
    });
    it('onExit should set isMouseDown and isLeftClick to false', () => {
        service.isMouseDown = true;
        service.isLeftClick = true;
        service.onExit();
        expect(service.isMouseDown).toBeFalse();
        expect(service.isLeftClick).toBeFalse();
    });
    it('onDrop should call setItemType with the correct index and draggedTile', () => {
        const setItemTypeSpy = spyOn(service, 'setItemType');
        service.dragDropService.draggedTile = 'test-tile';
        service.onDrop(0);
        expect(setItemTypeSpy).toHaveBeenCalledWith(0, 'test-tile');
    });
    it('onRightClick should call delete with the correct index', () => {
        const deleteSpy = spyOn(service, 'delete');
        service.onRightClick(0);
        expect(deleteSpy).toHaveBeenCalledWith(0);
    });
    it('setItemType should not set item if tile type is WALL', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.WALL, item: '', hasPlayer: false }];
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should not set item if tile type is DOORCLOSED', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false }];
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should not set item if tile type is DOOROPEN', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOOROPEN, item: '', hasPlayer: false }];
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should not set item if draggedTile is empty', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = '';
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should not set item if itemType is startingPoint and startingPointCounter is 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.startingPointCounter = 0;
        service.setItemType(0, 'startingPoint');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should not set item if itemType is item-aleatoire and itemCounter is 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.itemCounter = 0;
        service.setItemType(0, 'item-aleatoire');
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should decrease startingPoint counter if itemType is startingPoint and current item is not startingPoint', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        dragDropServiceSpy.reduceStartingPointCounter = jasmine.createSpy('reduceStartingPointCounter');
        dragDropServiceSpy.draggedTile = 'startingPoint';
        dragDropServiceSpy.startingPointCounter = 1;
        service.setItemType(0, 'startingPoint');
        expect(dragDropServiceSpy.reduceStartingPointCounter).toHaveBeenCalled();
    });

    it('setItemType should decrease randomItem counter if itemType is item-aleatoire and current item is not item-aleatoire', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        dragDropServiceSpy.reduceItemCounter = jasmine.createSpy('reduceItemCounter');
        dragDropServiceSpy.draggedTile = 'item-aleatoire';
        dragDropServiceSpy.itemCounter = 1;
        service.setItemType(0, 'item-aleatoire');
        expect(dragDropServiceSpy.reduceItemCounter).toHaveBeenCalled();
    });

    it('setItemType should set item and reset dragged object', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        dragDropServiceSpy.resetDraggedObject = jasmine.createSpy();
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('test-item');
        expect(dragDropServiceSpy.resetDraggedObject).toHaveBeenCalled();
    });

    it('canItemBePlaced should return false if draggedTile is empty', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = '';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is wall', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.WALL, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is doorClosed', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is doorOpen', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOOROPEN, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if no available counter for itemType', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.AA1;
        dragDropServiceSpy.itemCounter = 0;
        expect(service.canItemBePlaced(0, ItemTypes.AA1)).toBeFalse();
    });

    it('canItemBePlaced should return false if unique item already placed', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: ItemTypes.AA1, hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(1, ItemTypes.AA1)).toBeFalse();
    });

    it('canItemBePlaced should return true if all conditions are met', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        dragDropServiceSpy.itemCounter = 1;
        expect(service.canItemBePlaced(0, 'test-item')).toBeTrue();
    });

    it('canItemBePlaced should return false if draggedTile is empty', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = '';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is wall', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.WALL, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is doorClosed', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOORCLOSED, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if tile type is doorOpen', () => {
        service.tiles = [{ idx: 0, tileType: TileTypes.DOOROPEN, item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = 'test-item';
        expect(service.canItemBePlaced(0, 'test-item')).toBeFalse();
    });

    it('canItemBePlaced should return false if no available counter for itemType', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.AA1;
        dragDropServiceSpy.itemCounter = 0;
        expect(service.canItemBePlaced(0, ItemTypes.AA1)).toBeFalse();
    });

    it('canItemBePlaced should return false if unique item already placed', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: ItemTypes.AA1, hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        dragDropServiceSpy.draggedTile = 'test-item';
        dragDropServiceSpy.itemCounter = 1;
        expect(service.canItemBePlaced(1, ItemTypes.AA1)).toBeFalse();
    });

    it('canItemBePlaced should return false if itemType is startingPoint and startingPointCounter is 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.STARTINGPOINT;
        dragDropServiceSpy.startingPointCounter = 0;
        expect(service.canItemBePlaced(0, ItemTypes.STARTINGPOINT)).toBeFalse();
    });

    it('canItemBePlaced should return false if itemType is flagA and flagACounter is 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.FLAG_A;
        dragDropServiceSpy.flagACounter = 0;
        expect(service.canItemBePlaced(0, ItemTypes.FLAG_A)).toBeFalse();
    });

    it('canItemBePlaced should return true if itemType is flagA and flagACounter is greater than 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.FLAG_A;
        dragDropServiceSpy.flagACounter = 1;
        expect(service.canItemBePlaced(0, ItemTypes.FLAG_A)).toBeTrue();
    });

    it('canItemBePlaced should return true if itemType is startingPoint and startingPointCounter is greater than 0', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        dragDropServiceSpy.draggedTile = ItemTypes.STARTINGPOINT;
        dragDropServiceSpy.startingPointCounter = 1;
        expect(service.canItemBePlaced(0, ItemTypes.STARTINGPOINT)).toBeTrue();
    });

    it('setStartingPointCounterHandler should increment item counter if current item is itemType', () => {
        (service as any).setStartingPointCounterHandler(ItemTypes.AA1);
        expect(dragDropServiceSpy.incrementNumberItem).toHaveBeenCalled();
    });

    it('setStartingPointCounterHandler should increment flagA counter if current item is FLAG_A', () => {
        dragDropServiceSpy.incrementFlagACounter = jasmine.createSpy('incrementFlagACounter');
        (service as any).setStartingPointCounterHandler(ItemTypes.FLAG_A);
        expect(dragDropServiceSpy.incrementFlagACounter).toHaveBeenCalled();
    });

    it('setStartingPointCounterHandler should reduce startingPoint counter if current item is not startingPoint', () => {
        dragDropServiceSpy.reduceStartingPointCounter = jasmine.createSpy('reduceStartingPointCounter');
        (service as any).setStartingPointCounterHandler('test-item');
        expect(dragDropServiceSpy.reduceStartingPointCounter).toHaveBeenCalled();
    });

    it('setFlagACounterHandler should increment item counter if current item is itemType', () => {
        (service as any).setFlagACounterHandler(ItemTypes.RANDOMITEM);
        expect(dragDropServiceSpy.incrementNumberItem).toHaveBeenCalled();
    });

    it('setFlagACounterHandler should increment startingPoint counter if current item is startingPoint', () => {
        dragDropServiceSpy.incrementNumberStartingPoints = jasmine.createSpy('incrementNumberStartingPoints');
        (service as any).setFlagACounterHandler(ItemTypes.STARTINGPOINT);
        expect(dragDropServiceSpy.incrementNumberStartingPoints).toHaveBeenCalled();
    });

    it('setFlagACounterHandler should reduce flagA counter if current item is not FLAG_A', () => {
        dragDropServiceSpy.reduceFlagACounter = jasmine.createSpy('reduceFlagACounter');
        (service as any).setFlagACounterHandler('test-item');
        expect(dragDropServiceSpy.reduceFlagACounter).toHaveBeenCalled();
    });

    it('setFlagBCounterHandler should increment item counter if current item is itemType', () => {
        (service as any).isItemType = jasmine.createSpy('isItemType').and.returnValue(true);
        (service as any).setFlagBCounterHandler('test-item');
        expect(dragDropServiceSpy.incrementNumberItem).toHaveBeenCalled();
    });

    it('setFlagBCounterHandler should increment startingPoint counter if current item is startingPoint', () => {
        dragDropServiceSpy.incrementNumberStartingPoints = jasmine.createSpy('incrementNumberStartingPoints');
        (service as any).setFlagBCounterHandler(ItemTypes.STARTINGPOINT);
        expect(dragDropServiceSpy.incrementNumberStartingPoints).toHaveBeenCalled();
    });

    it('setFlagBCounterHandler should increment flagA counter if current item is FLAG_A', () => {
        dragDropServiceSpy.incrementFlagACounter = jasmine.createSpy('incrementFlagACounter');
        (service as any).setFlagBCounterHandler(ItemTypes.FLAG_A);
        expect(dragDropServiceSpy.incrementFlagACounter).toHaveBeenCalled();
    });

    it('setItemCounterHandler should increment startingPoint counter if current item is startingPoint', () => {
        dragDropServiceSpy.incrementNumberStartingPoints = jasmine.createSpy('incrementNumberStartingPoints');
        service.setItemCounterHandler(ItemTypes.STARTINGPOINT);
        expect(dragDropServiceSpy.incrementNumberStartingPoints).toHaveBeenCalled();
    });

    it('setItemCounterHandler should increment flagA counter if current item is FLAG_A', () => {
        dragDropServiceSpy.incrementFlagACounter = jasmine.createSpy('incrementFlagACounter');
        service.setItemCounterHandler(ItemTypes.FLAG_A);
        expect(dragDropServiceSpy.incrementFlagACounter).toHaveBeenCalled();
    });

    it('setItemCounterHandler should reduce item counter if current item is not itemType', () => {
        dragDropServiceSpy.reduceItemCounter = jasmine.createSpy('reduceItemCounter');
        service.setItemCounterHandler('test-item');
        expect(dragDropServiceSpy.reduceItemCounter).toHaveBeenCalled();
    });

    it('deleteItem should call incrementNumberStartingPoints if the item is startingPoint', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: ItemTypes.STARTINGPOINT, hasPlayer: false }];
        service.deleteItem(0);
        expect(dragDropServiceSpy.incrementNumberStartingPoints).toHaveBeenCalled();
        expect(service.tiles[0].item).toBe('');
    });

    it('deleteItem should call incrementFlagACounter if the item is FLAG_A', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: ItemTypes.FLAG_A, hasPlayer: false }];
        service.deleteItem(0);
        expect(dragDropServiceSpy.incrementFlagACounter).toHaveBeenCalled();
        expect(service.tiles[0].item).toBe('');
    });

    it('deleteItem should call incrementNumberItem if the item is a random item', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: ItemTypes.RANDOMITEM, hasPlayer: false }];
        service.deleteItem(0);
        expect(dragDropServiceSpy.incrementNumberItem).toHaveBeenCalled();
        expect(service.tiles[0].item).toBe('');
    });

    it('deleteItem should set item to empty string if the item is not startingPoint, FLAG_A, or a random item', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        service.deleteItem(0);
        expect(service.tiles[0].item).toBe('');
    });

    it('setItemType should call setStartingPointCounterHandler if itemType is STARTINGPOINT', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        spyOn(service as any, 'setStartingPointCounterHandler');
        spyOn(service as any, 'canItemBePlaced').and.returnValue(true);
        service.setItemType(0, ItemTypes.STARTINGPOINT);
        expect((service as any).setStartingPointCounterHandler).toHaveBeenCalledWith('test-item');
    });

    it('setItemType should call setFlagACounterHandler if itemType is FLAG_A', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        spyOn(service as any, 'setFlagACounterHandler');
        spyOn(service as any, 'canItemBePlaced').and.returnValue(true);
        service.setItemType(0, ItemTypes.FLAG_A);
        expect((service as any).setFlagACounterHandler).toHaveBeenCalledWith('test-item');
    });

    it('setItemType should call setFlagBCounterHandler if itemType is FLAG_B', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        spyOn(service as any, 'setFlagBCounterHandler');
        spyOn(service, 'canItemBePlaced').and.returnValue(true);
        service.setItemType(0, ItemTypes.FLAG_B);
        expect((service as any).setFlagBCounterHandler).toHaveBeenCalledWith('test-item');
    });

    it('setItemType should call setItemCounterHandler if itemType is not STARTINGPOINT, FLAG_A, or FLAG_B', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: 'test-item', hasPlayer: false }];
        spyOn(service, 'setItemCounterHandler');
        spyOn(service, 'canItemBePlaced').and.returnValue(true);
        service.setItemType(0, 'random-item');
        expect(service.setItemCounterHandler).toHaveBeenCalledWith('test-item');
    });

    it('setItemType should set the item of the tile at the given index', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        spyOn(service, 'canItemBePlaced').and.returnValue(true);
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('test-item');
    });

    it('setItemType should call resetDraggedObject', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        spyOn(service, 'canItemBePlaced').and.returnValue(true);
        dragDropServiceSpy.resetDraggedObject = jasmine.createSpy('resetDraggedObject');
        service.setItemType(0, 'test-item');
        expect(dragDropServiceSpy.resetDraggedObject).toHaveBeenCalled();
    });

    it('setItemType should not set the item if canItemBePlaced returns false', () => {
        service.tiles = [{ idx: 0, tileType: 'ice', item: '', hasPlayer: false }];
        spyOn(service, 'canItemBePlaced').and.returnValue(false);
        service.setItemType(0, 'test-item');
        expect(service.tiles[0].item).toBe('');
    });

    it('hasNoAvailableCounter should return true if startingPointCounter is 0 and itemType is STARTINGPOINT', () => {
        dragDropServiceSpy.startingPointCounter = 0;
        expect((service as any).hasNoAvailableCounter(ItemTypes.STARTINGPOINT)).toBeTrue();
    });

    it('hasNoAvailableCounter should return true if itemCounter is 0 and itemType is a random item', () => {
        dragDropServiceSpy.itemCounter = 0;
        expect((service as any).hasNoAvailableCounter(ItemTypes.RANDOMITEM)).toBeTrue();
    });

    it('hasNoAvailableCounter should return true if flagACounter is 0 and itemType is FLAG_A', () => {
        dragDropServiceSpy.flagACounter = 0;
        expect((service as any).hasNoAvailableCounter(ItemTypes.FLAG_A)).toBeTrue();
    });

    it('hasNoAvailableCounter should return false if counters are available', () => {
        dragDropServiceSpy.startingPointCounter = 1;
        dragDropServiceSpy.itemCounter = 1;
        dragDropServiceSpy.flagACounter = 1;
        expect((service as any).hasNoAvailableCounter(ItemTypes.STARTINGPOINT)).toBeFalse();
        expect((service as any).hasNoAvailableCounter(ItemTypes.RANDOMITEM)).toBeFalse();
        expect((service as any).hasNoAvailableCounter(ItemTypes.FLAG_A)).toBeFalse();
    });

    it('isUniqueItemAlreadyPlaced should return true if the unique item is already placed', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: ItemTypes.AA1, hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        expect((service as any).isUniqueItemAlreadyPlaced(ItemTypes.AA1)).toBeTrue();
    });

    it('isUniqueItemAlreadyPlaced should return false if the unique item is not already placed', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: '', hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        expect((service as any).isUniqueItemAlreadyPlaced(ItemTypes.AA1)).toBeFalse();
    });

    it('isUniqueItemAlreadyPlaced should return false if the item is not a unique item type', () => {
        service.tiles = [
            { idx: 0, tileType: 'ice', item: ItemTypes.RANDOMITEM, hasPlayer: false },
            { idx: 1, tileType: 'ice', item: '', hasPlayer: false },
        ];
        expect((service as any).isUniqueItemAlreadyPlaced(ItemTypes.RANDOMITEM)).toBeFalse();
    });
});
