import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-combat-interface',
    standalone: true,
    imports: [MatProgressBarModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
    templateUrl: './combat-interface.component.html',
    styleUrls: ['./combat-interface.component.scss'],
})
export class CombatInterfaceComponent implements OnChanges {
    @Input() attackerDiceResult: number;
    @Input() defenderDiceResult: number;
    @Input() isActivePlayer: boolean;
    @Input() currentAtttack: number;
    @Input() currentDefense: number;
    @Input() attackSuccessful: boolean;
    @Input() escapeChance: number;
    @Output() selectCombatActionEvent = new EventEmitter<string>();

    combatInfo: string = '';
    attackerDiceInfo: string = '';
    defenderDiceInfo: string = '';
    escapeChanceInfo: string = '';

    ngOnChanges() {
        this.attackerDiceInfo = 'Résultats des dés attaquant : ' + this.attackerDiceResult;
        this.defenderDiceInfo = 'Résultats des dés défenseur : ' + this.defenderDiceResult;
        this.escapeChanceInfo = "Nombre d'évasion : " + (this.escapeChance === -1 ? '--' : this.escapeChance);
    }

    attack() {
        this.selectCombatActionEvent.emit('attack');
    }

    escape() {
        this.selectCombatActionEvent.emit('escape');
    }
}
