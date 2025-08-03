import { TestBed } from '@angular/core/testing';
import { GameTile, TilePreview, TileStructure } from '@common/game-structure';
import { Player } from '@common/player';
import { MOCK_PLAYER } from '../constants';
import { MapBaseService } from '../map-base.service';
/* eslint-disable */

describe('MapBaseService', () => {
    let service: MapBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should identify GameTile correctly', () => {
        const gameTile: GameTile = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
            isAccessible: TilePreview.NONE,
            player: MOCK_PLAYER,
        };
        const tileJson: TileStructure = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
        };

        expect(service.isGameTile(gameTile)).toBeTrue();
        expect(service.isGameTile(tileJson)).toBeFalse();
    });

    it('should identify PlayerTile correctly', () => {
        const playerTile: GameTile & { player: { avatar: string } } = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: true,
            isAccessible: TilePreview.NONE,
            player: { avatar: '1' } as Player,
        };
        const nonPlayerTile: GameTile = {
            idx: 0,
            tileType: '',
            item: '',
            hasPlayer: false,
            isAccessible: TilePreview.NONE,
        } as GameTile;

        expect(service.isPlayerTile(playerTile)).toBeTrue();
        expect(service.isPlayerTile(nonPlayerTile)).toBeFalse();
    });

    it('should do nothing on onRightClick', () => {
        expect(() => service.onRightClick(0)).not.toThrow();
    });

    it('should do nothing on onMouseDown', () => {
        const event = new MouseEvent('mousedown');
        expect(() => service.onMouseDown(0, event)).not.toThrow();
    });

    it('should do nothing on onMouseUp', () => {
        const event = new MouseEvent('mouseup');
        expect(() => service.onMouseUp(0, event)).not.toThrow();
    });

    it('should do nothing on onDrop', () => {
        expect(() => service.onDrop(0)).not.toThrow();
    });

    it('should do nothing on onMouseEnter', () => {
        const event = new MouseEvent('mouseenter');
        expect(() => service.onMouseEnter(0, event)).not.toThrow();
    });

    it('should do nothing on onExit', () => {
        expect(() => service.onExit()).not.toThrow();
    });
});
