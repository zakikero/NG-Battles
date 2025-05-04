import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { GameSelectionComponent } from './game-selection.component';
/* eslint-disable */

describe('GameSelectionComponent', () => {
    let component: GameSelectionComponent;
    let fixture: ComponentFixture<GameSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameSelectionComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: {
                            get: () => '123', // or a more complex mapping
                        },
                    },
                },
            ],
        }).compileComponents();

        const mockGame = {
            id: '1',
            gameName: 'Game 1',
            gameDescription: 'Description 1',
            gameType: 'Type 1',
            mapSize: '10x10',
            map: [],
            isVisible: true,
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        };

        fixture = TestBed.createComponent(GameSelectionComponent);
        component = fixture.componentInstance;

        component.game = mockGame;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
