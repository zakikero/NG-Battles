import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AdminItemComponent } from '@app/components/admin-item/admin-item.component';
import { ImportDialogComponent } from '@app/components/import-dialog/import-dialog.component';
import { EditGameService } from '@app/services/edit-game.service';
import { HttpClientService } from '@app/services/http-client.service';
import { IDGenerationService } from '@app/services/idgeneration.service';
import { GameStructure } from '@common/game-structure';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [AdminItemComponent, RouterLink, RouterOutlet, MatButtonModule, MatGridListModule, MatCardModule],
    templateUrl: './admin-page.component.html',
    styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
    games: GameStructure[];
    editGameService = inject(EditGameService);
    idGenerationService = inject(IDGenerationService);
    dialog = inject(MatDialog);

    constructor(
        private http: HttpClientService,
        private router: Router,
    ) {}

    async ngOnInit() {
        this.games = await this.http.getAllGames();
    }

    loadGames() {
        this.http.getAllGames().then((data: GameStructure[]) => {
            this.games = data;
        });
    }

    editGame(gameId: string) {
        this.router.navigate(['/edit'], { queryParams: { gameId } });
    }

    openImportDialog() {
        const dialogRef = this.dialog.open(ImportDialogComponent);
        dialogRef.componentInstance.gameSaved.subscribe(() => {
            this.loadGames();
        });
    }
}
