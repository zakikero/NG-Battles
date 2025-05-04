import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
    selector: 'app-kicked-dialog',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
    templateUrl: './kicked-dialog.component.html',
    styleUrl: './kicked-dialog.component.scss',
})
export class KickedDialogComponent {
    data = inject(MAT_DIALOG_DATA);
}
