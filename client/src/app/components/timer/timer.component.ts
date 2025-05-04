import { Component, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimerState } from '@common/game-structure';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnChanges {
    @Input() timeLeft: number; // Set the initial time in seconds
    @Input() timerState: TimerState;

    timerSubscription: Subscription | null = null;
    isRunning: boolean = false;
    isActive: boolean = false;
    timerStateEnum: string;

    ngOnChanges() {
        this.changeTimerStateEnum(this.timerState);
    }

    changeTimerStateEnum(timerState: TimerState) {
        switch (timerState) {
            case TimerState.REGULAR:
                this.timerStateEnum = 'Jeu';
                break;
            case TimerState.COOLDOWN:
                this.timerStateEnum = 'Repos';
                break;
            case TimerState.COMBAT:
                this.timerStateEnum = 'Combat';
                break;
            default:
                this.timerStateEnum = '';
                break;
        }
    }
}
