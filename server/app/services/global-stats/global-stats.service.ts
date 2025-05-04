import { ONE_HUNDRED, ONE_SECOND } from '@app/services/global-stats/global-stats.utils';
import { GlobalStats } from '@common/global-stats';
import { Player } from '@common/player';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalStatsService {
    globalStats: GlobalStats;

    visitedIndex: Set<number> = new Set<number>();
    usedDoors: Set<number> = new Set<number>();

    playerHeldFlag: Set<Player> = new Set<Player>();

    maxNbDoors: number;
    maxNbTiles: number;

    timerId: NodeJS.Timeout;

    constructor(maxNbDoors: number, maxNbTiles: number) {
        this.globalStats = {
            matchLength: 0,
            nbTurns: 0,
            visitedTilesPercent: 0,
            usedDoorsPercent: 0,
            nbPlayersHeldFlag: 0,
        };
        this.maxNbDoors = maxNbDoors;
        this.maxNbTiles = maxNbTiles;
        this.visitedIndex = new Set<number>();
        this.usedDoors = new Set<number>();
    }

    startTimerInterval(): void {
        this.timerId = setInterval(() => {
            this.globalStats.matchLength++;
        }, ONE_SECOND);
    }

    stopTimerInterval(): void {
        clearInterval(this.timerId);
        this.timerId = undefined;
    }

    incrementTurn(): void {
        this.globalStats.nbTurns++;
    }

    addVisitedTile(tileIndex: number): void {
        this.visitedIndex.add(tileIndex);
    }

    getVisitedPercent(): number {
        return (this.visitedIndex.size / this.maxNbTiles) * ONE_HUNDRED;
    }

    addUsedDoor(doorIndex: number): void {
        this.usedDoors.add(doorIndex);
    }

    addPlayerHeldFlag(player: Player): void {
        this.playerHeldFlag.add(player);
        this.globalStats.nbPlayersHeldFlag = this.playerHeldFlag.size;
    }

    getUsedDoorsPercent(): number {
        return (this.usedDoors.size / this.maxNbDoors) * ONE_HUNDRED;
    }

    getFinalStats(): GlobalStats {
        this.globalStats.visitedTilesPercent = this.getVisitedPercent();
        this.globalStats.usedDoorsPercent = this.getUsedDoorsPercent();
        this.stopTimerInterval();
        return this.globalStats;
    }
}
