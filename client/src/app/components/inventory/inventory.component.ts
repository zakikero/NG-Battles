import { Component, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ItemTypes } from '@common/tile-types';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [MatGridListModule],
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
})
export class InventoryComponent {
    @Input() items?: ItemTypes[];

    findItemImage(itemType: string): string | undefined {
        if (itemType) {
            return `./assets/${itemType}_transparent.png`;
        } else {
            return undefined;
        }
    }
}
