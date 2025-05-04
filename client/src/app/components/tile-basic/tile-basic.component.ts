import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { AVATARS_LIST } from '@app/components/avatar-slider/constant';
import { TilePreview } from '@common/game-structure';
import { TileTypes } from '@common/tile-types';

@Component({
    selector: 'app-tile-basic',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tile-basic.component.html',
    styleUrl: './tile-basic.component.scss',
})
export class TileBasicComponent implements OnChanges {
    @Input() tileType: string = TileTypes.BASIC;
    @Input() isToolbarTile: boolean = false; // Differentiate between toolbar tiles and map tiles
    @Input() itemType: string = '';
    @Input() isAccessible?: TilePreview = TilePreview.NONE; // Only necessary for game map
    @Input() avatar?: string = '';

    transparentImage: string = '';
    imageUrl: string = '';
    avatarUrl: string = '';

    constructor() {
        this.setTileImage();
    }

    ngOnChanges() {
        this.setTileImage();
        this.setItemImage();
        this.choosePreviewClass();
        this.setAvatarImage();
    }
    setItemImage() {
        if (this.itemType) {
            this.transparentImage = `./assets/${this.itemType}_transparent.png`;
        } else {
            this.transparentImage = '';
        }
    }

    setTileImage() {
        if (this.tileType) {
            this.imageUrl = `./assets/${this.tileType}.jpg`;
        } else {
            this.imageUrl = './assets/ground.jpg';
        }
    }

    setAvatarImage() {
        const avatarNumber = this.chooseAvatar(this.avatar);
        if (avatarNumber && parseInt(avatarNumber, 10) > 0 && parseInt(avatarNumber, 10) < AVATARS_LIST.length + 1) {
            this.avatarUrl = `./assets/characters/${avatarNumber}.png`;
        } else {
            this.avatarUrl = '';
        }
    }

    choosePreviewClass() {
        switch (this.isAccessible) {
            case TilePreview.PREVIEW:
                return 'previsualize';
            case TilePreview.SHORTESTPATH:
                return 'shortestPath';
            default:
                return '';
        }
    }

    chooseAvatar(avatar: string | undefined) {
        return avatar ? avatar.split(' ')[1] : '';
    }
}
