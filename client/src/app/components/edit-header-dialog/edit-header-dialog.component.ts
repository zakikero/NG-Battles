import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DEFAULT_CHAR_COUNT } from '@app/components/edit-header-dialog/constant';

export interface DialogData {
    gameNameInput: string;
    gameDescriptionInput: string;
}

@Component({
    selector: 'app-edit-header-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
    ],
    templateUrl: './edit-header-dialog.component.html',
    styleUrl: './edit-header-dialog.component.scss',
})
export class EditHeaderDialogComponent {
    charCount: number;

    constructor(
        public dialogRef: MatDialogRef<EditHeaderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {
        this.charCount = this.updateCharCount();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(this.data);
    }

    updateCharCount() {
        return (this.charCount = this.data.gameDescriptionInput?.length || DEFAULT_CHAR_COUNT);
    }
}
