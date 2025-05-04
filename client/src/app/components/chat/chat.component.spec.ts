import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket.service';
import { ChatComponent } from './chat.component';

/* eslint-disable */

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['once', 'on', 'emit']);

        await TestBed.configureTestingModule({
            imports: [ChatComponent],
            providers: [{ provide: SocketService, useValue: mockSocketService }, DatePipe, ChangeDetectorRef],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load messages on init', () => {
        const messages = [{ name: 'Player 1', message: 'Hello', date: '12:00:00' }];
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'loadAllMessages') {
                action({ messages });
            }
        });

        component.loadMessages();

        expect(mockSocketService.emit).toHaveBeenCalledWith('loadAllMessages', { roomId: component.roomId });
        expect(component.messages).toEqual(messages);
    });

    it('should receive a message and add it to the messages array', () => {
        const message = { name: 'Player 1', message: 'Hello', date: '12:00:00' };
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'singleMessage') {
                action(message);
            }
        });

        component.receiveMessage();

        expect(component.messages).toContain(message);
    });

    it('should send a message', () => {
        component.myMessage = { name: 'Player 1', message: 'Hello', date: '' };
        const currentTime = '12:00:00';
        spyOn(component['datePipe'], 'transform').and.returnValue(currentTime);

        component.sendMessage();

        expect(component.myMessage.date).toBe(currentTime);
        expect(mockSocketService.emit).toHaveBeenCalledWith('roomMessage', { roomId: component.roomId, message: 'Hello', date: currentTime });
        expect(component.myMessage.message).toBe('');
    });

    it('should send a message with an empty date if datePipe fails', () => {
        component.myMessage = { name: 'Player 1', message: 'Hello', date: '' };
        spyOn(component['datePipe'], 'transform').and.returnValue(null);

        component.sendMessage();

        expect(component.myMessage.date).toBe(''); // Fallback case
        expect(mockSocketService.emit).toHaveBeenCalledWith('roomMessage', { roomId: component.roomId, message: 'Hello', date: '' });
        expect(component.myMessage.message).toBe('');
    });

    it('should not send an empty message', () => {
        mockSocketService.emit.calls.reset();
        component.myMessage = { name: 'Player 1', message: '', date: '' };
        component.sendMessage();
        expect(mockSocketService.emit).not.toHaveBeenCalled();
    });
});
