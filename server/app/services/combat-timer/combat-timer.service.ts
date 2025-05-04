import { INTERVAL_DURATION, TIME, TIME_NO_ESCAPE } from '@app/services/combat-timer/constants';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class CombatTimerService {
    private intervalId: NodeJS.Timeout | null = null;
    private currentTime: number = TIME;
    private server: Server;
    private roomId: string;

    constructor(server: Server, roomId: string) {
        this.server = server;
        this.roomId = roomId;
    }

    startTimer(hasEscape: boolean): void {
        if (this.intervalId) {
            this.clearTimer();
        }
        this.startInterval(hasEscape);
    }

    resetTimer(): void {
        this.clearTimer();
        this.server.to(this.roomId).emit('CombatTimerUpdate', this.currentTime);
    }

    onDestroy(): void {
        this.clearTimer();
    }

    private setTimer(hasEscape: boolean): void {
        if (hasEscape) {
            this.currentTime = TIME;
        } else {
            this.currentTime = TIME_NO_ESCAPE;
        }
    }
    private startInterval(hasEscape: boolean): void {
        this.setTimer(hasEscape);
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.server.to(this.roomId).emit('CombatTimerUpdate', this.currentTime);
            } else {
                this.clearTimer();
                this.server.to(this.roomId).emit('CombatTimerUpdate', 0);
                this.server.to(this.roomId).emit('endCombatTimer');
            }
        }, INTERVAL_DURATION);
    }

    private clearTimer(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
