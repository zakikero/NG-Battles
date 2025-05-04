import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { ItemTypes } from '@common/tile-types';

export interface DialogData {
    itemTypes: ItemTypes[];
}

@Component({
    selector: 'app-choose-item-modal',
    templateUrl: './choose-item-modal.component.html',
    styleUrls: ['./choose-item-modal.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatGridListModule, CommonModule],
})
export class ChooseItemModalComponent {
    selectedItem: ItemTypes | undefined;

    constructor(
        public dialogRef: MatDialogRef<ChooseItemModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    selectItem(item: ItemTypes) {
        this.selectedItem = item;
    }

    onConfirm() {
        this.dialogRef.close(this.selectedItem);
    }
}
