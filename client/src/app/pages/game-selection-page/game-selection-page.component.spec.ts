import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientService } from '@app/services/http-client.service';
import { GameStructure } from '@common/game-structure';
import { GameSelectionPageComponent } from './game-selection-page.component';

describe('GameSelectionPageComponent', () => {
    let component: GameSelectionPageComponent;
    let fixture: ComponentFixture<GameSelectionPageComponent>;

    const mockElementRef = {
        nativeElement: {
            scrollLeft: 0,
            scrollRight: 0,
        },
    } as ElementRef;

    const mockGames: GameStructure[] = [
        {
            id: '1',
            gameName: 'Game 1',
            gameDescription: 'Description 1',
            gameType: 'Type 1',
            mapSize: '10x10',
            map: [],
            isVisible: true,
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        },
        {
            id: '2',
            gameName: 'Game 2',
            gameDescription: 'Description 2',
            gameType: 'Type 2',
            mapSize: '20x20',
            map: [],
            isVisible: false,
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        },
        {
            id: '3',
            gameName: 'Game 3',
            gameDescription: 'Description 3',
            gameType: 'Type 3',
            mapSize: '30x30',
            map: [],
            isVisible: true,
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        },
    ];

    const mockHttpClientService = {
        getAllGames: jasmine.createSpy('getAllGames').and.returnValue(Promise.resolve(mockGames)),
    };

    const activatedRouteStub = {
        snapshot: {
            paramMap: {
                get: () => 'test-id',
            },
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameSelectionPageComponent],
            providers: [
                { provide: HttpClientService, useValue: mockHttpClientService },
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockElementRef.nativeElement.scrollLeft = 0;

        component.widgetsContent = mockElementRef;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should scroll left', () => {
        component.scrollLeft();
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollLeft).toBe(-300);
    });

    it('should scroll right', () => {
        component.scrollRight();
        // eslint-disable-next-line
        expect(component.widgetsContent.nativeElement.scrollLeft).toBe(300);
    });
});
