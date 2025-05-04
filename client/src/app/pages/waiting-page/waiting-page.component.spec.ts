import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { WaitingPageComponent } from './waiting-page.component';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('WaitingPageComponent', () => {
    let component: WaitingPageComponent;
    let fixture: ComponentFixture<WaitingPageComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['once', 'on', 'emit', 'disconnect']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
            params: of({ roomId: 'testRoom', playerId: 'testPlayer', characterName: 'testName', selectedAvatar: 'Avatar 1', isAdmin: 'true' }),
        });
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            imports: [WaitingPageComponent],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatDialog, useValue: mockDialog },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get players on init', () => {
        const players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ] as any;
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'getPlayers') {
                action(players);
            }
        });

        component.getPlayers();

        expect(mockSocketService.emit).toHaveBeenCalledWith('getPlayers', component.roomId);
        expect(component.players).toEqual(players);
    });

    it('should initialize component and set parameters from route', () => {
        component.ngOnInit();

        expect(component.roomId).toBe('testRoom');
        expect(component.playerId).toBe('testPlayer');
        expect(component.characterName).toBe('testName');
        expect(component.selectedAvatar).toBe('Avatar 1');
        expect(component.isAdmin).toBe(true);
        expect(mockSocketService.emit).toHaveBeenCalledWith('getMaxPlayers', { roomId: 'testRoom' });
    });

    it('should update players on receiving updatePlayers event', () => {
        const players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ] as any;
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'updatePlayers') {
                action(players);
            }
        });

        component.updatePlayers();

        expect(component.players).toEqual(players);
    });

    it('should disconnect on leaveRoom call', () => {
        component.leaveRoom();

        expect(mockSocketService.disconnect).toHaveBeenCalled();
    });

    it('should change lock button text on roomLocked event', () => {
        const lockButton = document.createElement('button');
        lockButton.id = 'lock-btn';
        document.body.appendChild(lockButton);

        component.maxPlayers = 4;
        component.players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
            {
                id: '2',
                name: 'Player 2',
                avatar: 'Avatar 2',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
            {
                id: '3',
                name: 'Player 3',
                avatar: 'Avatar 3',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
            {
                id: '4',
                name: 'Player 4',
                avatar: 'Avatar 4',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ] as any;

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomLocked') {
                action({});
            }
        });

        component.ngOnInit();
        fixture.detectChanges(); // Ensure the component and DOM are fully initialized

        expect(document.getElementById('lock-btn')?.innerHTML).toBe('Déverrouiller');
        // expect(document.getElementById('lock-btn')?.getAttribute('disabled')).toBe('true');
    });

    it('should change lock button text on roomUnlocked event', () => {
        const lockButton = document.createElement('button');
        lockButton.id = 'lock-btn';
        document.body.appendChild(lockButton);

        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomUnlocked') {
                action({});
            }
        });

        component.ngOnInit();
        fixture.detectChanges(); // Ensure the component and DOM are fully initialized

        expect(document.getElementById('lock-btn')?.innerHTML).toBe('Verrouiller');
        expect(document.getElementById('lock-btn')?.getAttribute('disabled')).toBeNull();
    });

    it('should navigate to game page with correct parameters on gameStarted event', () => {
        const gameId = 'testGameId';
        const players = [
            {
                id: '1',
                name: 'Player 1',
                avatar: 'Avatar 1',
                attributes: { health: '4', speed: '4', attack: '4', defense: '4', dice: 'attack' },
                isAdmin: false,
            },
        ] as any;

        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'gameStarted') {
                action({ gameId, players });
            }
        });

        component.playerId = 'testPlayer';
        component.roomId = 'testRoom';
        component.isAdmin = true;

        component.gameStartedListener();

        expect(mockRouter.navigate).toHaveBeenCalledWith([
            '/game',
            {
                playerId: 'testPlayer',
                gameId,
                roomId: 'testRoom',
                isAdmin: true,
            },
        ]);
    });

    it('should open kicked dialog on kicked event', () => {
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'kicked') {
                action({});
            }
        });

        component.ngOnInit();

        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should navigate home on roomLeft event', () => {
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomLeft') {
                action({});
            }
        });

        component.ngOnInit();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should set max players on maxPlayers event', () => {
        const maxPlayers = 4;
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'maxPlayers') {
                action(maxPlayers);
            }
        });

        component.ngOnInit();

        expect(component.maxPlayers).toBe(maxPlayers);
    });

    it('should lock room on lockRoom call', () => {
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(false);
            }
        });

        component.lockRoom();

        expect(mockSocketService.emit).toHaveBeenCalledWith('isRoomLocked', component.roomId);
        expect(mockSocketService.emit).toHaveBeenCalledWith('lockRoom', component.roomId);
    });

    it('should unlock room on lockRoom call if already locked', () => {
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'isRoomLocked') {
                action(true);
            }
        });

        component.lockRoom();

        expect(mockSocketService.emit).toHaveBeenCalledWith('isRoomLocked', component.roomId);
        expect(mockSocketService.emit).toHaveBeenCalledWith('unlockRoom', component.roomId);
    });

    it('should delete player on deletePlayer call', () => {
        const kickedPlayerId = 'testPlayerId';

        component.deletePlayer(kickedPlayerId);

        expect(mockSocketService.emit).toHaveBeenCalledWith('kickPlayer', { roomId: component.roomId, playerId: kickedPlayerId });
    });

    it('should start game on startGame call', () => {
        component.startGame();

        expect(mockSocketService.emit).toHaveBeenCalledWith('startGame', { roomId: component.roomId });
    });

    it('should open dialog on startError event', () => {
        const error = 'Test error';
        mockSocketService.once.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'startError') {
                action(error);
            }
        });

        component.startGame();

        expect(mockDialog.open).toHaveBeenCalled();
    });
});
