import { Component, Input } from '@angular/core';
import { GlobalStats } from '@common/global-stats';
import { SECONDS_PER_MINUTE } from './constants';

@Component({
    selector: 'app-global-stats',
    standalone: true,
    imports: [],
    templateUrl: './global-stats.component.html',
    styleUrl: './global-stats.component.scss',
})
export class GlobalStatsComponent {
    @Input() globalStats: GlobalStats;

    @Input() gameMode: string;

    formatMatchLength(length: number): string {
        const minutes = Math.floor(length / SECONDS_PER_MINUTE);

        const seconds = (length % SECONDS_PER_MINUTE).toString().padStart(2, '0');

        return `${minutes}:${seconds}`;
    }

    formatVisitedTilesPercent(visitedTilesPercent: number): string {
        return `${visitedTilesPercent.toFixed(2)}%`;
    }
}
