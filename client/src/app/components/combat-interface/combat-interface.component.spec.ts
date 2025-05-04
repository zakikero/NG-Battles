import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombatInterfaceComponent } from './combat-interface.component';
/* eslint-disable */

describe('CombatInterfaceComponent', () => {
    let component: CombatInterfaceComponent;
    let fixture: ComponentFixture<CombatInterfaceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CombatInterfaceComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CombatInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update attackerDiceInfo on changes', () => {
        component.attackerDiceResult = 5;
        component.ngOnChanges();
        expect(component.attackerDiceInfo).toBe('Résultats des dés attaquant : 5');
    });

    it('should update defenderDiceInfo on changes', () => {
        component.defenderDiceResult = 3;
        component.ngOnChanges();
        expect(component.defenderDiceInfo).toBe('Résultats des dés défenseur : 3');
    });

    it('should update escapeChanceInfo on changes', () => {
        component.escapeChance = 2;
        component.ngOnChanges();
        expect(component.escapeChanceInfo).toBe("Nombre d'évasion : 2");
    });

    it('should emit "attack" event on attack', () => {
        spyOn(component.selectCombatActionEvent, 'emit');
        component.attack();
        expect(component.selectCombatActionEvent.emit).toHaveBeenCalledWith('attack');
    });

    it('should emit "escape" event on escape', () => {
        spyOn(component.selectCombatActionEvent, 'emit');
        component.escape();
        expect(component.selectCombatActionEvent.emit).toHaveBeenCalledWith('escape');
    });

    it('should set escapeChanceInfo to "--" when escapeChance is -1', () => {
        component.escapeChance = -1;
        component.ngOnChanges();
        expect(component.escapeChanceInfo).toBe("Nombre d'évasion : --");
    });
});
