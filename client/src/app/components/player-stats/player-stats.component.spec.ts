import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Player } from '@common/player';
import { PlayerStatsComponent } from './player-stats.component';
/* eslint-disable */

describe('PlayerStatsComponent', () => {
    let component: PlayerStatsComponent;
    let fixture: ComponentFixture<PlayerStatsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerStatsComponent, MatTableModule, MatSortModule, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerStatsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize adaptedPlayerList and dataSource correctly in ngOnInit', () => {
        const mockPlayerList: Player[] = [
            {
                id: '1',
                name: 'Alice',
                isAdmin: true,
                avatar: 'avatar1.png',
                attributes: {
                    health: 100,
                    speed: 10,
                    attack: 15,
                    defense: 5,
                    dice: 'd6',
                },
                isActive: true,
                abandoned: false,
                wins: 10,
                isVirtual: false,
                inventory: [],
                stats: {
                    combatCount: 20,
                    escapeCount: 5,
                    victoryCount: 10,
                    defeatCount: 10,
                    totalHealthLost: 200,
                    totalHealthTaken: 300,
                    uniqueItemsCollected: 15,
                    visitedTilesPercent: 75,
                    // okay to have magic numbers in tests
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    visitedTiles: new Set([1, 2, 3]),
                },
            },
        ];

        component.playerList = mockPlayerList;
        component.ngOnInit();

        expect(component.adaptedPlayerList).toEqual([
            {
                name: 'Alice',
                combatCount: 20,
                escapeCount: 5,
                victoryCount: 10,
                defeatCount: 10,
                totalHealthLost: 200,
                totalHealthTaken: 300,
                uniqueItemsCollected: 15,
                visitedTilesPercent: 75,
            },
        ]);

        expect(component.dataSource.data).toEqual(component.adaptedPlayerList);
    });
});
