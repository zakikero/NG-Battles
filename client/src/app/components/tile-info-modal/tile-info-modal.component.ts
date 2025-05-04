import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameTile } from '@common/game-structure';
import { ItemTypes, TileTypes } from '@common/tile-types';

@Component({
    selector: 'app-tile-info-modal',
    templateUrl: './tile-info-modal.component.html',
    styleUrl: './tile-info-modal.component.scss',
})
export class TileInfoModalComponent {
    tileType: string;
    objectName: string;
    objectDescription: string;
    avatarName: string;
    tileCost: string;
    tileEffect: string;
    objectEffect: string;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { tile: GameTile }) {
        this.tileType = this.chooseTileType(this.data.tile.tileType);
        this.objectName = this.chooseObjectName(this.data.tile.item);
        this.objectEffect = this.chooseObjectDescription(this.data.tile.item);
        this.tileEffect = this.chooseTileEffect(this.data.tile.tileType);
    }

    chooseAvatar(avatar: string | undefined) {
        return avatar ? avatar.split(' ')[1] : '';
    }

    chooseTileType(tileType: string) {
        switch (tileType) {
            case TileTypes.WALL:
                return 'Mur';
            case TileTypes.DOOR:
                return 'Porte';
            case TileTypes.DOOROPEN:
                return 'Porte ouverte';
            case TileTypes.DOORCLOSED:
                return 'Porte fermée';
            case TileTypes.WATER:
                return 'Eau';
            case TileTypes.ICE:
                return 'Glace';
            default:
                return 'Terrain';
        }
    }
    chooseObjectName(item: string) {
        switch (item) {
            case ItemTypes.AA1:
                return 'Bouclier !';
            case ItemTypes.AA2:
                return 'Collier';
            case ItemTypes.AC1:
                return 'Petit anneau de puissance';
            case ItemTypes.AC2:
                return 'Parchemin';
            case ItemTypes.AF1:
                return 'Potion magique !';
            case ItemTypes.AF2:
                return 'Arme de jet 2';
            case ItemTypes.RANDOMITEM:
                return 'Capsule de chance !';
            case ItemTypes.STARTINGPOINT:
                return 'Point de départ';
            case ItemTypes.FLAG_A:
                return 'Drapeau';
            default:
                return 'Aucun objet';
        }
    }
    chooseObjectDescription(item: string): string {
        switch (item) {
            case ItemTypes.AA1:
                return 'Bouclier (+2 defense)';
            case ItemTypes.AA2:
                return 'Collier (+2 speed, -1 health)';
            case ItemTypes.AC1:
                return 'Anneau (+2 attack si <= 2 HP)';
            case ItemTypes.AC2:
                return 'Parchemin ( +2 shield si <= 3 HP)';
            case ItemTypes.AF1:
                return "Potion (annule l'effet de la glace tant qu'il est équipé)";
            case ItemTypes.AF2:
                return 'Capsule (50/50 de chance de drop 1 ou 4 pour le dé D4 et 1 ou 6 pour le dé D6)';
            case ItemTypes.RANDOMITEM:
                return 'Aucun effet, seulement in objet aléatoire parmis les six proposés';
            case ItemTypes.STARTINGPOINT:
                return 'Aucun effet, point de départ de debut de la partie ';
            case ItemTypes.FLAG_A:
                return 'Aucun effet, il faut le capturer pour gagner la partie !';
            default:
                return 'Aucun objet';
        }
    }
    chooseTileEffect(item: string) {
        switch (item) {
            case TileTypes.ICE:
                return 'Ne retire aucun point de mouvement ! ';
            case TileTypes.BASIC:
                return 'Retire 1 point de mouvement ! ';
            case TileTypes.DOOROPEN:
                return 'Retire 1 point de mouvement !';
            case TileTypes.WATER:
                return 'Retire 2 point de mouvement !';
            default:
                return 'Aucun objet';
        }
    }
}
