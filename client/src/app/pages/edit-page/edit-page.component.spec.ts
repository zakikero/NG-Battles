import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { EditGameService } from '@app/services/edit-game.service';
import { MapEditService } from '@app/services/map-edit.service';
import { EditPageComponent } from './edit-page.component';
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('EditPageComponent', () => {
    let component: EditPageComponent;
    let fixture: ComponentFixture<EditPageComponent>;

    const mapServiceSpy = {
        createGrid: jasmine.createSpy('createGrid'),
    };

    const editGameSpy = {
        getGameDetails: jasmine.createSpy('getGameDetails'),
        setGameDetails: jasmine.createSpy('setGameDetails'),
        initializeEditPage: jasmine.createSpy('initializeEditPage'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
            providers: [
                { provide: MapEditService, useValue: mapServiceSpy },
                { provide: EditGameService, useValue: editGameSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeEditPage on ngOnInit', () => {
        component.ngOnInit();
        expect(editGameSpy.initializeEditPage).toHaveBeenCalled();
    });

    it('should open dialog and set game details on dialog close with result', () => {
        const dialogRefSpy = {
            afterClosed: jasmine.createSpy('afterClosed').and.returnValue({
                subscribe: (callback: any) => callback({ gameNameInput: 'Test Game', gameDescriptionInput: 'Test Description' }),
            }),
        };
        spyOn(component.dialog, 'open').and.returnValue(dialogRefSpy as any);
        component.openDialog();
        expect(component.dialog.open).toHaveBeenCalledWith(EditHeaderDialogComponent, {
            data: editGameSpy.getGameDetails(),
        });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(editGameSpy.setGameDetails).toHaveBeenCalledWith('Test Game', 'Test Description');
    });

    it('should open dialog and not set game details on dialog close without result', () => {
        const dialogRefSpy = {
            afterClosed: jasmine.createSpy('afterClosed').and.returnValue({
                subscribe: (callback: any) => callback(null),
            }),
        };
        spyOn(component.dialog, 'open').and.returnValue(dialogRefSpy as any);
        component.openDialog();
        expect(component.dialog.open).toHaveBeenCalledWith(EditHeaderDialogComponent, {
            data: editGameSpy.getGameDetails(),
        });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
    });
});
