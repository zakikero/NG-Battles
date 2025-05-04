import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTypes } from '@common/tile-types';
import { InventoryComponent } from './inventory.component';
/* eslint-disable */

describe('InventoryComponent', () => {
    let component: InventoryComponent;
    let fixture: ComponentFixture<InventoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InventoryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InventoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct image path for a valid item type', () => {
        const itemType = 'sword';
        const expectedPath = './assets/sword_transparent.png';
        expect(component.findItemImage(itemType)).toBe(expectedPath);
    });

    it('should return undefined for an empty item type', () => {
        const itemType = ItemTypes.EMPTY;
        expect(component.findItemImage(itemType)).toBeUndefined();
    });
});
