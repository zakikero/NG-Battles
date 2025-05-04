import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { TileBasicComponent } from '@app/components/tile-basic/tile-basic.component';
import { ToolbarComponent } from './toolbar.component';
/* eslint-disable */

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToolbarComponent, CommonModule, MatGridListModule, TileBasicComponent, DragDropModule, MatTooltipModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit selectTileTypeEvent when selectTileType is called', () => {
        spyOn(component.selectTileTypeEvent, 'emit');
        const tileType = 'testTileType';
        component.selectTileType(tileType);
        expect(component.selectTileTypeEvent.emit).toHaveBeenCalledWith(tileType);
    });

    it('should prevent drop event', () => {
        const event = new DragEvent('drop');
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        component.preventDrop(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should render the correct number of app-tile-basic components', () => {
        fixture.detectChanges();
        const EXPECTED_RENDERED_TILES = 4;
        const tileBasicElements = fixture.debugElement.queryAll(By.css('app-tile-basic'));
        expect(tileBasicElements.length).toBe(EXPECTED_RENDERED_TILES);
    });

    it('should render the correct number of mat-grid-tile elements', () => {
        fixture.detectChanges();
        const EXPECTED_RENDERED_TILES = 4;
        const itemElements = fixture.debugElement.queryAll(By.css('mat-grid-tile'));
        expect(itemElements.length).toBe(EXPECTED_RENDERED_TILES);
    });

    it('should call selectTileType with correct argument on click for each mat-grid-tile', async () => {
        spyOn(component, 'selectTileType');

        const tileIds = ['wall', 'door', 'water', 'ice'];

        await fixture.whenStable();
        fixture.detectChanges();

        tileIds.forEach((id) => {
            const tileElement = fixture.debugElement.query(By.css(`#${id}`));
            if (tileElement) {
                tileElement.triggerEventHandler('click', {});
                expect(component.selectTileType).toHaveBeenCalledWith(id);
            } else {
                fail(`Tile element with id ${id} not found`);
            }
        });
    });
});
