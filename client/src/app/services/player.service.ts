import { Injectable } from '@angular/core';
import { PlayerAttribute } from '@common/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private attributes: PlayerAttribute;
    private characterName: string = '';
    private selectedAvatar: string = '';
    private roomId: string;

    setAttributes(attributes: PlayerAttribute) {
        this.attributes = attributes;
    }

    getAttributes(): PlayerAttribute {
        return this.attributes;
    }

    setCharacterName(name: string) {
        this.characterName = name;
    }

    getCharacterName(): string {
        return this.characterName;
    }

    setSelectedAvatar(avatar: string) {
        this.selectedAvatar = avatar;
    }

    getSelectedAvatar(): string {
        return this.selectedAvatar;
    }

    setRoomId(id: string) {
        this.roomId = id;
    }

    getRoomId(): string {
        return this.roomId;
    }
}
