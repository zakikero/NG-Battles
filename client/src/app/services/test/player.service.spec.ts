import { TestBed } from '@angular/core/testing';
import { PlayerAttribute } from '@common/player';
import { PlayerService } from '../player.service';
/* eslint-disable */

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should set attributes correctly', () => {
        const attributes: PlayerAttribute = {
            health: 10,
            speed: 8,
            attack: 7,
            defense: 5,
            dice: '6',
        };
        service.setAttributes(attributes);
        expect(service.getAttributes()).toEqual(attributes);
    });

    it('should get attributes correctly', () => {
        const attributes: PlayerAttribute = {
            health: 10,
            speed: 8,
            attack: 7,
            defense: 5,
            dice: '6',
        };
        service.setAttributes(attributes);
        const retrievedAttributes = service.getAttributes();
        expect(retrievedAttributes).toEqual(attributes);
    });

    it('should set and get character name correctly', () => {
        const name = 'Player1';
        service.setCharacterName(name);
        expect(service.getCharacterName()).toBe(name);
    });

    it('should set and get selected avatar correctly', () => {
        const avatar = 'avatar1.png';
        service.setSelectedAvatar(avatar);
        expect(service.getSelectedAvatar()).toBe(avatar);
    });

    it('should set and get room ID correctly', () => {
        const roomId = 'room123';
        service.setRoomId(roomId);
        expect(service.getRoomId()).toBe(roomId);
    });
});
