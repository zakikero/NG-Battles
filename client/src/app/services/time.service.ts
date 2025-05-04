import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private interval: number | undefined;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly TICK = 1000;

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stopTimer();
            }
        }, this.TICK);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
