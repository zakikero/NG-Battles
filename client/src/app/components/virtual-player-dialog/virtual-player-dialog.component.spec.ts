import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Avatar } from '@app/interfaces/avatar';
import { SocketService } from '@app/services/socket.service';
import { Player } from '@common/player';
import { VirtualPlayerDialogComponent } from './virtual-player-dialog.component';
/* eslint-disable */

describe('VirtualPlayerDialogComponent', () => {
    let component: VirtualPlayerDialogComponent;
    let fixture: ComponentFixture<VirtualPlayerDialogComponent>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketService', ['once', 'on', 'emit']);
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);

        await TestBed.configureTestingModule({
            imports: [VirtualPlayerDialogComponent],
            providers: [
                { provide: SocketService, useValue: mockSocketService },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: { roomId: 'testRoomId' } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(VirtualPlayerDialogComponent);
        component = fixture.componentInstance;
        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getAllPlayers on ngOnInit', () => {
        spyOn(component, 'getAllPlayers');
        component.ngOnInit();
        expect(component.getAllPlayers).toHaveBeenCalled();
    });

    it('should set playerList in getAllPlayers', () => {
        const players = [{ name: 'Player1' }] as Player[];
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'getPlayers') {
                action(players);
            }
        });
        component.getAllPlayers();
        expect(component.playerList).toEqual(players);
    });

    it('should filter availableAvatars in setAvailableAvatars with avatar length 8', () => {
        component.playerList = [{ avatar: 'Avatar 1' }] as Player[];
        component.availableAvatars = [
            { name: 'Avatar 1', img: './assets/characters/1.png' },
            { name: 'Avatar 2', img: './assets/characters/2.png' },
        ] as Avatar[];
        component.setAvailableAvatars();
        expect(component.availableAvatars).toEqual([{ name: 'Avatar 2', img: './assets/characters/2.png' }]);
    });

    it('should filter availableAvatars in setAvailableAvatars with avatar length 9', () => {
        component.playerList = [{ avatar: 'Avatar 12' }] as Player[];
        component.availableAvatars = [
            { name: 'Avatar 1', img: './assets/characters/1.png' },
            { name: 'Avatar 12', img: './assets/characters/12.png' },
        ] as Avatar[];
        component.setAvailableAvatars();
        expect(component.availableAvatars).toEqual([{ name: 'Avatar 1', img: './assets/characters/1.png' }]);
    });

    it('should set virtualPlayer and virtualAvatar in randomizePlayer', () => {
        const players = [{ name: 'Player1' }] as Player[];
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'getPlayers') {
                action(players);
            }
        });
        spyOn(component, 'setAvailableAvatars');
        spyOn(component, 'createPlayer');
        component.randomizePlayer();
        expect(component.playerList).toEqual(players);
        expect(component.setAvailableAvatars).toHaveBeenCalled();
        expect(component.createPlayer).toHaveBeenCalled();
    });

    it('should create a player with correct attributes in createPlayer with Math.random() < 0.5>', () => {
        component.availableAvatars = [{ name: 'Avatar 1' }] as Avatar[];
        spyOn(component, 'getAvailableName').and.returnValue('Player1');

        spyOn(Math, 'random').and.returnValue(0.2);

        component.createPlayer();
        expect(component.virtualPlayer).toEqual(
            jasmine.objectContaining({
                name: 'Player1',
                avatar: 'Avatar 1',
                attributes: jasmine.any(Object),
            }),
        );
    });

    it('should create a player with correct attributes in createPlayer with Math.random() >= 0.5>', () => {
        component.availableAvatars = [{ name: 'Avatar 1' }] as Avatar[];
        spyOn(component, 'getAvailableName').and.returnValue('Player1');

        spyOn(Math, 'random').and.returnValue(0.8);

        component.createPlayer();
        expect(component.virtualPlayer).toEqual(
            jasmine.objectContaining({
                name: 'Player1',
                avatar: 'Avatar 1',
                attributes: jasmine.any(Object),
            }),
        );
    });

    it('should emit joinRoom event and close dialog in addVirtualPlayer', () => {
        component.virtualPlayer = { name: 'Player1', avatar: 'avatar1', attributes: {} } as Player;
        component.virtualAvatar = { name: 'Avatar 1' } as Avatar;
        mockSocketService.on.and.callFake((event: string, action: (data: any) => void) => {
            if (event === 'roomJoined') {
                action({ roomId: 'testRoomId', playerId: 'testPlayerId', playerName: 'Player1' });
            }
        });
        component.addVirtualPlayer();
        expect(mockSocketService.emit).toHaveBeenCalledWith('joinRoom', jasmine.any(Object));
        expect(dialog.closeAll).toHaveBeenCalled();
    });

    it('should return an available name in getAvailableName', () => {
        component.playerList = [{ name: 'Kiki' }] as Player[];
        const availableName = component.getAvailableName();
        expect(component.availableNames).toContain(availableName);
        expect(availableName).not.toBe('Kiki');
    });

    it('should return an available name in getAvailableName', () => {
        component.playerList = [{ name: 'Kiki' }, { name: 'Kuku' }, { name: 'Koko' }, { name: 'Kaka' }, { name: 'Kiko' }] as Player[];
        const availableName = component.getAvailableName();
        expect(availableName).toBe('DefaultName');
    });
});
