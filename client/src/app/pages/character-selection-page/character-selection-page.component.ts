import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AttributeSelectionComponent } from '@app/components/attribute-selection/attribute-selection.component';
import { AvatarSliderComponent } from '@app/components/avatar-slider/avatar-slider.component';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { Avatar } from '@app/interfaces/avatar';
import { HttpClientService } from '@app/services/http-client.service';
import { SocketService } from '@app/services/socket.service';
import { PlayerAttribute } from '@common/player';

@Component({
    selector: 'app-character-selection-page',
    standalone: true,
    imports: [NgFor, FormsModule, MatButtonModule, MatTooltipModule, RouterLink, AttributeSelectionComponent, AvatarSliderComponent],
    templateUrl: './character-selection-page.component.html',
    styleUrl: './character-selection-page.component.scss',
})
export class CharacterSelectionPageComponent {
    dialog = inject(MatDialog);

    selectedAvatar: Avatar | null = null;
    characterName: string = '';
    attributes: PlayerAttribute;

    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly MIN_NAME_LENGTH: number = 3;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly MAX_NAME_LENGTH: number = 15;

    constructor(
        private router: Router,
        private http: HttpClientService,
        private route: ActivatedRoute,
        private socketService: SocketService,
    ) {}

    receiveSelectedAvatar(selectedAvatarFromChild: Avatar) {
        this.selectedAvatar = selectedAvatarFromChild;
    }

    receiveAttributes(attributesFromChild: PlayerAttribute) {
        this.attributes = attributesFromChild;
    }

    formChecking(): string[] {
        const errors: string[] = [];
        if (!this.selectedAvatar) errors.push('- Veuillez sélectionner un avatar avant de continuer');
        if (!this.isNameValid()) errors.push('- Veuillez mettre un nom pour le personne entre 3 et 15 charactères');

        return errors;
    }

    async isGameValidToJoin(): Promise<boolean> {
        return (await this.http.getGame(this.route.snapshot.params.id)) !== null;
    }

    isNameValid(): boolean {
        return (
            this.characterName.length >= this.MIN_NAME_LENGTH && this.characterName.length <= this.MAX_NAME_LENGTH && this.characterName.trim() !== ''
        );
    }

    async onSubmit(event: Event) {
        event.preventDefault();

        const errors = this.formChecking();

        if (!(await this.isGameValidToJoin())) {
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: ["La partie n'existe pas -> VOUS SEREZ REDIRIGÉ VERS LA PAGE DE SÉLECTION DE PARTIE"],
                    navigateGameSelection: true,
                },
            });
        } else if (errors.length > 0) {
            this.dialog.open(NavigateDialogComponent, {
                data: {
                    foundErrors: errors,
                    navigateGameSelection: false,
                },
            });
        } else {
            const submitButton = document.getElementById('submit-btn');
            submitButton?.setAttribute('disabled', 'true');
            let navData;
            this.socketService.connect();
            this.socketService.once('roomJoined', async (data: { roomId: string; playerId: string; playerName: string }) => {
                navData = {
                    roomId: data.roomId,
                    playerId: data.playerId,
                    characterName: this.characterName, // shouldn't it be data.playerName instead
                    selectedAvatar: this.selectedAvatar?.name,
                    isAdmin: true,
                };
                this.router.navigate(['/waitingRoom', navData]);
            });
            this.socketService.emit('createRoom', {
                gameId: this.route.snapshot.params.id,
                playerName: this.characterName.trim(),
                avatar: this.selectedAvatar?.name,
                attributes: this.attributes,
            });
        }
    }
}
