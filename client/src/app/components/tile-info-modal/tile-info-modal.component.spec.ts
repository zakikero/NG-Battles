import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { TileInfoModalComponent } from './tile-info-modal.component';
/* eslint-disable */

describe('TileInfoModalComponent', () => {
    let component: TileInfoModalComponent;
    let fixture: ComponentFixture<TileInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileInfoModalComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { tile: { tileType: TileTypes.WALL, item: ItemTypes.AA1 } } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set tileType correctly', () => {
        expect(component.tileType).toBe('Mur');
    });

    it('should set objectName correctly', () => {
        expect(component.objectName).toBe('Bouclier !');
    });

    it('should return correct tile type', () => {
        expect(component.chooseTileType(TileTypes.DOOR)).toBe('Porte');
        expect(component.chooseTileType(TileTypes.WATER)).toBe('Eau');
        expect(component.chooseTileType(TileTypes.ICE)).toBe('Glace');
        expect(component.chooseTileType(TileTypes.DOOROPEN)).toBe('Porte ouverte');
        expect(component.chooseTileType(TileTypes.DOORCLOSED)).toBe('Porte fermée');
        expect(component.chooseTileType(TileTypes.WALL)).toBe('Mur');
        expect(component.chooseTileType(TileTypes.BASIC)).toBe('Terrain');
        expect(component.chooseTileType('Unknown')).toBe('Terrain');
    });

    it('should return correct object name', () => {
        expect(component.chooseObjectName(ItemTypes.AA1)).toBe('Bouclier !');
        expect(component.chooseObjectName(ItemTypes.AA2)).toBe('Collier');
        expect(component.chooseObjectName(ItemTypes.AC1)).toBe('Petit anneau de puissance');
        expect(component.chooseObjectName(ItemTypes.AC2)).toBe('Parchemin');
        expect(component.chooseObjectName(ItemTypes.AF1)).toBe('Potion magique !');
        expect(component.chooseObjectName(ItemTypes.AF2)).toBe('Arme de jet 2');
        expect(component.chooseObjectName(ItemTypes.RANDOMITEM)).toBe('Capsule de chance !');
        expect(component.chooseObjectName(ItemTypes.STARTINGPOINT)).toBe('Point de départ');
        expect(component.chooseObjectName(ItemTypes.FLAG_A)).toBe('Drapeau');
        expect(component.chooseObjectName('Unknown')).toBe('Aucun objet');
    });

    it('should return correct object description', () => {
        expect(component.chooseObjectDescription(ItemTypes.AA1)).toBe('Bouclier (+2 defense)');
        expect(component.chooseObjectDescription(ItemTypes.AA2)).toBe('Collier (+2 speed, -1 health)');
        expect(component.chooseObjectDescription(ItemTypes.AC1)).toBe('Anneau (+2 attack si <= 2 HP)');
        expect(component.chooseObjectDescription(ItemTypes.AC2)).toBe('Parchemin ( +2 shield si <= 3 HP)');
        expect(component.chooseObjectDescription(ItemTypes.AF1)).toBe("Potion (annule l'effet de la glace tant qu'il est équipé)");
        expect(component.chooseObjectDescription(ItemTypes.AF2)).toBe(
            'Capsule (50/50 de chance de drop 1 ou 4 pour le dé D4 et 1 ou 6 pour le dé D6)',
        );
        expect(component.chooseObjectDescription(ItemTypes.RANDOMITEM)).toBe('Aucun effet, seulement in objet aléatoire parmis les six proposés');
        expect(component.chooseObjectDescription(ItemTypes.STARTINGPOINT)).toBe('Aucun effet, point de départ de debut de la partie ');
        expect(component.chooseObjectDescription(ItemTypes.FLAG_A)).toBe('Aucun effet, il faut le capturer pour gagner la partie !');
        expect(component.chooseObjectDescription('Unknown')).toBe('Aucun objet');
    });

    it('should return correct tile effect', () => {
        expect(component.chooseTileEffect(TileTypes.ICE)).toBe('Ne retire aucun point de mouvement ! ');
        expect(component.chooseTileEffect(TileTypes.BASIC)).toBe('Retire 1 point de mouvement ! ');
        expect(component.chooseTileEffect(TileTypes.DOOROPEN)).toBe('Retire 1 point de mouvement !');
        expect(component.chooseTileEffect(TileTypes.WATER)).toBe('Retire 2 point de mouvement !');
        expect(component.chooseTileEffect('Unknown')).toBe('Aucun objet');
    });

    it('should return correct avatar name', () => {
        expect(component.chooseAvatar('Avatar Name')).toBe('Name');
        expect(component.chooseAvatar('Another Avatar')).toBe('Avatar');
        expect(component.chooseAvatar(undefined)).toBe('');
        expect(component.chooseAvatar('')).toBe('');
    });
});
