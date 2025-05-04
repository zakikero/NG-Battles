import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { EditHeaderDialogComponent } from '@app/components/edit-header-dialog/edit-header-dialog.component';
import { EditMapComponent } from '@app/components/edit-map/edit-map.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ToolbarComponent } from '@app/components/toolbar/toolbar.component';
import { EditGameService } from '@app/services/edit-game.service';
import { MapEditService } from '@app/services/map-edit.service';
@Component({
    selector: 'app-edit-page',
    standalone: true,
    imports: [
        EditHeaderDialogComponent,
        EditMapComponent,
        ToolbarComponent,
        SidebarComponent,
        MatButtonModule,
        MatIcon,
        MatMenuModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        RouterLink,
    ],
    templateUrl: './edit-page.component.html',
    styleUrl: './edit-page.component.scss',
})
export class EditPageComponent implements OnInit {
    mapEditService = inject(MapEditService);
    editGameService = inject(EditGameService);
    constructor(public dialog: MatDialog) {}

    ngOnInit() {
        this.editGameService.initializeEditPage();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(EditHeaderDialogComponent, {
            data: this.editGameService.getGameDetails(),
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.editGameService.setGameDetails(result.gameNameInput, result.gameDescriptionInput);
            }
        });
    }
}
