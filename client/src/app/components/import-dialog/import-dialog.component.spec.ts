import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientService } from '@app/services/http-client.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { GameStructure } from '@common/game-structure';
import { ImportDialogComponent } from './import-dialog.component';

/* eslint-disable */

describe('ImportDialogComponent', () => {
    let component: ImportDialogComponent;
    let fixture: ComponentFixture<ImportDialogComponent>;

    const mockHttpClientService = jasmine.createSpyObj('HttpClientService', ['getGame', 'gameExists', 'sendGame', 'updateGame']);
    const mockIdGenerationService = {
        generateID: jasmine.createSpy('generateID').and.returnValue('456'),
    };
    const mockReader = jasmine.createSpyObj('FileReader', ['readAsText', 'onload']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ImportDialogComponent],
            providers: [
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: IDGenerationService, useValue: mockIdGenerationService },
                { provide: FileReader, useValue: mockReader },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load imported game', () => {
        const importedData = {
            id: '456',
            gameName: 'test',
            gameDescription: 'test',
            mapSize: '10',
            map: [],
            gameType: 'test',
            creationDate: 'test',
            isVisible: false,
            lastModified: 'test',
        } as Partial<GameStructure> as any;
        spyOn(component, 'saveGame');
        component.loadImportedGame(importedData);
        expect(component.saveGame).toHaveBeenCalledWith(importedData);
    });

    it('should close dialog on successful save', () => {
        const game = {
            id: '456',
            gameName: 'test',
            gameDescription: 'test',
            mapSize: '10',
            map: [],
            gameType: 'test',
            creationDate: 'test',
            isVisible: false,
            lastModified: 'test',
        } as GameStructure;

        mockHttpClientService.sendGame.and.returnValue({
            subscribe: ({ next }: { next: () => void }) => {
                next();
            },
        });

        spyOn(component.dialog, 'closeAll');
        spyOn(component.gameSaved, 'emit');
        component.saveGame(game);
        expect(component.dialog.closeAll).toHaveBeenCalled();
        expect(component.gameSaved.emit).toHaveBeenCalled();
    });

    it('should display error message on failed save', () => {
        const game = {
            id: '456',
            gameName: 'test',
            gameDescription: 'test',
            mapSize: '10',
            map: [],
            gameType: 'test',
            creationDate: 'test',
            isVisible: false,
            lastModified: 'test',
        } as GameStructure;

        mockHttpClientService.sendGame.and.returnValue({
            subscribe: ({ error }: { error: (error: any) => void }) => {
                error({ error: { errors: ['nom'] } });
            },
        });

        spyOn(component.dialog, 'closeAll');
        component.saveGame(game);
        expect(component.isNameError).toBe(true);
        expect(component.game).toBe(game);
        expect(component.dialog.closeAll).not.toHaveBeenCalled();
        const errorElement = document.getElementById('errors');
        expect(errorElement?.textContent).toBe('nom');
    });

    it('should import game', () => {
        const event = { target: { files: [{ name: 'test' }] } } as any;
        component.importGame(event);
        expect(component.fileName).toBe('test');
        expect(component.input).toBe(event.target);
    });

    it('should save game on submit if there is a name error', async () => {
        component.isNameError = true;
        component.game = {
            id: '456',
            gameName: 'oldName',
            gameDescription: 'test',
            mapSize: '10',
            map: [],
            gameType: 'test',
            creationDate: 'test',
            isVisible: false,
            lastModified: 'test',
        } as GameStructure;
        component.gameName = 'newName';

        spyOn(component, 'saveGame').and.callFake(async () => {});
        const errorElement = document.createElement('p');
        errorElement.id = 'errors';
        document.body.appendChild(errorElement);

        await component.onSubmit();

        expect(component.isNameError).toBe(false);
        expect(component.game.gameName).toBe('newName');
        expect(component.saveGame).toHaveBeenCalledWith(component.game);
        expect(errorElement.textContent).toBe('');
    });

    it('should not save game on submit if there is no name error', async () => {
        component.isNameError = false;

        spyOn(component, 'saveGame').and.callFake(async () => {});

        await component.onSubmit();

        expect(component.saveGame).not.toHaveBeenCalled();
    });
});
