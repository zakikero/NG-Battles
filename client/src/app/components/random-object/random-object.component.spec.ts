import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomObjectComponent } from './random-object.component';
/* eslint-disable */

describe('RandomObjectComponent', () => {
    let component: RandomObjectComponent;
    let fixture: ComponentFixture<RandomObjectComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RandomObjectComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RandomObjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
