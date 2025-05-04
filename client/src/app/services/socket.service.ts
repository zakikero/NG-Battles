import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    id() {
        return this.socket.id;
    }

    connect() {
        this.socket = io(environment.serverUrl, { path: '/socket.io' });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    emit<T>(event: string, data?: T, callback?: () => void): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }

    once<T>(event: string, action: (data: T) => void): void {
        this.socket.once(event, action);
    }
}
