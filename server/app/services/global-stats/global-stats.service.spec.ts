import { Player } from '@common/player';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { MovementService } from '@app/services/movement/movement.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { GlobalStatsService } from '@app/services/global-stats/global-stats.service';
/* eslint-disable */
describe('GlobalStatsService', () => {
    let service: GlobalStatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GlobalStatsService,
                Number,
                {
                    provide: InventoryService,
                    useValue: {},
                },
                {
                    provide: ActionService,
                    useValue: {},
                },
                {
                    provide: CombatHandlerService,
                    useValue: {},
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: ActiveGamesService,
                    useValue: {},
                },
                {
                    provide: ActionButtonService,
                    useValue: {},
                },
                {
                    provide: MovementService,
                    useValue: {},
                },
                VirtualPlayerService,
            ],
        }).compile();
        service = module.get<GlobalStatsService>(GlobalStatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
describe('GlobalStatsService', () => {
    let service: GlobalStatsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GlobalStatsService,
                Number,
                {
                    provide: InventoryService,
                    useValue: {},
                },
                {
                    provide: ActionService,
                    useValue: {},
                },
                {
                    provide: CombatHandlerService,
                    useValue: {},
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: ActiveGamesService,
                    useValue: {},
                },
                {
                    provide: ActionButtonService,
                    useValue: {},
                },
                {
                    provide: MovementService,
                    useValue: {},
                },
                VirtualPlayerService,
            ],
        }).compile();

        service = module.get<GlobalStatsService>(GlobalStatsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addPlayerHeldFlag', () => {
        it('should add a player to the playerHeldFlag set', () => {
            const player: Player = { id: '1', name: 'Player1' } as Player;
            service.addPlayerHeldFlag(player);
            expect(service.playerHeldFlag.has(player)).toBe(true);
        });

        it('should update the nbPlayersHeldFlag in globalStats', () => {
            const player1: Player = { id: '1', name: 'Player1' } as Player;
            const player2: Player = { id: '2', name: 'Player2' } as Player;
            service.addPlayerHeldFlag(player1);
            service.addPlayerHeldFlag(player2);
            expect(service.globalStats.nbPlayersHeldFlag).toBe(2);
        });

        it('should not add the same player twice', () => {
            const player: Player = { id: '1', name: 'Player1' } as Player;
            service.addPlayerHeldFlag(player);
            service.addPlayerHeldFlag(player);
            expect(service.playerHeldFlag.size).toBe(1);
            expect(service.globalStats.nbPlayersHeldFlag).toBe(1);
        });

        it('should increment the number of turns', () => {
            service.incrementTurn();
            expect(service.globalStats.nbTurns).toBe(1);
            service.incrementTurn();
            expect(service.globalStats.nbTurns).toBe(2);
        });

        it('should add a tile index to the visitedIndex set', () => {
            service.addVisitedTile(1);
            expect(service.visitedIndex.has(1)).toBe(true);
        });

        it('should return the correct visited tiles percentage', () => {
            service.maxNbTiles = 10;
            service.addVisitedTile(1);
            service.addVisitedTile(2);
            expect(service.getVisitedPercent()).toBe(20);
        });

        it('should add a door index to the usedDoors set', () => {
            service.addUsedDoor(1);
            expect(service.usedDoors.has(1)).toBe(true);
        });

        it('should start the timer and increment matchLength', () => {
            jest.useFakeTimers();
            service.startTimerInterval();
            expect(service.timerId).toBeDefined();
            expect(service.globalStats.matchLength).toBe(0);

            jest.advanceTimersByTime(1001);
            expect(service.globalStats.matchLength).toBe(1);

            jest.advanceTimersByTime(2000);
            expect(service.globalStats.matchLength).toBe(3);

            jest.useRealTimers();
        });

        it('should stop the timer', () => {
            service.startTimerInterval();
            expect(service.timerId).toBeDefined();

            service.stopTimerInterval();
            expect(service.timerId).toBeUndefined();
        });

        it('should return the correct percentage of used doors', () => {
            service.maxNbDoors = 100;
            service.addUsedDoor(1);
            service.addUsedDoor(2);
            expect(service.getUsedDoorsPercent()).toBe(2);
        });

        it('should return the final stats with correct percentages and stop the timer', () => {
            service.maxNbDoors = 100;
            service.addUsedDoor(1);
            service.addUsedDoor(2);

            service.maxNbTiles = 100;
            service.addVisitedTile(1);
            service.addVisitedTile(2);

            service.globalStats.matchLength = 3;

            jest.useFakeTimers();
            jest.advanceTimersByTime(3000);

            const finalStats = service.getFinalStats();
            expect(finalStats.visitedTilesPercent).toBe(2);
            expect(finalStats.usedDoorsPercent).toBe(2);
            expect(finalStats.matchLength).toBe(3);
            expect(service.timerId).toBeUndefined();
            jest.useRealTimers();
        });
    });
});
