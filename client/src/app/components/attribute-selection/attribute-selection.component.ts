import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerAttribute } from '@common/player';
import { DEFAULT_ATTRIBUTE_VALUE, DEFAULT_ATTRIBUTE_VALUE_SELECTED, DICE4, DICE6 } from './constants';

@Component({
    selector: 'app-attribute-selection',
    standalone: true,
    imports: [MatTooltipModule],
    templateUrl: './attribute-selection.component.html',
    styleUrls: ['./attribute-selection.component.scss'],
})
export class AttributeSelectionComponent implements OnInit {
    @Output() attributesEmitter = new EventEmitter<PlayerAttribute>();

    life: number;
    speed: number;
    attack: number;
    defense: number;
    selectedDice: { attack: number; defense: number };

    constructor() {
        this.life = DEFAULT_ATTRIBUTE_VALUE_SELECTED;
        this.speed = DEFAULT_ATTRIBUTE_VALUE;
        this.attack = DEFAULT_ATTRIBUTE_VALUE;
        this.defense = DEFAULT_ATTRIBUTE_VALUE;
        this.selectedDice = { attack: DICE6, defense: DICE4 };
    }

    ngOnInit() {
        this.changeAttributes();
    }

    addBonus(attribute: 'life' | 'speed'): void {
        if (attribute === 'life' && this.life === DEFAULT_ATTRIBUTE_VALUE) {
            this.life += 2;
            this.speed -= 2;
        } else if (attribute === 'speed' && this.speed === DEFAULT_ATTRIBUTE_VALUE) {
            this.speed += 2;
            this.life -= 2;
        }
        this.changeAttributes();
    }

    assignDice(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const selectedValue = target.value;
        if (selectedValue === 'attack') {
            this.selectedDice.attack = DICE6;
            this.selectedDice.defense = DICE4;
        } else if (selectedValue === 'defense') {
            this.selectedDice.attack = DICE4;
            this.selectedDice.defense = DICE6;
        }
        this.changeAttributes();
    }

    changeAttributes() {
        const attributes: PlayerAttribute = {
            health: this.life,
            speed: this.speed,
            attack: this.attack,
            defense: this.defense,
            dice: this.selectedDice.attack === DEFAULT_ATTRIBUTE_VALUE_SELECTED ? 'attack' : 'defense',
        };
        this.attributesEmitter.emit(attributes);
    }
}
