import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
@Component({
    selector: 'app-confirm-deletion-dialog',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
    templateUrl: './confirm-deletion-dialog.component.html',
    styleUrl: './confirm-deletion-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeletionDialogComponent {
    readonly dialogRef = inject(MatDialogRef<ConfirmDeletionDialogComponent>);
    confirmDeletion(): void {
        this.dialogRef.close(true); // true means user confirmed
    }
}
