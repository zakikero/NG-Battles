import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemTypes } from '@common/tile-types';
import { ChooseItemModalComponent } from './choose-item-modal.component';
/* eslint-disable */


describe('ChooseItemModalComponent', () => {
    let component: ChooseItemModalComponent;
    let fixture: ComponentFixture<ChooseItemModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ChooseItemModalComponent>>;
    const dialogData = { itemTypes: [ItemTypes.AA1, ItemTypes.AA2] };

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [ChooseItemModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChooseItemModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with provided data', () => {
        expect(component.data).toEqual(dialogData);
    });

    it('should select an item', () => {
        component.selectItem(ItemTypes.AA1);
        expect(component.selectedItem).toBe(ItemTypes.AA1);
    });

    it('should close the dialog with selected item on confirm', () => {
        component.selectedItem = ItemTypes.AA2;
        component.onConfirm();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(ItemTypes.AA2);
    });

    it('should close the dialog with undefined if no item is selected on confirm', () => {
        component.selectedItem = undefined;
        component.onConfirm();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(undefined);
    });
});
// });
