import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { GlobalStatsComponent } from '@app/components/global-stats/global-stats.component';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { GameEndPageComponent } from './game-end-page.component';

describe('GameEndPageComponent', () => {
    let component: GameEndPageComponent;
    let fixture: ComponentFixture<GameEndPageComponent>;
    let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({
                data: JSON.stringify({
                    roomId: 'testRoom',
                    characterName: 'testName',
                    players: [],
                    globalStats: { visitedTilesPercent: 0 },
                }),
            }),
        });

        mockSocketService = jasmine.createSpyObj('SocketService', ['disconnect', 'once', 'emit', 'on']);

        await TestBed.configureTestingModule({
            imports: [GameEndPageComponent, BrowserAnimationsModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: SocketService, useValue: mockSocketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameEndPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with query params', () => {
        expect(component.roomId).toBe('testRoom');
        expect(component.characterName).toBe('testName');
        expect(component.playerList).toEqual([]);
        /* eslint-disable @typescript-eslint/no-explicit-any*/
        expect(component.globalStats).toEqual({ visitedTilesPercent: 0 } as any);
    });

    it('should call socketService.disconnect on leaveRoom', () => {
        component.leaveRoom();
        expect(mockSocketService.disconnect).toHaveBeenCalled();
    });

    it('should format match length correctly', () => {
        const globalStatsComponent = new GlobalStatsComponent();
        // okay to have magic numbers in tests
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(globalStatsComponent.formatMatchLength(125)).toBe('2:05');
    });

    it('should format visited tiles percent correctly', () => {
        const globalStatsComponent = new GlobalStatsComponent();
        // okay to have magic numbers in tests
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(globalStatsComponent.formatVisitedTilesPercent(45.6789)).toBe('45.68%');
    });
});
