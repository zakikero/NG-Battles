import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { AttributeSelectionComponent } from '@app/components/attribute-selection/attribute-selection.component';
import { AvatarSliderComponent } from '@app/components/avatar-slider/avatar-slider.component';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { Avatar } from '@app/interfaces/avatar';
import { DEFAULT_AVATAR_LIST } from '@app/services/constants';
import { PlayerService } from '@app/services/player.service';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerAttribute } from '@common/player';

@Component({
    selector: 'app-join-page',
    standalone: true,
    imports: [AvatarSliderComponent, AttributeSelectionComponent, FormsModule, MatButtonModule, RouterLink],
    templateUrl: './join-page.component.html',
    styleUrl: './join-page.component.scss',
})
export class JoinPageComponent {
    @ViewChild('roomCheck') roomCheck: ElementRef;
    attributes: PlayerAttribute;
    playerList: Player[];
    selectedAvatar = '';
    dialog = inject(MatDialog);
    characterName = '';
    roomId: string;
    isRoomCodeValid: boolean = false;
    availableAvatars: Avatar[] = DEFAULT_AVATAR_LIST;
    private nonAvailableAvatars: Avatar[] = [];
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly MIN_NAME_LENGTH: number = 3;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly MAX_NAME_LENGTH: number = 15;

    constructor(
        private readonly socketService: SocketService,
        private router: Router,
        private playerService: PlayerService,
    ) {}

    formChecking(): string[] {
        const errors: string[] = [];
        if (!this.selectedAvatar) errors.push('- Veuillez sélectionner un avatar avant de continuer');
        if (!this.isNameValid()) errors.push('- Veuillez mettre un nom pour le personne entre 3 et 15 charactères');
        return errors;
    }

    isNameValid(): boolean {
        return (
            this.characterName.length >= this.MIN_NAME_LENGTH && this.characterName.length <= this.MAX_NAME_LENGTH && this.characterName.trim() !== ''
        );
    }

    receiveSelectedAvatar(selectedAvatarFromChild: Avatar) {
        this.selectedAvatar = selectedAvatarFromChild.name;
    }

    receiveAttributes(attributesFromChild: PlayerAttribute) {
        this.attributes = attributesFromChild;
    }

    onSubmitCode(event: Event) {
        if (this.socketService.isSocketAlive()) this.socketService.disconnect();
        this.socketService.connect();
        event.preventDefault();
        this.socketService.on('validRoom', (isValid: boolean) => {
            this.isRoomCodeValid = isValid;
            this.codeValidated();
        });
        this.socketService.emit('validRoom', this.roomId);
    }

    codeValidated() {
        if (this.isRoomCodeValid) {
            this.roomCheck.nativeElement.innerText = '';
            this.getAllPlayers();
            this.updateAllPlayers();
        } else {
            this.roomCheck.nativeElement.innerText = 'Le code est invalide ou la salle est verrouillée';
            this.socketService.disconnect();
        }
    }

    updateAllPlayers() {
        this.socketService.on('availableAvatars', (availableAvatarNew: { roomId: string; avatars: string[] }) => {
            if (availableAvatarNew.roomId === this.roomId) {
                this.selectedAvatar = '';
                this.availableAvatars = this.availableAvatars.filter(
                    (avatar) => !availableAvatarNew.avatars.some((nonAvailable) => nonAvailable === avatar.name),
                );
            }
        });
    }

    getAllPlayers() {
        this.socketService.on('getPlayers', (players: Player[]) => {
            this.playerList = players;
            this.setAvailableAvatars();
        });
        this.socketService.emit('getPlayers', this.roomId);
    }

    setAvailableAvatars() {
        this.nonAvailableAvatars = this.playerList.map((player: Player) => {
            return {
                name: player.avatar,
                img: player.avatar.split(' ')[1],
            };
        });
        this.availableAvatars = this.availableAvatars.filter(
            (avatar) => !this.nonAvailableAvatars.some((nonAvailable) => nonAvailable.name === avatar.name),
        );
    }

    onSubmit() {
        this.sendDataToGamePage();
        this.socketService.once('isRoomLocked', (isRoomLocked) => {
            if (!isRoomLocked) {
                const errors = this.formChecking();
                if (errors.length > 0) {
                    this.dialog.open(NavigateDialogComponent, {
                        data: {
                            foundErrors: errors,
                            navigateGameSelection: false,
                        },
                    });
                } else {
                    this.joinRoom();
                }
            } else {
                this.dialog.open(NavigateDialogComponent, {
                    data: {
                        foundErrors: ["La partie est verrouillée, voulez vous retourner à la page d'accueil ?"],
                        navigateInitView: true,
                    },
                });
            }
        });
        this.socketService.emit('isRoomLocked', this.roomId);
    }

    joinRoom() {
        this.socketService.on('roomJoined', (data: { roomId: string; playerId: string; playerName: string }) => {
            this.router.navigate([
                '/waitingRoom',
                {
                    roomId: data.roomId,
                    playerId: data.playerId,
                    characterName: data.playerName,
                    selectedAvatar: this.selectedAvatar,
                    isAdmin: false,
                },
            ]);
        });
        this.socketService.emit('joinRoom', {
            roomId: this.roomId,
            playerName: this.characterName.trim(),
            avatar: this.selectedAvatar,
            attributes: this.attributes,
        });
    }
    sendDataToGamePage() {
        this.playerService.setAttributes(this.attributes);
        this.playerService.setCharacterName(this.characterName);
        this.playerService.setSelectedAvatar(this.selectedAvatar);
        this.playerService.setRoomId(this.roomId);
    }
}
