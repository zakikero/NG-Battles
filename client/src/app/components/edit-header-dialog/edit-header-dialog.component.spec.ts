import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_CHAR_COUNT } from '@app/components/edit-header-dialog/constant';
import { DialogData, EditHeaderDialogComponent } from './edit-header-dialog.component';
/* eslint-disable */

describe('EditHeaderDialogComponent', () => {
    let component: EditHeaderDialogComponent;
    let fixture: ComponentFixture<EditHeaderDialogComponent>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<EditHeaderDialogComponent>>;

    const dialogData: DialogData = {
        gameNameInput: 'Test Game',
        gameDescriptionInput: 'Test description',
    };

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [EditHeaderDialogComponent, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditHeaderDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with the correct character count', () => {
        const expectedCharCount = dialogData.gameDescriptionInput.length;
        expect(component.charCount).toBe(expectedCharCount);
    });

    it('should call close() without data when onNoClick() is called', () => {
        component.onNoClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should call close() with data when onYesClick() is called', () => {
        component.onYesClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith(dialogData);
    });

    it('should update the character count correctly when updateCharCount() is called', () => {
        const newData = { gameNameInput: 'New Game', gameDescriptionInput: 'New Description' };
        component.data = newData;

        component.updateCharCount();

        expect(component.charCount).toBe(newData.gameDescriptionInput.length);
    });

    it('should return default char count if gameDescriptionInput is empty', () => {
        component.data.gameDescriptionInput = '';
        const charCount = component.updateCharCount();
        expect(charCount).toBe(DEFAULT_CHAR_COUNT);
    });
});
