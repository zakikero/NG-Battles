import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagObjectComponent } from './flag-object.component';
/* eslint-disable */

describe('FlagObjectComponent', () => {
    let component: FlagObjectComponent;
    let fixture: ComponentFixture<FlagObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FlagObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FlagObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
