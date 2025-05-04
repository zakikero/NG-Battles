import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [provideRouter([]), Location, Router],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('submitChoice should change the location', () => {
        const location: Location = TestBed.inject(Location);

        spyOn(router, 'navigate').and.callFake(async (path: string[]) => {
            location.go(path[0]);
            return Promise.resolve(true);
        });

        component.submitChoice();

        expect(location.path()).toBe('/edit');
    });
});
