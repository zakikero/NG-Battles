import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NavigateDialogComponent } from './navigate-dialog.component';
/* eslint-disable */

describe('NavigateDialogComponent', () => {
    let component: NavigateDialogComponent;
    let fixture: ComponentFixture<NavigateDialogComponent>;
    const dialogData = { someData: 'test data' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, NavigateDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: dialogData }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct dialog data', () => {
        expect(component.data).toEqual(dialogData);
    });
});
