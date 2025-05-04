import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
import { GlobalStatsService } from '@app/services/global-stats/global-stats.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
export interface GameInstance {
    roomId: string;
    game: GameStructure;
    turnTimer?: TimerService;
    combatTimer?: CombatTimerService;
    playersCoord?: PlayerCoord[];
    fightTurns?: number;
    turn?: number;
    currentPlayerMoveBudget?: number;
    currentPlayerActionPoint?: number;
    globalStatsService?: GlobalStatsService;
    maxNbTiles?: number;
}
