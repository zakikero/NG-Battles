import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { KickedDialogComponent } from '@app/components/kicked-dialog/kicked-dialog.component';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { VirtualPlayerDialogComponent } from '@app/components/virtual-player-dialog/virtual-player-dialog.component';
import { SocketService } from '@app/services/socket.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-waiting-page',
    standalone: true,
    imports: [MatButtonModule, PlayerListComponent, ChatComponent, RouterLink],
    templateUrl: './waiting-page.component.html',
    styleUrl: './waiting-page.component.scss',
})
export class WaitingPageComponent implements OnInit {
    dialog = inject(MatDialog);

    roomId: string;
    characterName: string;
    selectedAvatar: string;
    playerId: string;
    players: Player[] = [];
    isAdmin: boolean;
    maxPlayers: number;
    isRoomLocked: boolean = false;
    gameId: string;
    constructor(
        private readonly socketService: SocketService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.socketService.on('maxPlayers', (maxPlayers: number) => {
            this.maxPlayers = maxPlayers;
        });
        this.socketService.once('roomLeft', () => {
            this.router.navigate(['/']);
        });
        this.socketService.once('kicked', () => {
            this.openKickedDialog();
        });
        this.socketService.on('roomLocked', () => {
            const lockButton = document.getElementById('lock-btn');
            if (lockButton) {
                lockButton.innerHTML = 'Déverrouiller';
            }
            const virtualPlayerButton = document.getElementById('virtual-btn');
            if (virtualPlayerButton) {
                virtualPlayerButton.setAttribute('disabled', 'true');
            }
        });
        this.socketService.on('roomUnlocked', () => {
            const lockButton = document.getElementById('lock-btn');
            if (lockButton) {
                lockButton.innerHTML = 'Verrouiller';
            }
            const virtualPlayerButton = document.getElementById('virtual-btn');
            if (virtualPlayerButton) {
                virtualPlayerButton.removeAttribute('disabled');
            }
        });
        this.getPlayers();
        this.updatePlayers();
        this.gameStartedListener();
        this.route.params.subscribe((params) => {
            this.roomId = params.roomId;
            this.playerId = params.playerId;
            this.characterName = params.characterName;
            this.isAdmin = params.isAdmin === 'true';
            this.selectedAvatar = params.selectedAvatar;
            this.socketService.emit('getMaxPlayers', { roomId: this.roomId });
        });
    }

    gameStartedListener() {
        this.socketService.once('gameStarted', (data: { gameId: string; players: Player[] }) => {
            this.router.navigate([
                '/game',
                {
                    playerId: this.playerId,
                    gameId: data.gameId,
                    roomId: this.roomId,
                    isAdmin: this.isAdmin,
                },
            ]);
        });
    }

    getPlayers() {
        this.socketService.once('getPlayers', (players: Player[]) => {
            this.players = players;
        });
        this.socketService.emit('getPlayers', this.roomId);
    }

    updatePlayers() {
        this.socketService.on('updatePlayers', (players: Player[]) => {
            this.players = players;
            if (players.length === this.maxPlayers) {
                const lockButton = document.getElementById('lock-btn');
                if (lockButton) {
                    lockButton.setAttribute('disabled', 'true');
                }
            } else {
                const lockButton = document.getElementById('lock-btn');
                if (lockButton) {
                    lockButton.removeAttribute('disabled');
                }
            }
        });
    }

    openKickedDialog() {
        this.dialog.open(KickedDialogComponent, {
            data: {
                message: 'Vous avez été expulsé de la partie',
            },
        });
    }

    leaveRoom() {
        this.socketService.disconnect();
    }

    lockRoom() {
        this.socketService.on('isRoomLocked', (isRoomLocked: boolean) => {
            this.isRoomLocked = !isRoomLocked;
            if (isRoomLocked) {
                this.socketService.emit('unlockRoom', this.roomId);
            } else {
                this.socketService.emit('lockRoom', this.roomId);
            }
        });
        this.socketService.emit('isRoomLocked', this.roomId);
    }

    deletePlayer(kickedPlayerId: string) {
        this.socketService.emit('kickPlayer', { roomId: this.roomId, playerId: kickedPlayerId });
    }

    startGame() {
        this.socketService.once('startError', (error: string) => {
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: [error],
                },
            });
        });
        this.socketService.emit('startGame', { roomId: this.roomId });
    }

    addVirtualPlayer() {
        this.dialog.open(VirtualPlayerDialogComponent, { data: { roomId: this.roomId } });
    }
}
