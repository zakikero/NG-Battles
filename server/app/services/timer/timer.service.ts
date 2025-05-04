import { COOLDOWN_TIME, INITIAL_TIME, INTERVAL_DURATION } from '@app/services/timer/constants';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TimerService {
    private intervalId: NodeJS.Timeout | null = null;
    private currentTime: number = INITIAL_TIME;
    private isPaused: boolean = false;
    private server: Server;
    private roomId: string;
    private isCooldown: boolean = false;

    constructor(server: Server, roomId: string) {
        this.server = server;
        this.roomId = roomId;
    }

    startTimer(): void {
        if (this.intervalId) {
            this.clearTimer();
        }
        this.startCooldown();
    }

    pauseTimer(): void {
        if (this.intervalId && !this.isPaused) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isPaused = true;
        }
    }

    resumeTimer(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.startInterval();
        }
    }

    resetTimer(): void {
        this.clearTimer();
        this.isCooldown = false;
        this.currentTime = INITIAL_TIME;
    }

    onDestroy(): void {
        this.clearTimer();
    }

    private startCooldown(): void {
        this.currentTime = COOLDOWN_TIME;
        this.isPaused = false;
        this.isCooldown = true;
        this.startInterval();
    }

    private startMainTimer(): void {
        this.currentTime = INITIAL_TIME;
        this.isPaused = false;
        this.isCooldown = false;
        this.startInterval();
    }

    private startInterval(): void {
        this.intervalId = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.server.to(this.roomId).emit('timerUpdate', this.currentTime);
            } else {
                if (this.isCooldown) {
                    this.clearTimer();
                    this.server.to(this.roomId).emit('endCooldown');
                    this.startMainTimer();
                } else {
                    this.clearTimer();
                    this.server.to(this.roomId).emit('timerUpdate', 0);
                    this.server.to(this.roomId).emit('endTimer');
                }
            }
        }, INTERVAL_DURATION);
    }

    private clearTimer(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isPaused = false;
    }
}
