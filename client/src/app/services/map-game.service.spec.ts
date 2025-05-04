import { TestBed } from '@angular/core/testing';
import { GameState, GameTile, ShortestPathByTile, TilePreview } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { ActionStateService } from './action-state.service';
import { CombatStateService } from './combat-state.service';
import { MOCK_PLAYER, TEST_SHORTEST_PATH_BY_INDEX } from './constants';
import { MapGameService } from './map-game.service';
import { MovingStateService } from './moving-state.service';
import { NotPlayingStateService } from './not-playing-state.service';
/* eslint-disable */

const player1: Player = MOCK_PLAYER;

/* eslint-disable */ // Magic numbers are used for testing purposes

const availableTiles = [1, 2, 3, 4, 5];

/* eslint-enable */

const notPlayingStateServiceSpy = jasmine.createSpyObj('NotPlayingStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'resetMovementPrevisualization',
    'getAvailableTiles',
    'getShortestPathByTile',
]);
const movingStateServiceSpy = jasmine.createSpyObj('MovingStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'resetMovementPrevisualization',
    'getShortestPathByIndex',
    'getAvailableTiles',
    'availablesTilesIncludes',
    'getShortestPathByTile',
]);
const actionStateServiceSpy = jasmine.createSpyObj('ActionStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'resetMovementPrevisualization',
    'initializePrevisualization',
]);
const combatStateServiceSpy = jasmine.createSpyObj('CombatStateService', [
    'onMouseDown',
    'onMouseEnter',
    'onMouseUp',
    'onRightClick',
    'resetMovementPrevisualization',
]);

describe('MapGameService', () => {
    let service: MapGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: NotPlayingStateService, useValue: notPlayingStateServiceSpy },
                { provide: MovingStateService, useValue: movingStateServiceSpy },
                { provide: ActionStateService, useValue: actionStateServiceSpy },
                { provide: CombatStateService, useValue: combatStateServiceSpy },
                MapGameService,
            ],
        });
        service = TestBed.inject(MapGameService);
        service.tiles = [
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 0,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 1,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
            {
                player: player1,
                isAccessible: TilePreview.NONE,
                idx: 2,
                tileType: '',
                item: '',
                hasPlayer: false,
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the state correctly', () => {
        service.setState(GameState.MOVING);
        expect(service.currentStateNumber).toBe(GameState.MOVING);
        expect(service['currentState']).toBe(movingStateServiceSpy);

        service.setState(GameState.ACTION);
        expect(service.currentStateNumber).toBe(GameState.ACTION);
        expect(service['currentState']).toBe(actionStateServiceSpy);

        service.setState(GameState.COMBAT);
        expect(service.currentStateNumber).toBe(GameState.COMBAT);
        expect(service['currentState']).toBe(combatStateServiceSpy);

        service.setState(GameState.NOTPLAYING);
        expect(service.currentStateNumber).toBe(GameState.NOTPLAYING);
        expect(service['currentState']).toBe(notPlayingStateServiceSpy);
    });

    it('should set tiles correctly', () => {
        const tiles: GameTile[] = [
            { player: player1, isAccessible: TilePreview.NONE, idx: 0, tileType: '', item: '', hasPlayer: false },
            { player: player1, isAccessible: TilePreview.NONE, idx: 1, tileType: '', item: '', hasPlayer: false },
        ];
        service.setTiles(tiles);
        expect(service.tiles).toEqual(tiles);
    });

    it('should handle onRightClick correctly', () => {
        service.onRightClick(0);
        expect(notPlayingStateServiceSpy.onRightClick).toHaveBeenCalledWith(service.tiles[0]);
    });

    it('should handle onMouseDown correctly', () => {
        const event = new MouseEvent('mousedown', { button: 0 });
        spyOn(event, 'preventDefault');
        service.onMouseDown(0, event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(notPlayingStateServiceSpy.onMouseDown).toHaveBeenCalledWith(0);

        notPlayingStateServiceSpy.onMouseDown.and.returnValue(GameState.MOVING);
        spyOn(service, 'switchToMovingStateRoutine');
        service.onMouseDown(0, event);
        expect(service.switchToMovingStateRoutine).toHaveBeenCalled();

        notPlayingStateServiceSpy.onMouseDown.and.returnValue(GameState.NOTPLAYING);
        service.currentStateNumber = GameState.MOVING;
        spyOn(service, 'switchToNotPlayingStateRoutine');
        service.onMouseDown(0, event);
        expect(service.switchToNotPlayingStateRoutine).toHaveBeenCalled();
    });

    it('should handle onMouseEnter correctly', () => {
        const event = new MouseEvent('mouseenter');
        spyOn(event, 'preventDefault');
        spyOn(service, 'renderAvailableTiles');
        spyOn(service, 'renderPathToTarget');
        service.onMouseEnter(0, event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(service.renderAvailableTiles).toHaveBeenCalled();
        expect(service.renderPathToTarget).toHaveBeenCalledWith(0);
    });

    it('should switch to not playing state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        service.switchToNotPlayingStateRoutine();
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.NOTPLAYING);
    });

    it('should switch to moving state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        spyOn(service, 'initializePrevisualization');
        service.switchToMovingStateRoutine();
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.MOVING);
        expect(service.initializePrevisualization).toHaveBeenCalled();
    });

    it('should switch to action state routine correctly', () => {
        spyOn(service, 'removeAllPreview');
        spyOn(service, 'initializePrevisualization');
        service.switchToActionStateRoutine(availableTiles);
        expect(service.removeAllPreview).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.ACTION);
        expect(service.initializePrevisualization).toHaveBeenCalledWith(availableTiles);
    });

    it('should reset map correctly', () => {
        spyOn(service, 'resetAllMovementPrevisualization');
        spyOn(service, 'removeAllPreview');
        service.resetMap();
        expect(service.resetAllMovementPrevisualization).toHaveBeenCalled();
        expect(service.removeAllPreview).toHaveBeenCalled();
    });

    it('should render preview correctly', () => {
        service.renderPreview([0, 1], TilePreview.PREVIEW);
        expect(service.tiles[0].isAccessible).toBe(TilePreview.PREVIEW);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.PREVIEW);
    });

    it('should render available tiles correctly', () => {
        service['currentState'] = movingStateServiceSpy;
        movingStateServiceSpy.getAvailableTiles.and.returnValue([0, 1]);
        service.renderAvailableTiles();
        expect(service.tiles[0].isAccessible).toBe(TilePreview.PREVIEW);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.PREVIEW);
    });

    it('should render path to target correctly when shortest path is available', () => {
        service['currentState'] = movingStateServiceSpy;
        movingStateServiceSpy.getShortestPathByIndex.and.returnValue([0, 1]);
        service.renderPathToTarget(1);
        expect(service.tiles[0].isAccessible).toBe(TilePreview.SHORTESTPATH);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.SHORTESTPATH);
    });

    it('should render path to target correctly when index is in available tiles', () => {
        service['currentState'] = movingStateServiceSpy;
        movingStateServiceSpy.getShortestPathByIndex.and.returnValue(null);
        movingStateServiceSpy.availablesTilesIncludes.and.returnValue(true);
        service.renderPathToTarget(1);
        expect(service.tiles[1].isAccessible).toBe(TilePreview.SHORTESTPATH);
    });

    it('should remove all preview correctly', () => {
        service.removeAllPreview();
        service.tiles.forEach((tile) => {
            expect(tile.isAccessible).toBe(TilePreview.NONE);
        });
    });

    it('should reset movement previsualization correctly', () => {
        service.resetMovementPrevisualization();
        expect(notPlayingStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
    });

    it('should place player correctly', () => {
        service.placePlayer(0, player1);
        expect(service.tiles[0].player).toBe(player1);
        expect(service.tiles[0].hasPlayer).toBe(true);
    });

    it('should remove player by id correctly', () => {
        spyOn(service, 'removePlayer');
        service.removePlayerById('1');
        expect(service.removePlayer).toHaveBeenCalledWith(0);
    });

    it('should remove player correctly', () => {
        service.removePlayer(0);
        expect(service.tiles[0].player).toBeUndefined();
        expect(service.tiles[0].hasPlayer).toBe(false);
    });

    it('should change player position correctly', () => {
        spyOn(service, 'removePlayer');
        spyOn(service, 'placePlayer');
        service.changePlayerPosition(0, 1, player1);
        expect(service.removePlayer).toHaveBeenCalledWith(0);
        expect(service.placePlayer).toHaveBeenCalledWith(1, player1);
    });

    it('should remove unused starting points correctly', () => {
        service.tiles[0].item = ItemTypes.STARTINGPOINT;
        service.tiles[0].hasPlayer = false;
        service.removeUnusedStartingPoints();
        expect(service.tiles[0].item).toBe('');
    });

    it('should toggle door correctly', () => {
        service.tiles[0].tileType = TileTypes.DOORCLOSED;
        service.toggleDoor(0);
        expect(service.tiles[0].tileType).toBe(TileTypes.DOOROPEN);

        service.toggleDoor(0);
        expect(service.tiles[0].tileType).toBe(TileTypes.DOORCLOSED);
    });

    it('should reset all movement previsualization correctly', () => {
        notPlayingStateServiceSpy.resetMovementPrevisualization.calls.reset();
        movingStateServiceSpy.resetMovementPrevisualization.calls.reset();
        actionStateServiceSpy.resetMovementPrevisualization.calls.reset();
        combatStateServiceSpy.resetMovementPrevisualization.calls.reset();

        service.resetAllMovementPrevisualization();

        expect(notPlayingStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
        expect(movingStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
        expect(actionStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
        expect(combatStateServiceSpy.resetMovementPrevisualization).toHaveBeenCalled();
    });

    it('should initialize previsualization correctly with ShortestPathByTile', () => {
        const shortestPathByTile: ShortestPathByTile = TEST_SHORTEST_PATH_BY_INDEX;
        service['currentState'] = actionStateServiceSpy;
        spyOn(service, 'renderAvailableTiles');
        service.initializePrevisualization(shortestPathByTile);
        expect(actionStateServiceSpy.initializePrevisualization).toHaveBeenCalledWith(shortestPathByTile);
        expect(service.renderAvailableTiles).toHaveBeenCalled();
    });

    it('should initialize previsualization correctly with number array', () => {
        const accessibleTiles: number[] = [0, 1, 2];
        service['currentState'] = actionStateServiceSpy;
        spyOn(service, 'renderAvailableTiles');
        service.initializePrevisualization(accessibleTiles);
        expect(actionStateServiceSpy.initializePrevisualization).toHaveBeenCalledWith(accessibleTiles);
        expect(service.renderAvailableTiles).toHaveBeenCalled();
    });

    it('should reset player view correctly', () => {
        spyOn(service, 'resetMap');
        service.resetPlayerView();
        expect(service.resetMap).toHaveBeenCalled();
        expect(service.currentStateNumber).toBe(GameState.NOTPLAYING);
    });

    it('should initialize players positions correctly', () => {
        const playerCoords: PlayerCoord[] = [
            { position: 0, player: player1 },
            { position: 1, player: player1 },
        ];
        spyOn(service, 'placePlayer');
        spyOn(service, 'removeUnusedStartingPoints');
        service.initializePlayersPositions(playerCoords);
        expect(service.placePlayer).toHaveBeenCalledWith(0, player1);
        expect(service.placePlayer).toHaveBeenCalledWith(1, player1);
        expect(service.removeUnusedStartingPoints).toHaveBeenCalled();
    });

    it('should replace random items correctly', () => {
        spyOn(service, 'placeItem');
        const itemsPositions = [
            { idx: 0, item: ItemTypes.STARTINGPOINT },
            { idx: 1, item: ItemTypes.EMPTY },
        ];
        service.replaceRandomItems(itemsPositions);
        itemsPositions.forEach((itemPlacement) => {
            expect(service.placeItem).toHaveBeenCalledWith(itemPlacement.idx, itemPlacement.item);
        });
    });

    it('should place item correctly', () => {
        service.placeItem(0, ItemTypes.STARTINGPOINT);
        expect(service.tiles[0].item).toBe(ItemTypes.STARTINGPOINT);

        service.placeItem(1, ItemTypes.EMPTY);
        expect(service.tiles[1].item).toBe(ItemTypes.EMPTY);
    });

    it('should remove item correctly', () => {
        service.tiles[0].item = ItemTypes.STARTINGPOINT;
        service.removeItem(0);
        expect(service.tiles[0].item).toBe('');
    });
});
