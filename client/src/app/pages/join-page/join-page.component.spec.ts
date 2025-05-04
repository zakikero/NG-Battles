import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NavigateDialogComponent } from '@app/components/navigate-dialog/navigate-dialog.component';
import { Avatar } from '@app/interfaces/avatar';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerAttribute } from '@common/player';
import { JoinPageComponent } from './join-page.component';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('JoinPageComponent', () => {
    let component: JoinPageComponent;
    let fixture: ComponentFixture<JoinPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['isSocketAlive', 'connect', 'disconnect', 'on', 'emit', 'once']);

        const activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: () => 'test-id',
                },
            },
        };

        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
            providers: [
                { provide: SocketService, useValue: mockSocketService }, // Use the mock service
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('formChecking method returns an error associated to avatar selection', () => {
        component.selectedAvatar = '';
        expect(component.formChecking().length).toBeGreaterThan(0);
    });

    it('formChecking method returns an error associated to name', () => {
        component.isNameValid = jasmine.createSpy('isNameValid').and.returnValue(false);
        expect(component.formChecking().length).toBeGreaterThan(0);
    });

    it('formChecking method returns no errors', () => {
        component.selectedAvatar = 'Avatar 1';
        component.isNameValid = jasmine.createSpy('isNameValid').and.returnValue(true);
        expect(component.formChecking().length).toEqual(0);
    });

    it('should receive selected avatar from child', () => {
        const selectedAvatarFromChild = { name: 'Avatar 1', img: '../../Test.png' };
        component.receiveSelectedAvatar(selectedAvatarFromChild);

        expect(component.selectedAvatar).toEqual(selectedAvatarFromChild.name);
    });

    it('should receive attributes from child', () => {
        const attributesFromChild: PlayerAttribute = {
            health: 10,
            speed: 8,
            attack: 7,
            defense: 5,
            dice: '6',
        };
        component.receiveAttributes(attributesFromChild);

        expect(component.attributes).toEqual(attributesFromChild);
    });

    it('should disconnect if already connected on submit code', () => {
        mockSocketService.isSocketAlive.and.returnValue(true);

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.disconnect).toHaveBeenCalled();
    });

    it('should connect if not already connected on submit code', () => {
        mockSocketService.isSocketAlive.and.returnValue(false);

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.connect).toHaveBeenCalled();
    });
    it('should validate room code and set isRoomCodeValid to true', () => {
        mockSocketService.isSocketAlive.and.returnValue(false);
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'validRoom') {
                action(true); // Simulating a valid room code
            }
        });

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.connect).toHaveBeenCalled();
        expect(component.isRoomCodeValid).toBeTrue();
    });

    it('should validate room code and set isRoomCodeValid to false', () => {
        mockSocketService.isSocketAlive.and.returnValue(false);
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'validRoom') {
                action(false); // Simulating an invalid room code
            }
        });

        component.onSubmitCode(new Event('click'));

        expect(mockSocketService.connect).toHaveBeenCalled();
        expect(component.isRoomCodeValid).toBeFalse();
    });

    it('should return an available name in getAvailableName when avatar length <= 8', () => {
        const avatars = [
            { name: 'Avatar 1', img: './assets/characters/1.png' },
            { name: 'Avatar 2', img: './assets/characters/2.png' },
            { name: 'Avatar 3', img: './assets/characters/5.png' },
        ] as Avatar[];
        component.availableAvatars = avatars;

        component.playerList = [{ avatar: 'Avatar 2' }, { avatar: 'Avatar 3' }] as Player[];
        component.setAvailableAvatars();
        expect(component.availableAvatars).toEqual([{ name: 'Avatar 1', img: './assets/characters/1.png' }] as Avatar[]);
    });

    it('should return an available name in getAvailableName when avatar length > 8', () => {
        const avatars = [
            { name: 'Avatar 1', img: './assets/characters/1.png' },
            { name: 'Avatar 2', img: './assets/characters/2.png' },
            { name: 'Avatar 12', img: './assets/characters/12.png' },
        ] as Avatar[];
        component.availableAvatars = avatars;

        component.playerList = [{ avatar: 'Avatar 2' }, { avatar: 'Avatar 12' }] as Player[];
        component.setAvailableAvatars();
        expect(component.availableAvatars).toEqual([{ name: 'Avatar 1', img: './assets/characters/1.png' }] as Avatar[]);
    });

    it('should update available avatars on receiving availableAvatars event', () => {
        const availableAvatarNew = { roomId: 'testRoom', avatars: ['Avatar 1', 'Avatar 2'] };
        component.roomId = 'testRoom';
        component.availableAvatars = [
            { name: 'Avatar 1', img: '../../../assets/characters/1.png' },
            { name: 'Avatar 2', img: '../../../assets/characters/2.png' },
            { name: 'Avatar 3', img: '../../../assets/characters/3.png' },
        ];

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'availableAvatars') {
                action(availableAvatarNew);
            }
        });

        component.updateAllPlayers();

        expect(component.availableAvatars).toEqual([{ name: 'Avatar 3', img: '../../../assets/characters/3.png' }]);
    });

    it('should set player list on receiving getPlayers event', () => {
        const players: Player[] = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
                isActive: true,
                abandoned: false,
                wins: 0,
            },
            {
                id: '2',
                name: 'Player 2',
                avatar: 'Avatar 2',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
                isActive: true,
                abandoned: false,
                wins: 0,
            },
        ] as any;

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'getPlayers') {
                action(players);
            }
        });

        component.getAllPlayers();

        expect(component.playerList).toEqual(players);
    });

    it('should navigate to waiting room on roomJoined event', () => {
        const navigateSpy = spyOn(component['router'], 'navigate');
        const roomData = { roomId: 'testRoom', playerId: 'testPlayer', playerName: 'testName' };

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomJoined') {
                action(roomData);
            }
        });

        component.joinRoom();

        expect(navigateSpy).toHaveBeenCalledWith([
            '/waitingRoom',
            {
                roomId: roomData.roomId,
                playerId: roomData.playerId,
                characterName: roomData.playerName,
                selectedAvatar: component.selectedAvatar,
                isAdmin: false,
            },
        ]);
    });

    it('should open dialog with errors if form is invalid on submit', () => {
        const dialogSpy = spyOn(component['dialog'], 'open');
        component.selectedAvatar = '';
        component.characterName = '';

        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(false);
            }
        });

        component.onSubmit();

        expect(dialogSpy).toHaveBeenCalledWith(NavigateDialogComponent, {
            data: {
                foundErrors: [
                    '- Veuillez sélectionner un avatar avant de continuer',
                    '- Veuillez mettre un nom pour le personne entre 3 et 15 charactères',
                ],
                navigateGameSelection: false,
            },
        });
    });

    it('should join room if form is valid and room is not locked', () => {
        const joinRoomSpy = spyOn(component, 'joinRoom');
        component.selectedAvatar = 'Avatar 1';
        component.characterName = 'ValidName';
        component.isNameValid = jasmine.createSpy('isNameValid').and.returnValue(true);

        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(false);
            }
        });

        component.onSubmit();

        expect(mockSocketService.once).toHaveBeenCalledWith('isRoomLocked', jasmine.any(Function));
        expect(joinRoomSpy).toHaveBeenCalled();
    });

    it('should open dialog if room is locked on submit', () => {
        const dialogSpy = spyOn(component['dialog'], 'open');

        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(true);
            }
        });

        component.onSubmit();

        expect(mockSocketService.once).toHaveBeenCalledWith('isRoomLocked', jasmine.any(Function));
        expect(dialogSpy).toHaveBeenCalledWith(NavigateDialogComponent, {
            data: {
                foundErrors: ["La partie est verrouillée, voulez vous retourner à la page d'accueil ?"],
                navigateInitView: true,
            },
        });
    });

    it('should return true when characterName length is within the valid range', () => {
        component.characterName = 'ValidName';
        expect(component.isNameValid()).toBeTrue();
    });

    it('should return false when characterName length is less than 3', () => {
        component.characterName = 'Na';
        expect(component.isNameValid()).toBeFalse();
    });
});
