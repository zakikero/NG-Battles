import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-player-panel',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './player-panel.component.html',
    styleUrl: './player-panel.component.scss',
})
export class PlayerPanelComponent implements OnInit {
    @Input() playerName: string;
    @Input() lifePoints?: number;
    @Input() speed?: number;
    @Input() attack?: number;
    @Input() defense?: number;
    @Input() movementPoints: number;
    @Input() nActions: number;
    @Input() selectedAvatar: string;
    @Input() bonusDice: string;

    bonusAttackDice: string = 'D4';
    bonusDefenseDice: string = 'D4';

    ngOnInit() {
        if (this.bonusDice === 'attack') this.bonusAttackDice = 'D6';
        else if (this.bonusDice === 'defense') this.bonusDefenseDice = 'D6';
    }
}
