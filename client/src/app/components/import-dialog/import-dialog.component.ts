import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientService } from '@app/services/http-client.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-import-dialog',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './import-dialog.component.html',
    styleUrl: './import-dialog.component.scss',
})
export class ImportDialogComponent {
    @Output() gameSaved = new EventEmitter<void>();

    idGenerationService = inject(IDGenerationService);
    dialog = inject(MatDialog);
    http = inject(HttpClientService);
    input: HTMLInputElement;
    isNameError = false;
    gameName: string;
    fileName: string;
    game: GameStructure;
    reader: FileReader;

    loadImportedGame(importedData: Partial<GameStructure>) {
        const game: GameStructure = {
            id: this.idGenerationService.generateID(),
            gameName: importedData.gameName,
            gameDescription: importedData.gameDescription,
            mapSize: importedData.mapSize,
            map: importedData.map,
            gameType: importedData.gameType,
            isVisible: false,
            creationDate: importedData.creationDate,
            lastModified: importedData.lastModified,
        } as GameStructure;

        this.saveGame(game);
    }

    async saveGame(game: GameStructure) {
        this.http.sendGame(game).subscribe({
            next: () => {
                this.dialog.closeAll();
                this.gameSaved.emit(); // Emit the event
            },
            error: (e: HttpErrorResponse) => {
                const errorp = document.getElementById('errors') as HTMLParagraphElement;
                errorp.textContent = e.error.errors.join('\n');
                if (e.error.errors.some((error: string) => error.includes('nom'))) {
                    this.isNameError = true;
                    this.game = game;
                }
            },
        });
    }

    async importGame(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target && target.files) {
            const file = target.files[0];
            if (file) {
                this.fileName = file.name;
                this.input = target;
            }
        }
    }

    readData() {
        if (this.input.files && this.input.files.length > 0) {
            this.reader = new FileReader();
            let importedData: Partial<GameStructure> = {};

            this.reader.onload = () => {
                importedData = JSON.parse(this.reader.result as string);
                this.loadImportedGame(importedData);
            };

            this.reader.readAsText(this.input.files[0]);
        }
    }

    async onSubmit() {
        if (this.isNameError) {
            const errorp = document.getElementById('errors') as HTMLParagraphElement;
            errorp.textContent = '';
            this.isNameError = false;
            this.game.gameName = this.gameName;
            await this.saveGame(this.game);
        }
    }
}
