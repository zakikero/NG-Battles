import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { SNACKBAR_DURATION } from '@app/components/admin-item/constant';
import { ConfirmDeletionDialogComponent } from '@app/components/confirm-deletion-dialog/confirm-deletion-dialog.component';
import { MapPreviewComponent } from '@app/components/map-preview/map-preview.component';
import { HttpClientService } from '@app/services/http-client.service';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-admin-item',
    standalone: true,
    imports: [MapPreviewComponent, MatCardModule, MatButtonModule, MatTooltipModule, RouterLink, MatIconModule],
    templateUrl: './admin-item.component.html',
    styleUrl: './admin-item.component.scss',
})
export class AdminItemComponent implements OnInit {
    @Input() game: GameStructure;
    @Output() editGameEvent = new EventEmitter<string>();
    mapSize: number;

    constructor(
        private http: HttpClientService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private el: ElementRef,
    ) {}

    ngOnInit() {
        this.mapSize = parseInt(this.game.mapSize, 10);
    }

    exportGame() {
        // no-unused-vars is disabled because we need to remove the isVisible property from the game object
        // eslint-disable-next-line no-unused-vars
        const { isVisible: _, ...gameWithoutVisibility } = this.game;
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gameWithoutVisibility));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `${this.game.gameName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    invertVisibility() {
        this.http.changeVisibility(this.game.id).subscribe(() => {
            this.game.isVisible = !this.game.isVisible;
        });
    }

    deleteGame(): void {
        const dialogRef = this.dialog.open(ConfirmDeletionDialogComponent);
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.http.getGame(this.game.id).then((game) => {
                    if (!game) {
                        this.snackbar.open("Le jeu n'existe pas", 'Fermer', {
                            duration: SNACKBAR_DURATION,
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                        });
                        this.el.nativeElement.remove();
                    } else {
                        this.http.deleteGame(this.game.id).subscribe(() => {
                            this.snackbar.open('Le jeu a été supprimé', 'Fermer', {
                                duration: SNACKBAR_DURATION,
                                horizontalPosition: 'right',
                                verticalPosition: 'top',
                            });
                        });
                        this.el.nativeElement.remove();
                    }
                });
            }
        });
    }

    editGame() {
        this.editGameEvent.emit(this.game.id);
    }
}
