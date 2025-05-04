import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { SocketService } from './socket.service';
/* eslint-disable */

describe('SocketService', () => {
    let service: SocketService;
    let socketStub: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketStub = jasmine.createSpyObj('Socket', ['on', 'emit', 'once', 'disconnect'], { connected: true });

        TestBed.configureTestingModule({
            providers: [SocketService],
        });

        service = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect from the socket', () => {
        service.socket = socketStub;
        service.disconnect();
        expect(socketStub.disconnect).toHaveBeenCalled();
    });

    it('should check if socket is alive', () => {
        socketStub.connected = true;
        service.socket = socketStub;
        expect(service.isSocketAlive()).toBeTrue();
    });

    it('should listen to an event', () => {
        const event = 'testEvent';
        const action = jasmine.createSpy('action');
        service.socket = socketStub;
        service.on(event, action);
        expect(socketStub.on).toHaveBeenCalledWith(event, action);
    });

    it('should emit an event', () => {
        const event = 'testEvent';
        const data = { key: 'value' };
        const callback = jasmine.createSpy('callback');
        service.socket = socketStub;
        service.emit(event, data, callback);
        expect(socketStub.emit).toHaveBeenCalledWith(event, data, callback);
    });

    it('should listen to an event once', () => {
        const event = 'testEvent';
        const action = jasmine.createSpy('action');
        service.socket = socketStub;
        service.once(event, action);
        expect(socketStub.once).toHaveBeenCalledWith(event, action);
    });

    it('should return the socket id', () => {
        const socketId = '12345';
        socketStub.id = socketId;
        service.socket = socketStub;
        expect(service.id()).toBe(socketId);
    });
});
