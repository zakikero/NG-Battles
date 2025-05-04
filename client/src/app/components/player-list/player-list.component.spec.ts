import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerListComponent } from './player-list.component';
/* eslint-disable */

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerListComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit deletePlayerAsAdmin event with playerId', () => {
        spyOn(component.deletePlayerAsAdmin, 'emit');
        const playerId = '123';
        component.deletePlayerEmitter(playerId);
        expect(component.deletePlayerAsAdmin.emit).toHaveBeenCalledWith(playerId);
    });
});
