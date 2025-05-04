import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { ConfirmDeletionDialogComponent } from '@app/components/confirm-deletion-dialog/confirm-deletion-dialog.component';
import { HttpClientService } from '@app/services/http-client.service';
import { GameStructure } from '@common/game-structure';
import { of } from 'rxjs';
import { AdminItemComponent } from './admin-item.component';
/* eslint-disable */

/*eslint-disable */

describe('AdminItemComponent', () => {
    let component: AdminItemComponent;
    let fixture: ComponentFixture<AdminItemComponent>;
    let httpClientService: jasmine.SpyObj<HttpClientService>;
    let dialog: jasmine.SpyObj<MatDialog>;
    let snackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const httpClientSpy = jasmine.createSpyObj('HttpClientService', ['changeVisibility', 'getGame', 'deleteGame']);
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const snackbarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [AdminItemComponent, MatDialogModule, MatSnackBarModule],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: HttpClientService, useValue: httpClientSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MatSnackBar, useValue: snackbarSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminItemComponent);
        component = fixture.componentInstance;
        httpClientService = TestBed.inject(HttpClientService) as jasmine.SpyObj<HttpClientService>;
        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        snackbar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

        component.game = {
            id: '1',
            gameName: 'Game 2',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: 'startingPoint', hasPlayer: false },
                { idx: 2, tileType: '', item: '', hasPlayer: true },
                { idx: 3, tileType: '', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        };

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle visibility', () => {
        httpClientService.changeVisibility.and.returnValue(of({}));
        component.invertVisibility();
        expect(httpClientService.changeVisibility).toHaveBeenCalledWith('1');
        expect(component.game.isVisible).toBeFalse();
    });

    it('should delete game and show snackbar when game does not exist', async () => {
        const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
        dialog.open.and.returnValue(dialogRefSpy);
        httpClientService.getGame.and.returnValue(Promise.resolve(null as unknown as GameStructure));
        httpClientService.deleteGame.and.returnValue(of({}));

        component.deleteGame();

        expect(dialog.open).toHaveBeenCalledWith(ConfirmDeletionDialogComponent);
        await fixture.whenStable();
        expect(httpClientService.getGame).toHaveBeenCalledWith('1');
        expect(snackbar.open).toHaveBeenCalledWith("Le jeu n'existe pas", 'Fermer', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    });

    it('should delete game and show snackbar when game exists', async () => {
        const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
        dialog.open.and.returnValue(dialogRefSpy);
        httpClientService.getGame.and.returnValue(Promise.resolve(component.game));
        httpClientService.deleteGame.and.returnValue(of({}));

        component.deleteGame();

        expect(dialog.open).toHaveBeenCalledWith(ConfirmDeletionDialogComponent);
        await fixture.whenStable();
        expect(httpClientService.getGame).toHaveBeenCalledWith('1');
        expect(httpClientService.deleteGame).toHaveBeenCalledWith('1');
        expect(snackbar.open).toHaveBeenCalledWith('Le jeu a été supprimé', 'Fermer', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
        });
    });

    it('should emit editGameEvent when editGame is called', () => {
        spyOn(component.editGameEvent, 'emit');
        component.editGame();
        expect(component.editGameEvent.emit).toHaveBeenCalledWith('1');
    });

    it('should export game data as JSON file', () => {
        component.game = {
            gameName: 'TestGame',
            isVisible: true,
        } as any;

        const mockAnchor = {
            setAttribute: jasmine.createSpy('setAttribute'),
            click: jasmine.createSpy('click'),
            remove: jasmine.createSpy('remove'),
        };

        spyOn(document, 'createElement').and.returnValue(mockAnchor as any);
        spyOn(document.body, 'appendChild');

        component.exportGame();

        const expectedDataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ gameName: 'TestGame' }));

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(mockAnchor.setAttribute).toHaveBeenCalledWith('href', expectedDataStr);
        expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', 'TestGame.json');
        expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor as any);
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.remove).toHaveBeenCalled();
    });
});
