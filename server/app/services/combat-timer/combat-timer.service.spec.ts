import { INTERVAL_DURATION, TIME, TIME_NO_ESCAPE } from '@app/services/combat-timer/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
/* eslint-disable */
describe('CombatTimerService', () => {
    let service: CombatTimerService;
    let mockServer: Server;

    beforeEach(async () => {
        mockServer = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            any: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        const mockRoomId = 'testRoom';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: CombatTimerService,
                    useFactory: () => new CombatTimerService(mockServer, mockRoomId),
                },
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: LogSenderService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<CombatTimerService>(CombatTimerService);
    });

    afterEach(() => {
        jest.clearAllTimers();
        service.resetTimer();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    jest.useFakeTimers();

    describe('CombatTimerService', () => {
        let service: CombatTimerService;
        let mockServer: Server;

        beforeEach(async () => {
            mockServer = {
                to: jest.fn().mockReturnThis(),
                emit: jest.fn(),
            } as any;

            const mockRoomId = 'testRoom';

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    {
                        provide: CombatTimerService,
                        useFactory: () => new CombatTimerService(mockServer, mockRoomId),
                    },
                ],
            }).compile();

            service = module.get<CombatTimerService>(CombatTimerService);
        });

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        it('should reset the timer', () => {
            service.resetTimer();
            expect(service['intervalId']).toBeNull();
            expect(mockServer.to).toHaveBeenCalledWith('testRoom');
            expect(mockServer.emit).toHaveBeenCalledWith('CombatTimerUpdate', TIME);
        });

        it('should clear the timer on destroy', () => {
            service.onDestroy();
            expect(service['intervalId']).toBeNull();
        });

        it('should decrement the timer and emit updates', () => {
            service.startTimer(true);
            jest.advanceTimersByTime(INTERVAL_DURATION);
            expect(service['currentTime']).toBe(TIME - 1);
            expect(mockServer.emit).toHaveBeenCalledWith('CombatTimerUpdate', TIME - 1);
        });

        it('should set currentTime to TIME when hasEscape is true', () => {
            service['setTimer'](true);
            expect(service['currentTime']).toBe(TIME);
        });

        it('should set currentTime to TIME_NO_ESCAPE when hasEscape is false', () => {
            service['setTimer'](false);
            expect(service['currentTime']).toBe(TIME_NO_ESCAPE);
        });

        it('should call clearTimer if intervalId is set', () => {
            const clearTimerSpy = jest.spyOn(service as any, 'clearTimer');
            service['intervalId'] = setInterval(() => {}, INTERVAL_DURATION);
            service.startTimer(true);
            expect(clearTimerSpy).toHaveBeenCalled();
        });

        it('should not call clearTimer if intervalId is not set', () => {
            const clearTimerSpy = jest.spyOn(service as any, 'clearTimer');
            service['intervalId'] = null;
            service.startTimer(true);
            expect(clearTimerSpy).not.toHaveBeenCalled();
        });

        it('should call startInterval with hasEscape parameter', () => {
            const startIntervalSpy = jest.spyOn(service as any, 'startInterval');
            const hasEscape = true;
            service.startTimer(hasEscape);
            expect(startIntervalSpy).toHaveBeenCalledWith(hasEscape);
        });

        it('should call clearTimer and emit CombatTimerUpdate and endCombatTimer when currentTime reaches 0', () => {
            jest.useFakeTimers();
            const clearTimerSpy = jest.spyOn(service as any, 'clearTimer');
            const emitSpy = jest.spyOn(mockServer, 'emit');

            service['currentTime'] = 1;
            service['startInterval'](true);

            jest.runAllTimers();

            // Assertions
            expect(clearTimerSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith('CombatTimerUpdate', 0);
            expect(emitSpy).toHaveBeenCalledWith('endCombatTimer');
        });
    });
});
