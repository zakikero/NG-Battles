import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-item/admin-item.component';
import { ImportDialogComponent } from '@app/components/import-dialog/import-dialog.component';
import { HttpClientService } from '@app/services/http-client.service';
import { GameStructure } from '@common/game-structure';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let httpClientService: jasmine.SpyObj<HttpClientService>;

    const mockGames: GameStructure[] = [
        {
            id: '1',
            gameName: 'Game 1',
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
        },
        {
            id: '2',
            gameName: 'Game 2',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: '', hasPlayer: false },
                { idx: 2, tileType: 'ice', item: '', hasPlayer: true },
                { idx: 3, tileType: '', item: 'startingPoint', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        },
        {
            id: '3',
            gameName: 'Game 3',
            gameDescription: 'This is an example game description.',
            mapSize: '2',
            map: [
                { idx: 0, tileType: '', item: 'startingPoint', hasPlayer: false },
                { idx: 1, tileType: 'water', item: '', hasPlayer: false },
                { idx: 2, tileType: 'ice', item: 'startingPoint', hasPlayer: true },
                { idx: 3, tileType: '', item: '', hasPlayer: false },
            ],
            gameType: 'ctf',
            isVisible: true,
            creationDate: '2024-09-18T10:30:00.000Z',
            lastModified: '2024-09-18T10:30:00.000Z',
        },
    ];

    beforeEach(async () => {
        const httpClientServiceSpy = jasmine.createSpyObj('HttpClientService', ['getAllGames']);
        const activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => 'test-id',
                },
            },
        };

        await TestBed.configureTestingModule({
            imports: [AdminPageComponent, MatButtonModule, MatCardModule, MatGridListModule, RouterLink, RouterOutlet, AdminItemComponent],
            providers: [
                { provide: HttpClientService, useValue: httpClientServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        httpClientService = TestBed.inject(HttpClientService) as jasmine.SpyObj<HttpClientService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on ngOnInit', async () => {
        httpClientService.getAllGames.and.resolveTo(mockGames);

        await component.ngOnInit();

        expect(httpClientService.getAllGames).toHaveBeenCalled();
        expect(component.games).toEqual(mockGames);
    });

    it('should call getAllGames when loadGames is called', () => {
        httpClientService.getAllGames.and.resolveTo(mockGames);

        component.loadGames();

        expect(httpClientService.getAllGames).toHaveBeenCalled();
    });

    it('should set games property with the data returned from getAllGames', async () => {
        httpClientService.getAllGames.and.resolveTo(mockGames);

        await component.loadGames();

        expect(component.games).toEqual(mockGames);
    });

    it('should navigate to /edit with gameId as a query parameter', () => {
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');

        component.editGame('1');

        expect(routerSpy).toHaveBeenCalledWith(['/edit'], { queryParams: { gameId: '1' } });
    });

    it('should open import dialog when openImportDialog is called and listen to gameSaved event', () => {
        const dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.callThrough();
        const loadGamesSpy = spyOn(component, 'loadGames');

        component.openImportDialog();

        expect(dialogSpy).toHaveBeenCalledWith(ImportDialogComponent);
        const dialogRef = dialogSpy.calls.mostRecent().returnValue;
        (dialogRef.componentInstance as ImportDialogComponent).gameSaved.emit();
        expect(loadGamesSpy).toHaveBeenCalled();
    });
});
