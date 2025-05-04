import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RANDOM_TIME_STATE, TIME_LEFT } from '@app/components/timer/constant';
import { TimerState } from '@common/game-structure';
import { TimerComponent } from './timer.component';
/* eslint-disable */

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        component.timeLeft = TIME_LEFT; // Reset timeLeft
        component.isRunning = false; // Reset isRunning
        component.isActive = false; // Reset isActive
        component.timerSubscription = null; // Reset timerSubscription
        fixture.detectChanges();
    });

    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set timerStateEnum to "Jeu" when timerState is REGULAR', () => {
        component.timerState = TimerState.REGULAR;
        component.ngOnChanges();
        expect(component.timerStateEnum).toBe('Jeu');
    });

    it('should set timerStateEnum to "Repos" when timerState is COOLDOWN', () => {
        component.timerState = TimerState.COOLDOWN;
        component.ngOnChanges();
        expect(component.timerStateEnum).toBe('Repos');
    });

    it('should set timerStateEnum to "Combat" when timerState is COMBAT', () => {
        component.timerState = TimerState.COMBAT;
        component.ngOnChanges();
        expect(component.timerStateEnum).toBe('Combat');
    });

    it('should set timerStateEnum to an empty string when timerState is undefined', () => {
        component.timerState = RANDOM_TIME_STATE as TimerState;
        component.ngOnChanges();
        expect(component.timerStateEnum).toBe('');
    });
});
