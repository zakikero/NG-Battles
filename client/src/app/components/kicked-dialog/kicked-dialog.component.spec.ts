import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { KickedDialogComponent } from './kicked-dialog.component';
const dialogData = { someData: 'test data' };
/* eslint-disable */

describe('KickedDialogComponent', () => {
    let component: KickedDialogComponent;
    let fixture: ComponentFixture<KickedDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KickedDialogComponent, MatDialogModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: dialogData }],
        }).compileComponents();

        fixture = TestBed.createComponent(KickedDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
