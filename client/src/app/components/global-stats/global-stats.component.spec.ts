import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalStats } from '@common/global-stats';
import { GlobalStatsComponent } from './global-stats.component';
/* eslint-disable */

describe('GlobalStatsComponent', () => {
    let component: GlobalStatsComponent;
    let fixture: ComponentFixture<GlobalStatsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GlobalStatsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GlobalStatsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should format match length correctly', () => {
        expect(component.formatMatchLength(0)).toBe('0:00');
        // okay to use magic numbers in tests
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        expect(component.formatMatchLength(59)).toBe('0:59');
        expect(component.formatMatchLength(60)).toBe('1:00');
        expect(component.formatMatchLength(90)).toBe('1:30');
        expect(component.formatMatchLength(3600)).toBe('60:00');
        /* eslint-enable @typescript-eslint/no-magic-numbers */
    });

    it('should accept globalStats as input', () => {
        const mockStats: GlobalStats = {
            matchLength: 120,
            nbTurns: 10,
            visitedTilesPercent: 50,
            usedDoorsPercent: 30,
            nbPlayersHeldFlag: 2,
        };
        component.globalStats = mockStats;
        fixture.detectChanges();
        expect(component.globalStats).toEqual(mockStats);
    });

    it('should accept gameMode as input', () => {
        const mockGameMode = 'testMode';
        component.gameMode = mockGameMode;
        fixture.detectChanges();
        expect(component.gameMode).toBe(mockGameMode);
    });
});
