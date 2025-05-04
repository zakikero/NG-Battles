import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerPanelComponent } from './player-panel.component';
/* eslint-disable */

describe('PlayerPanelComponent', () => {
    let component: PlayerPanelComponent;
    let fixture: ComponentFixture<PlayerPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerPanelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set bonusAttackDice to D6 if bonusDice is attack', () => {
        component.bonusDice = 'attack';
        component.ngOnInit();
        expect(component.bonusAttackDice).toBe('D6');
    });

    it('should set bonusDefenseDice to D6 if bonusDice is defense', () => {
        component.bonusDice = 'defense';
        component.ngOnInit();
        expect(component.bonusDefenseDice).toBe('D6');
    });

    it('should not change bonusAttackDice if bonusDice is not attack', () => {
        component.bonusDice = 'defense';
        component.ngOnInit();
        expect(component.bonusAttackDice).toBe('D4');
    });

    it('should not change bonusDefenseDice if bonusDice is not defense', () => {
        component.bonusDice = 'attack';
        component.ngOnInit();
        expect(component.bonusDefenseDice).toBe('D4');
    });

    it('should not change bonusAttackDice or bonusDefenseDice if bonusDice is neither attack nor defense', () => {
        component.bonusDice = 'none';
        component.ngOnInit();
        expect(component.bonusAttackDice).toBe('D4');
        expect(component.bonusDefenseDice).toBe('D4');
    });
});
