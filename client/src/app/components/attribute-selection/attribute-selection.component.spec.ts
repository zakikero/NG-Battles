import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeSelectionComponent } from './attribute-selection.component';
/* eslint-disable */

describe('AttributeSelectionComponent', () => {
    let component: AttributeSelectionComponent;
    let fixture: ComponentFixture<AttributeSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AttributeSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AttributeSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add bonus speed', () => {
        component.addBonus('speed');
        // eslint-disable-next-line
        expect(component.speed).toBe(6);
    });

    it('should add bonus life', () => {
        component.life = 4;
        component.addBonus('life');
        // eslint-disable-next-line
        expect(component.life).toBe(6);
    });

    it('should assign dice to attack', () => {
        const event = {
            target: {
                value: 'attack',
            },
        } as unknown as Event;
        component.assignDice(event);
        // eslint-disable-next-line
        expect(component.selectedDice.attack).toBe(6);
        // eslint-disable-next-line
        expect(component.selectedDice.defense).toBe(4);
    });

    it('should assign dice', () => {
        const event = {
            target: {
                value: 'defense',
            },
        } as unknown as Event;
        component.assignDice(event);
        // eslint-disable-next-line
        expect(component.selectedDice.attack).toBe(4);
        // eslint-disable-next-line
        expect(component.selectedDice.defense).toBe(6);
    });
});
