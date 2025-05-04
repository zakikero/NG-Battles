import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { COOLDOWN_TIME, INITIAL_TIME, INTERVAL_DURATION } from '@app/services/timer/constants';
import { TimerService } from '@app/services/timer/timer.service';
/* eslint-disable */
describe('TimerService', () => {
    let service: TimerService;
    let mockServer: Server;
    let mockEmit: jest.Mock;
    let mockTo: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TimerService,
                    useValue: {},
                },
                {
                    provide: VirtualPlayerService,
                    useValue: {},
                },
            ],
        }).compile();
        jest.useFakeTimers();
        mockEmit = jest.fn();
        mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
        mockServer = { to: mockTo } as unknown as Server;
        service = new TimerService(mockServer, 'testRoom');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should start cooldown timer first', () => {
        service.startTimer();
        expect(service['currentTime']).toBe(COOLDOWN_TIME);
        expect(service['isCooldown']).toBe(true);
    });

    it('should emit timer updates during cooldown', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        expect(mockTo).toHaveBeenCalledWith('testRoom');
        expect(mockEmit).toHaveBeenCalledWith('timerUpdate', COOLDOWN_TIME - 1);
    });

    it('should clear timer if already running', () => {
        service.startTimer();
        service.startTimer();
        expect(service['currentTime']).toBe(COOLDOWN_TIME);
    });
    it('should pause running timer', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        service.pauseTimer();
        expect(service['isPaused']).toBe(true);
        expect(service['intervalId']).toBeNull();
    });

    it('should not pause if timer is already paused', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        service.pauseTimer();
        const intervalIdBefore = service['intervalId'];
        service.pauseTimer();
        expect(service['isPaused']).toBe(true);
        expect(service['intervalId']).toBe(intervalIdBefore);
    });

    it('should not pause if timer is not running', () => {
        service.pauseTimer();
        expect(service['isPaused']).toBe(false);
        expect(service['intervalId']).toBeNull();
    });

    it('should initialize main timer correctly', () => {
        service['startMainTimer']();
        expect(service['currentTime']).toBe(INITIAL_TIME);
        expect(service['isPaused']).toBe(false);
        expect(service['isCooldown']).toBe(false);
    });

    it('should call startInterval when starting main timer', () => {
        const startIntervalSpy = jest.spyOn<any, any>(service, 'startInterval');
        service['startMainTimer']();
        expect(startIntervalSpy).toHaveBeenCalled();
    });

    it('should reset the timer correctly', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        service.resetTimer();
        expect(service['currentTime']).toBe(INITIAL_TIME);
        expect(service['isCooldown']).toBe(false);
        expect(service['intervalId']).toBeNull();
    });

    it('should clear the timer when destroyed', () => {
        const clearTimerSpy = jest.spyOn<any, any>(service, 'clearTimer');
        service.onDestroy();
        expect(clearTimerSpy).toHaveBeenCalled();
    });

    it('should set intervalId to null when destroyed', () => {
        service.startTimer();
        service.onDestroy();
        expect(service['intervalId']).toBeNull();
    });

    it('should set isPaused to false when destroyed', () => {
        service.startTimer();
        service.onDestroy();
        expect(service['isPaused']).toBe(false);
    });

    it('should not emit any events when destroyed', () => {
        service.onDestroy();
        expect(mockEmit).not.toHaveBeenCalled();
    });
    it('should clear timer, emit endCooldown, and start main timer if in cooldown', () => {
        service['isCooldown'] = true;
        service['currentTime'] = 0;
        const clearTimerSpy = jest.spyOn<any, any>(service, 'clearTimer');
        const startMainTimerSpy = jest.spyOn<any, any>(service, 'startMainTimer');

        service['startInterval']();
        jest.advanceTimersByTime(INTERVAL_DURATION);

        expect(clearTimerSpy).toHaveBeenCalled();
        expect(mockTo).toHaveBeenCalledWith('testRoom');
        expect(mockEmit).toHaveBeenCalledWith('endCooldown');
        expect(startMainTimerSpy).toHaveBeenCalled();
    });

    it('should clear timer, emit timerUpdate with 0, and emit endTimer if not in cooldown', () => {
        service['isCooldown'] = false;
        service['currentTime'] = 0;
        const clearTimerSpy = jest.spyOn<any, any>(service, 'clearTimer');

        service['startInterval']();
        jest.advanceTimersByTime(INTERVAL_DURATION);

        expect(clearTimerSpy).toHaveBeenCalled();
        expect(mockTo).toHaveBeenCalledWith('testRoom');
        expect(mockEmit).toHaveBeenCalledWith('timerUpdate', 0);
        expect(mockEmit).toHaveBeenCalledWith('endTimer');
    });
    it('should resume the timer if it is paused', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        service.pauseTimer();
        service.resumeTimer();
        expect(service['isPaused']).toBe(false);
        expect(service['intervalId']).not.toBeNull();
    });

    it('should not resume the timer if it is not paused', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        const intervalIdBefore = service['intervalId'];
        service.resumeTimer();
        expect(service['isPaused']).toBe(false);
        expect(service['intervalId']).toBe(intervalIdBefore);
    });

    it('should call startInterval when resuming the timer', () => {
        service.startTimer();
        jest.advanceTimersByTime(INTERVAL_DURATION);
        service.pauseTimer();
        const startIntervalSpy = jest.spyOn<any, any>(service, 'startInterval');
        service.resumeTimer();
        expect(startIntervalSpy).toHaveBeenCalled();
    });
});
