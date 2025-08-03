import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { DEFAULT_GAME_TYPE, DEFAULT_MAP_SIZE } from '@app/components/constants';
import { DEFAULT_MAP_SIZE_MEDIUM, DEFAULT_MAP_SIZE_SMALL, DEFAULT_STARTING_COUNTER_TWO } from '@app/services/constants';
import { GameStructure } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';
import { DragDropService } from '../drag-drop.service';
import { EditGameService } from '../edit-game.service';
import { HttpClientService } from '../http-client.service';
import { IDGenerationService } from '../idgeneration.service';
import { MapEditService } from '../map-edit.service';
/* eslint-disable */

describe('EditGameService', () => {
    let service: EditGameService;
    let mockGameJson: GameStructure;

    const mockIdGenerationService = {
        generateID: jasmine.createSpy('generateID').and.returnValue('456'),
    };
    const mockHttpClientService = jasmine.createSpyObj('HttpClientService', ['getGame', 'gameExists', 'sendGame', 'updateGame']);
    const mockMatDialog = {
        open: jasmine.createSpy('open'),
    };

    const dragDropServiceSpy = jasmine.createSpyObj('DragDropService', ['setMultipleItemCounter']);
    const mapEditServiceSpy = jasmine.createSpyObj('MapEditService', ['setTiles']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: IDGenerationService, useValue: mockIdGenerationService },
                { provide: MapEditService, useValue: mapEditServiceSpy },
                { provide: DragDropService, useValue: dragDropServiceSpy },
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
        });
        service = TestBed.inject(EditGameService);

        mockGameJson = {
            id: '123',
            gameName: 'Test Game',
            gameDescription: 'Test Description',
            mapSize: '10',
            map: [
                {
                    idx: 1,
                    tileType: 'water',
                    hasPlayer: false,
                    item: '',
                },
                {
                    idx: 2,
                    tileType: 'grass',
                    hasPlayer: false,
                    item: '',
                },
                {
                    idx: 3,
                    tileType: 'water',
                    hasPlayer: false,
                    item: '',
                },
            ],
            gameType: '',
            isVisible: true,
            creationDate: '',
            lastModified: '',
        };
        service.game = mockGameJson;
        // mockHttpClientService.getGame.and.returnValue(mockGameJson);
        // mockHttpClientService.gameExists.and.returnValue(Promise.resolve());
        // mockHttpClientService.sendGame.and.returnValue({
        //     subscribe: ({ next }: { next: () => void }) => {
        //         next();
        //     },
        // });
        // mockHttpClientService.updateGame.and.returnValue({
        //     subscribe: ({ next }: { next: () => void }) => {
        //         next();
        //     },
        // });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct query parameter value', () => {
        const param = 'gameId';
        const value = '123';
        service['route'] = {
            snapshot: {
                queryParams: {
                    [param]: value,
                },
            },
        } as never;

        const result = service.getQueryParam(param);

        expect(result).toBe(value);
    });

    it('should create a new game JSON with default values', () => {
        const newGame = service.createGameJSON();

        expect(newGame.id).toBe('456');
        expect(newGame.gameName).toBe('No title');
        expect(newGame.gameDescription).toBe('One day...');
        expect(newGame.mapSize).toBe('10');
        expect(newGame.map).toEqual([]);
        expect(newGame.gameType).toBe('');
        expect(newGame.isVisible).toBe(true);
        expect(newGame.creationDate).toBe('');
        expect(newGame.lastModified).toBe('');
    });

    it('should set the game correctly when game exists', async () => {
        mockHttpClientService.getGame.and.returnValue(Promise.resolve(mockGameJson));

        await service.setGame('123');

        expect(service.game).toEqual(mockGameJson);
        expect(mockHttpClientService.getGame).toHaveBeenCalledWith('123');
    });

    it('should create a new game JSON when game does not exist', async () => {
        mockHttpClientService.getGame.and.returnValue(Promise.resolve(null));

        await service.setGame('123');

        expect(service.game.id).toBe('456');
        expect(service.game.gameName).toBe('No title');
        expect(service.game.gameDescription).toBe('One day...');
        expect(service.game.mapSize).toBe('10');
        expect(service.game.map).toEqual([]);
        expect(service.game.gameType).toBe('');
        expect(service.game.isVisible).toBe(true);
        expect(service.game.creationDate).toBe('');
        expect(service.game.lastModified).toBe('');
        expect(mockHttpClientService.getGame).toHaveBeenCalledWith('123');
    });

    it('should return "classic" when gameType is "classic"', () => {
        const result = service.selectGameType('classic');
        expect(result).toBe('classic');
    });

    it('should return the default game type when gameType is not "classic"', () => {
        const result = service.selectGameType('non-classic');
        expect(result).toBe(DEFAULT_GAME_TYPE);
    });

    it('should return "15" when mapSize is "medium"', () => {
        const result = service.selectMapSize('medium');
        expect(result).toBe('15');
    });

    it('should return "20" when mapSize is "large"', () => {
        const result = service.selectMapSize('large');
        expect(result).toBe('20');
    });

    it('should return the default map size when mapSize is not "medium" or "large"', () => {
        const result = service.selectMapSize('small');
        expect(result).toBe(DEFAULT_MAP_SIZE.toString());
    });
    it('should create a grid with the default map size when no map size is provided', () => {
        const grid = service.createGrid();
        expect(grid.length).toBe(DEFAULT_MAP_SIZE * DEFAULT_MAP_SIZE);
        grid.forEach((tile, index) => {
            expect(tile.idx).toBe(index);
            expect(tile.tileType).toBe(TileTypes.BASIC);
            expect(tile.item).toBe('');
            expect(tile.hasPlayer).toBe(false);
        });
    });

    it('should create a grid with the specified map size', () => {
        const mapSize = 5;
        const grid = service.createGrid(mapSize);
        expect(grid.length).toBe(mapSize * mapSize);
        grid.forEach((tile, index) => {
            expect(tile.idx).toBe(index);
            expect(tile.tileType).toBe(TileTypes.BASIC);
            expect(tile.item).toBe('');
            expect(tile.hasPlayer).toBe(false);
        });
    });

    it('should throw an error when the map size is zero or negative', () => {
        expect(() => service.createGrid(0)).toThrowError('MapSize must be a positive number.');
        expect(() => service.createGrid(-1)).toThrowError('MapSize must be a positive number.');
    });
    it('should return the correct game details', () => {
        const gameDetails = service.getGameDetails();

        expect(gameDetails.gameNameInput).toBe(mockGameJson.gameName);
        expect(gameDetails.gameDescriptionInput).toBe(mockGameJson.gameDescription);
    });
    it('should set the game details correctly', () => {
        const newGameName = 'New Game Name';
        const newGameDescription = 'New Game Description';

        service.setGameDetails(newGameName, newGameDescription);

        expect(service.game.gameName).toBe(newGameName);
        expect(service.game.gameDescription).toBe(newGameDescription);
    });
    it('should configure the game correctly when the map is empty', () => {
        service.game.map = [];
        spyOn(service, 'getQueryParam').and.returnValues('classic', 'medium');
        spyOn(service, 'createGrid').and.returnValue([
            { idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
            { idx: 1, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
        ]);
        service.configureGame();

        expect(service.game.gameType).toBe('classic');
        expect(service.game.mapSize).toBe('15');
        expect(service.createGrid).toHaveBeenCalledWith(DEFAULT_MAP_SIZE_MEDIUM);
        expect(service.game.map.length).toBe(DEFAULT_STARTING_COUNTER_TWO);
        expect(service.mapSize).toBe(DEFAULT_MAP_SIZE_MEDIUM);
        expect(mapEditServiceSpy.setTiles).toHaveBeenCalledWith(service.game.map);
        expect(service.gameCreated).toBe(true);
    });

    it('should configure the game correctly when the map is not empty', () => {
        service.game.map = [
            { idx: 0, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
            { idx: 1, tileType: TileTypes.BASIC, item: '', hasPlayer: false },
        ];

        service.configureGame();

        expect(service.game.gameType).toBe('');
        expect(service.game.mapSize).toBe('10');
        expect(service.game.map.length).toBe(DEFAULT_STARTING_COUNTER_TWO);
        expect(service.mapSize).toBe(DEFAULT_MAP_SIZE_SMALL);
        expect(mapEditServiceSpy.setTiles).toHaveBeenCalledWith(service.game.map);
        expect(service.gameCreated).toBe(true);
    });

    it('should call setGame and configureGame on initializeEditPage', async () => {
        spyOn(service, 'setGame').and.returnValue(Promise.resolve());
        spyOn(service, 'configureGame');
        spyOn(service, 'getQueryParam').and.returnValue('123');

        await service.initializeEditPage();

        expect(service.setGame).toHaveBeenCalledWith('123');
        expect(service.configureGame).toHaveBeenCalled();
        expect(dragDropServiceSpy.setMultipleItemCounter).toHaveBeenCalledWith(parseInt(mockGameJson.mapSize, 10), mockGameJson.map);
    });
    it('should reset the game correctly', async () => {
        spyOn(service, 'setGame').and.returnValue(Promise.resolve());
        spyOn(service, 'configureGame');

        await service.resetGame();

        expect(service.gameCreated).toBe(false);
        expect(service.setGame).toHaveBeenCalledWith(service.game.id);
        expect(service.configureGame).toHaveBeenCalled();
        expect(dragDropServiceSpy.setMultipleItemCounter).toHaveBeenCalledWith(parseInt(service.game.mapSize, 10), service.game.map);
    });

    it('should handle error correctly when errors array is present', () => {
        const errorResponse = {
            error: {
                errors: ['Error 1', 'Error 2'],
            },
        } as HttpErrorResponse;

        spyOn(service['snackbar'], 'open');

        service['handleError'](errorResponse);

        expect(service['snackbar'].open).toHaveBeenCalledWith('Error 1, Error 2', 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    });

    it('should handle error correctly when message property is present', () => {
        const errorResponse = {
            error: {
                message: 'An error occurred',
            },
        } as HttpErrorResponse;

        spyOn(service['snackbar'], 'open');

        service['handleError'](errorResponse);

        expect(service['snackbar'].open).toHaveBeenCalledWith('An error occurred', 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    });

    it('should handle error correctly when neither errors array nor message property is present', () => {
        const errorResponse = {
            error: {},
        } as HttpErrorResponse;

        spyOn(service['snackbar'], 'open');

        service['handleError'](errorResponse);

        expect(service['snackbar'].open).toHaveBeenCalledWith('An unexpected error occurred', 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    });
    it('should update the game if it already exists', async () => {
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(true));
        mockHttpClientService.updateGame.and.returnValue({
            subscribe: ({ next }: { next: () => void }) => {
                next();
            },
        });
        spyOn(service['router'], 'navigate');

        await service.saveGame();

        expect(mockHttpClientService.gameExists).toHaveBeenCalledWith(service.game.id);
        expect(mockHttpClientService.updateGame).toHaveBeenCalledWith(service.game);
        expect(service['router'].navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle error correctly when updating the game fails', async () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: 'Update failed' },
        });
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(true));
        mockHttpClientService.updateGame.and.returnValue({
            subscribe: ({ error }: { next: () => void; error: (err: HttpErrorResponse) => void }) => {
                error(errorResponse);
            },
        });
        spyOn(service['router'], 'navigate');
        spyOn(service['snackbar'], 'open');

        await service.saveGame();

        expect(mockHttpClientService.gameExists).toHaveBeenCalledWith(service.game.id);
        expect(mockHttpClientService.updateGame).toHaveBeenCalledWith(service.game);
        expect(service['router'].navigate).not.toHaveBeenCalled();
        expect(service['snackbar'].open).toHaveBeenCalledWith('Update failed', 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    });

    it('should send the game if it does not exist', async () => {
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(false));
        mockHttpClientService.sendGame.and.returnValue({
            subscribe: ({ next }: { next: () => void }) => {
                next();
            },
        });
        spyOn(service['router'], 'navigate');

        await service.saveGame();

        expect(mockHttpClientService.gameExists).toHaveBeenCalledWith(service.game.id);
        expect(mockHttpClientService.sendGame).toHaveBeenCalledWith(service.game);
        expect(service['router'].navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle error correctly when sending the game fails', async () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: 'Send failed' },
        });
        mockHttpClientService.gameExists.and.returnValue(Promise.resolve(false));
        mockHttpClientService.sendGame.and.returnValue({
            subscribe: ({ error }: { next: () => void; error: (err: HttpErrorResponse) => void }) => {
                error(errorResponse);
            },
        });
        spyOn(service['router'], 'navigate');
        spyOn(service['snackbar'], 'open');

        await service.saveGame();

        expect(mockHttpClientService.gameExists).toHaveBeenCalledWith(service.game.id);
        expect(mockHttpClientService.sendGame).toHaveBeenCalledWith(service.game);
        expect(service['router'].navigate).not.toHaveBeenCalled();
        expect(service['snackbar'].open).toHaveBeenCalledWith('Send failed', 'Fermer', {
            duration: undefined,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    });
});
