import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { CurrentMode } from '@app/data-structure/editViewSelectedMode';
@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [CommonModule, MatGridListModule, TileBasicComponent, DragDropModule, MatTooltipModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    @Output() selectTileTypeEvent = new EventEmitter<string>();
    @Input() selectedTileTypeToolbar: string;
    @Input() selectedModeToolbar: CurrentMode;
    validCurrentMode: CurrentMode = CurrentMode.TileTool; // Used to compare the valid mode in the template
    selectTileType(tileType: string) {
        this.selectTileTypeEvent.emit(tileType);
    }

    // Prevent the dropping of object on the toolbar's tiles
    preventDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
}
