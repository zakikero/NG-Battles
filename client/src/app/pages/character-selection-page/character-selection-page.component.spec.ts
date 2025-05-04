import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { HttpClientService } from '@app/services/http-client.service';
import { CharacterSelectionPageComponent } from './character-selection-page.component';
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('CharacterSelectionPageComponent', () => {
    let component: CharacterSelectionPageComponent;
    let navigateDialogComponent: NavigateDialogComponent;
    let fixture: ComponentFixture<CharacterSelectionPageComponent>;
    let navigateDialogFixture: ComponentFixture<NavigateDialogComponent>;

    const mockActivatedRoute = {
        snapshot: {
            params: {
                id: '123',
            },
        },
    };

    const mockGame = {
        id: '123',
        gameName: 'Game 1',
        gameDescription: 'Description 1',
        gameType: 'Type 1',
        mapSize: '10x10',
        map: [],
        isVisible: true,
        creationDate: new Date().toISOString(),
    };

    const mockData = {
        foundErrors: [],
        navigateGameSelection: false,
    };

    const mockHttpClientService = {
        getGame: jasmine.createSpy('getGame').and.returnValue(Promise.resolve(mockGame)),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterSelectionPageComponent],
            providers: [
                { provide: HttpClientService, useValue: mockHttpClientService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterSelectionPageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        navigateDialogFixture = TestBed.createComponent(NavigateDialogComponent);
        navigateDialogComponent = navigateDialogFixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check if the game is valid to create', async () => {
        const isValid = await component.isGameValidToJoin();
        expect(isValid).toBe(true);
    });

    it('should check if the name is valid', () => {
        component.characterName = 'Name';
        const isValid = component.isNameValid();
        expect(isValid).toBe(true);
    });

    it('should check if the name is invalid (too short)', () => {
        component.characterName = 'Na';
        const isValid = component.isNameValid();
        expect(isValid).toBe(false);
    });

    it('should check if the name is invalid (too long)', () => {
        component.characterName = 'NameNameNameName';
        const isValid = component.isNameValid();
        expect(isValid).toBe(false);
    });

    it('should check if avatar in form is invalid', async () => {
        component.selectedAvatar = null;
        component.isNameValid = () => true;
        const errors = await component.formChecking();
        expect(errors.length).toBe(1);
    });

    it('should check if avatar in form is valid', async () => {
        component.selectedAvatar = { name: 'Avatar 1', img: 'src/assets/characters/1.png' };
        component.isNameValid = jasmine.createSpy('isValidName').and.returnValue(true);
        const errors = await component.formChecking();
        expect(errors.length).toBe(0);
    });

    it('should check if form is invalid (name and avatar)', async () => {
        component.selectedAvatar = null;
        component.isNameValid = jasmine.createSpy('isValidName').and.returnValue(false);
        const errors = await component.formChecking();
        expect(errors.length).toBe(2);
    });

    it('onSubmit should call formChecking', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue([]);
        await component.onSubmit(event);
        expect(component.formChecking).toHaveBeenCalled();
    });

    it('onSubmit should open a dialog if form is invalid (game not found)', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue([]);
        component.isGameValidToJoin = jasmine.createSpy('isGameValidToCreate').and.returnValue(false);
        const open = spyOn((component as any).dialog, 'open');
        await component.onSubmit(event);
        expect(open).toHaveBeenCalled();
    });

    it('onSubmit should open a dialog if form is invalid (errors in form found)', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;
        component.formChecking = jasmine.createSpy('formChecking').and.returnValue(['error']);
        const open = spyOn((component as any).dialog, 'open');
        await component.onSubmit(event);
        expect(open).toHaveBeenCalled();
    });

    it('onSubmit should navigate and emit if game is valid to join and no form checking errors', async () => {
        const event = {
            preventDefault: jasmine.createSpy('preventDefault'),
        } as unknown as Event;

        spyOn(component, 'formChecking').and.returnValue([]);

        mockHttpClientService.getGame.and.returnValue(Promise.resolve(mockGame));
        component.isGameValidToJoin = jasmine.createSpy('isGameValidToJoin').and.returnValue(true);

        const mockRoomJoinedData = { roomId: 'room123', playerId: 'player456', playerName: 'TestPlayer' };
        spyOn(component['socketService'], 'once').and.callFake(<T>(eventSocket: string, callback: (data: T) => void) => {
            if (eventSocket === 'roomJoined') {
                callback(mockRoomJoinedData as unknown as T);
            }
        });

        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');

        await component.onSubmit(event);

        expect(navigateSpy).toHaveBeenCalledWith([
            '/waitingRoom',
            {
                roomId: mockRoomJoinedData.roomId,
                playerId: mockRoomJoinedData.playerId,
                characterName: component.characterName,
                selectedAvatar: component.selectedAvatar?.name,
                isAdmin: true,
            },
        ]);
    });

    it('should inject MAT_DIALOG_DATA', () => {
        expect(navigateDialogComponent.data).toEqual({ foundErrors: [], navigateGameSelection: false });
    });

    it('should receive Avatar from child', () => {
        const avatar = { name: 'Avatar 1', img: '../../Test.png' };
        component.receiveSelectedAvatar(avatar);
        expect(component.selectedAvatar).toEqual(avatar);
    });
});
