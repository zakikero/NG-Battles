import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DEFAULT_STARTING_COUNTER_TWO } from '@app/services/constants';
import { DragDropService } from 'src/app/services/drag-drop.service';
import { SidebarComponent } from './sidebar.component';
/* eslint-disable */

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let dragDropService: DragDropService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatGridListModule, MatTooltipModule, MatBadgeModule],
            providers: [DragDropService],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        dragDropService = TestBed.inject(DragDropService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit selectItemTypeEvent when startDragging is called', () => {
        spyOn(component.selectItemTypeEvent, 'emit');
        spyOn(dragDropService, 'setDraggedObject');
        const object = 'testObject';
        component.startDragging(object);
        expect(dragDropService.setDraggedObject).toHaveBeenCalledWith(object);
        expect(component.selectItemTypeEvent.emit).toHaveBeenCalledWith(object);
    });

    it('should set isDragging to false initially', () => {
        expect(component.isDragging).toBeFalse();
    });

    it('should call dragDropService.setDraggedObject with correct argument', () => {
        spyOn(dragDropService, 'setDraggedObject');
        const object = 'testObject';
        component.startDragging(object);

        expect(dragDropService.setDraggedObject).toHaveBeenCalledWith(object);
    });

    it('should have correct initial values for badges', () => {
        expect(component.dragDropService.itemCounter).toEqual(DEFAULT_STARTING_COUNTER_TWO);
        expect(component.dragDropService.startingPointCounter).toEqual(DEFAULT_STARTING_COUNTER_TWO);
    });
});
