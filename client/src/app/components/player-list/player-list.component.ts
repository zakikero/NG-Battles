import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '@common/player';

@Component({
    selector: 'app-player-list',
    standalone: true,
    imports: [],
    templateUrl: './player-list.component.html',
    styleUrl: './player-list.component.scss',
})
export class PlayerListComponent {
    @Input() playerList: Player[] = []; // Initialize with an empty array
    @Input() isUserAdmin: boolean;
    @Output() deletePlayerAsAdmin = new EventEmitter<string>();

    deletePlayerEmitter(playerId: string) {
        this.deletePlayerAsAdmin.emit(playerId);
    }
}
