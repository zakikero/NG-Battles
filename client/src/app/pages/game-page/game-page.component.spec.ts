import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ChooseItemModalComponent } from '@app/components/choose-item-modal/choose-item-modal.component';
import {
    MOCK_PLAYER,
    MOCK_PLAYER_COORD,
    MOCK_PLAYER_COORDS,
    MOCK_PLAYER_TWO,
    MOCKGAME,
    TEST_AVAILABLE_TILES,
    TEST_SHORTEST_PATH,
} from '@app/services/constants';
import { GameControllerService } from '@app/services/game-controller.service';
import { HttpClientService } from '@app/services/http-client.service';
import { MapGameService } from '@app/services/map-game.service';
import { SocketService } from '@app/services/socket.service';
import { GameState, GameTile, TimerState } from '@common/game-structure';
import { GlobalStats } from '@common/global-stats';
import { Player } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { of } from 'rxjs';
import { ENDGAME_DELAY, MAX_NUMBER_OF_WINS } from './constant';
import { GamePageComponent } from './game-page.component';

/* eslint-disable max-lines */
describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    let gameControllerService: jasmine.SpyObj<GameControllerService>;
    let httpClientService: jasmine.SpyObj<HttpClientService>;
    let mapGameService: jasmine.SpyObj<MapGameService>;
    let socketService: jasmine.SpyObj<SocketService>;
    let router: jasmine.SpyObj<Router>;
    let snackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        gameControllerService = jasmine.createSpyObj('GameControllerService', [
            'setRoom',
            'requestGameSetup',
            'initializePlayers',
            'setActivePlayer',
            'requestStartTurn',
            'requestEndTurn',
            'requestCombatAction',
            'updateActiveFighter',
            'setFighters',
            'resetFighters',
            'updatePlayerCoordsList',
            'findPlayerCoordById',
            'isActivePlayer',
            'isInCombat',
            'isFighter',
            'requestAvailableMovesOnBudget',
            'requestCheckAction',
            'requestStartAction',
            'feedAfkList',
            'requestDebugMode',
            'requestUpdateInventory',
        ]);
        httpClientService = jasmine.createSpyObj('HttpClientService', ['getGame']);
        mapGameService = jasmine.createSpyObj('MapGameService', [
            'setTiles',
            'initializePlayersPositions',
            'setState',
            'switchToMovingStateRoutine',
            'switchToActionStateRoutine',
            'resetMovementPrevisualization',
            'resetPlayerView',
            'resetMap',
            'changePlayerPosition',
            'toggleDoor',
            'removePlayerById',
            'replaceRandomItems',
            'placeItem',
            'removeItem',
        ]);
        socketService = jasmine.createSpyObj('SocketService', ['once', 'on', 'disconnect']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        snackbar = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [GamePageComponent, BrowserAnimationsModule],
            providers: [
                { provide: 'gameController', useValue: gameControllerService },
                { provide: HttpClientService, useValue: httpClientService },
                { provide: 'mapService', useValue: mapGameService },
                { provide: SocketService, useValue: socketService },
                { provide: Router, useValue: router },
                { provide: MatSnackBar, useValue: snackbar },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                roomId: 'testRoom',
                                playerId: 'testPlayer',
                                gameId: 'testGame',
                                isAdmin: 'true',
                            },
                        },
                    },
                },
            ],
        }).compileComponents();

        httpClientService.getGame.and.returnValue(Promise.resolve(MOCKGAME));
        gameControllerService.setRoom('room1', MOCK_PLAYER.id);
        gameControllerService.initializePlayers(
            [
                { player: MOCK_PLAYER, position: 0 },
                { player: MOCK_PLAYER_TWO, position: 1 },
            ],
            0,
        );

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        /* eslint-disable @typescript-eslint/no-explicit-any*/
        (component as any).mapService = mapGameService;
        (component as any).gameController = gameControllerService;
        /* eslint-enable @typescript-eslint/no-explicit-any*/
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set room and add listeners on init', () => {
        expect(gameControllerService.setRoom).toHaveBeenCalledWith('room1', MOCK_PLAYER.id);
        expect(socketService.once).toHaveBeenCalled();
        expect(socketService.on).toHaveBeenCalled();
    });

    it('should get game and initiate game setup', async () => {
        expect(httpClientService.getGame).toHaveBeenCalledWith('testGame');
    });

    it('should initiate game setup correctly', () => {
        component.isAdmin = true;
        component.initiateGameSetup(MOCKGAME);
        expect(mapGameService.setTiles).toHaveBeenCalledWith(MOCKGAME.map as GameTile[]);
        expect(component.mapSize).toBe(parseInt(MOCKGAME.mapSize, 10));
        expect(component.gameCreated).toBeTrue();
        expect(gameControllerService.requestGameSetup).toHaveBeenCalled();
    });

    it('should initiate game setup correctly', () => {
        component.isAdmin = false;
        component.initiateGameSetup(MOCKGAME);
        expect(gameControllerService.requestGameSetup).not.toHaveBeenCalled();
    });

    it('should handle game setup', () => {
        const playerCoords = MOCK_PLAYER_COORDS;
        const randomizedItemsPlacement = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.FLAG_A },
        ];
        component.handleGameSetup(playerCoords, 1, randomizedItemsPlacement);
        expect(gameControllerService.initializePlayers).toHaveBeenCalledWith(playerCoords, 1);
        expect(component.playersInitialized).toBeTrue();
        expect(mapGameService.initializePlayersPositions).toHaveBeenCalledWith(playerCoords);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
        expect(component.timerState).toBe(TimerState.COOLDOWN);
    });

    it('should listen for game setup and handle it', () => {
        const mockData = {
            playerCoords: MOCK_PLAYER_COORDS,
            turn: 1,
            randomizedItemsPlacement: [
                { idx: 0, item: ItemTypes.AA1 },
                { idx: 1, item: ItemTypes.FLAG_A },
            ],
        };
        spyOn(component, 'handleGameSetup');

        component.listenGameSetup();
        socketService.once.calls.mostRecent().args[1](mockData);

        expect(socketService.once).toHaveBeenCalledWith('gameSetup', jasmine.any(Function));
        expect(component.handleGameSetup).toHaveBeenCalledWith(mockData.playerCoords, mockData.turn, mockData.randomizedItemsPlacement);
    });

    it('should listen for startTurn and handle it', () => {
        const mockData = { shortestPathByTile: {}, currentMoveBudget: 3 };

        component.listenTurns();
        socketService.on.calls.argsFor(0)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('startTurn', jasmine.any(Function));
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(mockData.shortestPathByTile);
        expect(component.currentMoveBudget).toBe(mockData.currentMoveBudget);
        expect(component.remainingActions).toBe(1);
    });

    it('should listen for endTurn and handle it', () => {
        const mockActivePlayerId = 'testPlayerId';

        component.listenTurns();
        socketService.on.calls.argsFor(1)[1](mockActivePlayerId);

        expect(socketService.on).toHaveBeenCalledWith('endTurn', jasmine.any(Function));
        expect(component.timerState).toBe(TimerState.COOLDOWN);
        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockActivePlayerId);
    });

    it('should listen for startCombat and handle it', () => {
        const mockCombatData = { attacker: MOCK_PLAYER_COORDS[0], defender: MOCK_PLAYER_COORDS[1], combatInitiatorId: 'testInitiator' };
        spyOn(component, 'handleStartCombat');

        socketService.on.calls.argsFor(2)[1](mockCombatData);

        expect(socketService.on).toHaveBeenCalledWith('startCombat', jasmine.any(Function));
        expect(component.handleStartCombat).toHaveBeenCalledWith(mockCombatData.attacker, mockCombatData.defender, mockCombatData.combatInitiatorId);
    });

    it('should listen for changeCombatTurn and handle it', () => {
        const mockNewAttackerId = 'newAttackerId';
        spyOn(component, 'handleChangeCombatTurn');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(3)[1](mockNewAttackerId);

        expect(socketService.on).toHaveBeenCalledWith('changeCombatTurn', jasmine.any(Function));
        expect(component.handleChangeCombatTurn).toHaveBeenCalledWith(mockNewAttackerId);
    });

    it('should listen for endCombat and handle it', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        spyOn(component, 'handleEndCombat');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(4)[1](mockNewFighters);

        expect(socketService.on).toHaveBeenCalledWith('endCombat', jasmine.any(Function));
        expect(component.handleEndCombat).toHaveBeenCalledWith(mockNewFighters);
    });

    it('should listen for timerUpdate and update timeLeft', () => {
        const mockTime = 10;

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(5)[1](mockTime);

        expect(socketService.on).toHaveBeenCalledWith('timerUpdate', jasmine.any(Function));
        expect(component.timeLeft).toBe(mockTime);
    });

    it('should listen for endTimer and call endTurn', () => {
        spyOn(component, 'endTurn');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(6)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endTimer', jasmine.any(Function));
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should listen for endCooldown and update timerState and request start turn', () => {
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(7)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endCooldown', jasmine.any(Function));
        expect(component.timerState).toBe(TimerState.REGULAR);
        expect(gameControllerService.requestStartTurn).toHaveBeenCalled();
    });

    it('should listen for CombatTimerUpdate and update timeLeft if in combat', () => {
        const mockTime = 10;
        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(8)[1](mockTime);

        expect(socketService.on).toHaveBeenCalledWith('CombatTimerUpdate', jasmine.any(Function));
        expect(component.timeLeft).toBe(mockTime);
    });

    it('should listen for endCombatTimer and request combat action if active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(9)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('endCombatTimer', jasmine.any(Function));
        expect(gameControllerService.requestCombatAction).toHaveBeenCalledWith('attack');
    });

    it('should listen for playerPositionUpdate and update player position', () => {
        const mockData = { playerId: 'testPlayerId', newPlayerPosition: 5 };
        spyOn(component, 'updatePlayerPosition');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(10)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('playerPositionUpdate', jasmine.any(Function));
        expect(component.updatePlayerPosition).toHaveBeenCalledWith(mockData.playerId, mockData.newPlayerPosition);
    });

    it('should listen for endMove and handle it', () => {
        const mockData = { availableMoves: {}, currentMoveBudget: 3, hasSlipped: false };
        spyOn(component, 'handleEndMove');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(11)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('endMove', jasmine.any(Function));
        expect(component.handleEndMove).toHaveBeenCalledWith(mockData.availableMoves, mockData.currentMoveBudget, mockData.hasSlipped);
    });

    it('should listen for startAction and switch to action state if tiles available', () => {
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(12)[1](TEST_AVAILABLE_TILES);

        expect(socketService.on).toHaveBeenCalledWith('startAction', jasmine.any(Function));
        expect(mapGameService.switchToActionStateRoutine).toHaveBeenCalledWith(TEST_AVAILABLE_TILES);
    });

    it('should listen for checkValidAction and handle it', () => {
        spyOn(component, 'handleCheckValidAction');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(13)[1](TEST_AVAILABLE_TILES);

        expect(socketService.on).toHaveBeenCalledWith('checkValidAction', jasmine.any(Function));
        expect(component.handleCheckValidAction).toHaveBeenCalledWith(TEST_AVAILABLE_TILES);
    });

    it('should listen for interactDoor and handle it', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        spyOn(component, 'handleInteractDoor');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(14)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('interactDoor', jasmine.any(Function));
        expect(component.handleInteractDoor).toHaveBeenCalledWith(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);
    });

    it('should listen for availableMovesOnBudget and switch to moving state if active player', () => {
        const mockAvailableMoves = {};
        gameControllerService.isActivePlayer.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(15)[1](mockAvailableMoves);

        expect(socketService.on).toHaveBeenCalledWith('availableMovesOnBudget', jasmine.any(Function));
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(mockAvailableMoves);
    });

    it('should listen for attacked and handle it if in combat', () => {
        const mockData = {
            attacker: MOCK_PLAYER_COORDS[0],
            attackerDice: 5,
            defender: MOCK_PLAYER_COORDS[1],
            defenderDice: 3,
            isAttackSuccessful: true,
        };
        spyOn(component, 'handleAttacked');

        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(16)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('attacked', jasmine.any(Function));
        expect(component.handleAttacked).toHaveBeenCalledWith(
            mockData.attacker,
            mockData.attackerDice,
            mockData.defender,
            mockData.defenderDice,
            mockData.isAttackSuccessful,
        );
    });

    it('should listen for attacked and handle it if in combat', () => {
        const mockData = {
            attacker: MOCK_PLAYER_COORDS[0],
            attackerDice: 5,
            defender: MOCK_PLAYER_COORDS[1],
            defenderDice: 3,
            isAttackSuccessful: true,
        };
        spyOn(component, 'handleAttacked');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(16)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('attacked', jasmine.any(Function));
        expect(component.handleAttacked).not.toHaveBeenCalled();
    });

    it('should listen for killedPlayer and handle it', () => {
        const mockData = { killer: MOCK_PLAYER_COORDS[0], killed: MOCK_PLAYER_COORDS[1], killedOldPosition: 5 };
        spyOn(component, 'handleKilledPlayer');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(17)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('killedPlayer', jasmine.any(Function));
        expect(component.handleKilledPlayer).toHaveBeenCalledWith(mockData.killer, mockData.killed, mockData.killedOldPosition);
    });

    it('should listen for killedPlayer and handle it', () => {
        const mockData = { killer: MOCK_PLAYER_COORDS[0], killed: MOCK_PLAYER_COORDS[1], killedOldPosition: 5 };
        const usualWinNumber = 0;
        mockData.killer.player.wins = MAX_NUMBER_OF_WINS;

        spyOn(component, 'handleKilledPlayer');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(17)[1](mockData);

        mockData.killer.player.wins = usualWinNumber;

        expect(socketService.on).toHaveBeenCalledWith('killedPlayer', jasmine.any(Function));
        expect(component.handleKilledPlayer).not.toHaveBeenCalled();
    });

    it('should listen for didEscape and handle it', () => {
        const mockData = { playerId: 'testPlayerId', remainingEscapeChances: 1, hasEscaped: true };
        spyOn(component, 'handleEscaped');
        gameControllerService.isInCombat.and.returnValue(true);

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(18)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('didEscape', jasmine.any(Function));
        expect(component.handleEscaped).toHaveBeenCalledWith(mockData.remainingEscapeChances, mockData.hasEscaped);
    });

    it('should listen for didEscape and handle it', () => {
        const mockData = { playerId: 'testPlayerId', remainingEscapeChances: 1, hasEscaped: true };
        spyOn(component, 'handleEscaped');

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(18)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('didEscape', jasmine.any(Function));
        expect(component.handleEscaped).not.toHaveBeenCalled();
    });

    it('should listen for quitGame and handle it', () => {
        const mockPlayerId = 'testPlayerId';

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(19)[1](mockPlayerId);

        expect(socketService.on).toHaveBeenCalledWith('quitGame', jasmine.any(Function));
        expect(gameControllerService.feedAfkList).toHaveBeenCalledWith(mockPlayerId);
        expect(mapGameService.removePlayerById).toHaveBeenCalledWith(mockPlayerId);
    });

    it('should listen for lastManStanding and handle it', () => {
        spyOn(component, 'redirectLastManStanding');

        component.listenEndGameEvents();

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(20)[1](undefined);

        expect(socketService.on).toHaveBeenCalledWith('lastManStanding', jasmine.any(Function));
        expect(component.redirectLastManStanding).toHaveBeenCalled();
    });

    it('should listen for endGame and handle it', () => {
        const mockData = { globalStats: {} as GlobalStats, players: [], endGameMessage: 'Game Over' };
        spyOn(component, 'redirectEndGame');

        component.listenEndGameEvents();

        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(21)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('endGame', jasmine.any(Function));
        expect(component.redirectEndGame).toHaveBeenCalledWith(mockData.globalStats, mockData.players, mockData.endGameMessage);
    });

    it('should handle start combat and set timer state to COMBAT if player is a fighter', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.COMBAT);
        expect(gameControllerService.setFighters).toHaveBeenCalledWith([mockAttacker, mockDefender]);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.COMBAT);
        expect(component.remainingActions).toBe(0);
    });

    it('should handle start combat and set timer state to NONE if player is not a fighter', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(false);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.NONE);
        expect(component.timeLeft).toBe(-1);
    });

    it('should handle start combat and not set state to COMBAT if player is not active', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockCombatInitiatorId = 'testInitiator';
        gameControllerService.isFighter.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleStartCombat(mockAttacker, mockDefender, mockCombatInitiatorId);

        expect(component.remainingEscapeChances).toBe(2);
        expect(component.combatInitiatorId).toBe(mockCombatInitiatorId);
        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockAttacker, mockDefender], mockAttacker.player.id);
        expect(component.timerState).toBe(TimerState.COMBAT);
        expect(gameControllerService.setFighters).toHaveBeenCalledWith([mockAttacker, mockDefender]);
        expect(mapGameService.setState).not.toHaveBeenCalledWith(GameState.COMBAT);
        expect(component.remainingActions).not.toBe(0);
    });

    it('should handle change combat turn and set state to COMBAT if in combat and active player', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.COMBAT);
    });

    it('should handle change combat turn and set state to NOTPLAYING if in combat and not active player', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(true);
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
    });

    it('should handle change combat turn and not change state if not in combat', () => {
        const mockNewAttackerId = 'newAttackerId';
        gameControllerService.isInCombat.and.returnValue(false);

        component.handleChangeCombatTurn(mockNewAttackerId);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith(mockNewAttackerId);
        expect(mapGameService.setState).not.toHaveBeenCalled();
    });

    it('should handle end combat and update player coordinates list', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith(mockNewFighters);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
        expect(component.timerState).toBe(TimerState.REGULAR);
    });

    it('should handle end combat and request end turn if active player and move budget is 0', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 0;
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).not.toHaveBeenCalled();
    });

    it('should handle end combat and request end turn if active player and combat initiator is not player', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 1;
        component.combatInitiatorId = 'anotherPlayerId';
        gameControllerService.isActivePlayer.and.returnValue(true);
        gameControllerService.playerId = 'testPlayerId';

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).not.toHaveBeenCalled();
    });

    it('should handle end combat and switch to moving state if active player and move budget is not 0 and combat initiator is player', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;
        component.currentMoveBudget = 1;
        component.combatInitiatorId = 'testPlayerId';
        gameControllerService.isActivePlayer.and.returnValue(true);
        gameControllerService.playerId = 'testPlayerId';

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.requestEndTurn).not.toHaveBeenCalled();
        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalled();
    });

    it('should handle end combat and reset fighters and combat initiator id', () => {
        const mockNewFighters = MOCK_PLAYER_COORDS;

        component.handleEndCombat(mockNewFighters);

        expect(gameControllerService.resetFighters).toHaveBeenCalled();
        expect(component.combatInitiatorId).toBe('');
    });

    it('should handle end move and call endTurn if hasSlipped is true', () => {
        const mockAvailableMoves = {};
        const mockCurrentMoveBudget = 3;
        spyOn(component, 'endTurn');

        component.handleEndMove(mockAvailableMoves, mockCurrentMoveBudget, true);

        expect(component.currentMoveBudget).toBe(mockCurrentMoveBudget);
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should handle end move and call endMovement if hasSlipped is false', () => {
        const mockAvailableMoves = {};
        const mockCurrentMoveBudget = 3;
        spyOn(component, 'endMovement');

        component.handleEndMove(mockAvailableMoves, mockCurrentMoveBudget, false);

        expect(component.currentMoveBudget).toBe(mockCurrentMoveBudget);
        expect(component.endMovement).toHaveBeenCalledWith(mockAvailableMoves);
    });

    it('should call endTurn if availableTiles length is 0', () => {
        spyOn(component, 'endTurn');

        component.handleCheckValidAction([]);

        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should set state to MOVING if availableTiles length is greater than 0', () => {
        component.handleCheckValidAction(TEST_AVAILABLE_TILES);

        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.MOVING);
    });

    it('should toggle door if isToggable is true', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(mapGameService.toggleDoor).toHaveBeenCalledWith(mockData.doorPosition);
    });

    it('should not toggle door if isToggable is false', () => {
        const mockData = { isToggable: false, doorPosition: 1, availableMoves: {} };

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(mapGameService.toggleDoor).not.toHaveBeenCalled();
    });

    it('should set remainingActions to 0 and call endMovement if active player', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        gameControllerService.isActivePlayer.and.returnValue(true);
        spyOn(component, 'endMovement');

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(component.remainingActions).toBe(0);
        expect(component.endMovement).toHaveBeenCalledWith(mockData.availableMoves);
    });

    it('should not set remainingActions to 0 or call endMovement if not active player', () => {
        const mockData = { isToggable: true, doorPosition: 1, availableMoves: {} };
        gameControllerService.isActivePlayer.and.returnValue(false);
        spyOn(component, 'endMovement');

        component.handleInteractDoor(mockData.isToggable, mockData.doorPosition, mockData.availableMoves);

        expect(component.remainingActions).not.toBe(0);
        expect(component.endMovement).not.toHaveBeenCalled();
    });

    it('should handle attacked and update dice results and attack success', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockAttackerDice = 5;
        const mockDefenderDice = 3;
        const mockIsAttackSuccessful = true;

        component.handleAttacked(mockAttacker, mockAttackerDice, mockDefender, mockDefenderDice, mockIsAttackSuccessful);

        expect(component.attackerDiceResult).toBe(mockAttackerDice);
        expect(component.defenderDiceResult).toBe(mockDefenderDice);
        expect(component.attackSuccessful).toBe(mockIsAttackSuccessful);
        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith([mockAttacker, mockDefender]);
    });

    it('should handle attacked and update player coordinates list', () => {
        const mockAttacker = MOCK_PLAYER_COORDS[0];
        const mockDefender = MOCK_PLAYER_COORDS[1];
        const mockAttackerDice = 5;
        const mockDefenderDice = 3;
        const mockIsAttackSuccessful = true;

        component.handleAttacked(mockAttacker, mockAttackerDice, mockDefender, mockDefenderDice, mockIsAttackSuccessful);

        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith([mockAttacker, mockDefender]);
    });

    it('should handle killed player and update active fighter and player position', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.updateActiveFighter).toHaveBeenCalledWith([mockKiller, mockKilled], component.combatInitiatorId);
        expect(mapGameService.changePlayerPosition).toHaveBeenCalledWith(mockKilledOldPosition, mockKilled.position, mockKilled.player);
    });

    it('should set currentMoveBudget to 0 if active player and combat initiator is killed player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKilled.player.id;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(component.currentMoveBudget).toBe(0);
    });

    it('should not set currentMoveBudget to 0 if active player and combat initiator is killed player, but isDebugModeActive true', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKilled.player.id;
        gameControllerService.isDebugModeActive = true;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(component.currentMoveBudget).not.toBe(0);
    });

    it('should request available moves on budget if active player and combat initiator is killer player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKiller.player.id;
        component.currentMoveBudget = 3;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.requestAvailableMovesOnBudget).toHaveBeenCalledWith(component.currentMoveBudget);
    });

    it('should not request available moves on budget if currentMoveBudget is -1', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(true);
        component.combatInitiatorId = mockKiller.player.id;
        component.currentMoveBudget = -1;

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(gameControllerService.requestAvailableMovesOnBudget).not.toHaveBeenCalled();
    });

    it('should not set currentMoveBudget to 0 or request available moves on budget if not active player', () => {
        const mockKiller = MOCK_PLAYER_COORDS[0];
        const mockKilled = MOCK_PLAYER_COORDS[1];
        const mockKilledOldPosition = 5;
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleKilledPlayer(mockKiller, mockKilled, mockKilledOldPosition);

        expect(component.currentMoveBudget).not.toBe(0);
        expect(gameControllerService.requestAvailableMovesOnBudget).not.toHaveBeenCalled();
    });

    it('should handle escaped and set active player if hasEscaped is true', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = true;
        component.combatInitiatorId = 'testInitiator';

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(gameControllerService.setActivePlayer).toHaveBeenCalledWith('testInitiator');
        expect(component.remainingEscapeChances).toBe(-1);
    });

    it('should handle escaped and update remainingEscapeChances if hasEscaped is false and active player', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = false;
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(component.remainingEscapeChances).toBe(mockRemainingEscapeChances);
    });

    it('should handle escaped and not update remainingEscapeChances if hasEscaped is false and not active player', () => {
        const mockRemainingEscapeChances = 1;
        const mockHasEscaped = false;
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.handleEscaped(mockRemainingEscapeChances, mockHasEscaped);

        expect(component.remainingEscapeChances).not.toBe(mockRemainingEscapeChances);
    });

    it('should redirect last man standing', () => {
        component.redirectLastManStanding();

        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(snackbar.open).toHaveBeenCalledWith('Tous les autres joueurs ont quitté la partie', 'Fermer', jasmine.any(Object));
    });

    it('should call resetPlayerView and requestEndTurn if active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(true);
        spyOn(component, 'resetPlayerView');

        component.endTurn();

        expect(component.resetPlayerView).toHaveBeenCalled();
        expect(gameControllerService.requestEndTurn).toHaveBeenCalled();
    });

    it('should not call resetPlayerView or requestEndTurn if not active player', () => {
        gameControllerService.isActivePlayer.and.returnValue(false);
        spyOn(component, 'resetPlayerView');

        component.endTurn();

        expect(component.resetPlayerView).not.toHaveBeenCalled();
        expect(gameControllerService.requestEndTurn).not.toHaveBeenCalled();
    });

    it('should update player position if playerCoord is found', () => {
        const mockPlayerId = 'testPlayerId';
        const mockNewPlayerPosition = 5;
        const mockPlayerCoord = MOCK_PLAYER_COORD;
        gameControllerService.findPlayerCoordById.and.returnValue(mockPlayerCoord);

        component.updatePlayerPosition(mockPlayerId, mockNewPlayerPosition);
        expect(mockPlayerCoord.position).toBe(mockNewPlayerPosition);
        mockPlayerCoord.position = 1;
        expect(mapGameService.changePlayerPosition).toHaveBeenCalledWith(mockPlayerCoord.position, mockNewPlayerPosition, mockPlayerCoord.player);
    });

    it('should not update player position if playerCoord is not found', () => {
        const mockPlayerId = 'testPlayerId';
        const mockNewPlayerPosition = 5;
        gameControllerService.findPlayerCoordById.and.returnValue(undefined);

        component.updatePlayerPosition(mockPlayerId, mockNewPlayerPosition);

        expect(mapGameService.changePlayerPosition).not.toHaveBeenCalled();
    });

    it('should switch to moving state routine if shortestPathByTile is not empty', () => {
        component.endMovement(TEST_SHORTEST_PATH);

        expect(mapGameService.switchToMovingStateRoutine).toHaveBeenCalledWith(TEST_SHORTEST_PATH);
    });

    it('should request check action if shortestPathByTile is empty and remainingActions is greater than 0', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = 1;

        component.endMovement(mockShortestPathByTile);

        expect(gameControllerService.requestCheckAction).toHaveBeenCalled();
    });

    it('should reset movement previsualization and end turn if shortestPathByTile is empty and remainingActions is 0', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = 0;
        spyOn(component, 'endTurn');

        component.endMovement(mockShortestPathByTile);

        expect(mapGameService.resetMovementPrevisualization).toHaveBeenCalled();
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should reset movement previsualization and end turn if shortestPathByTile is empty and remainingActions is -1', () => {
        const mockShortestPathByTile = {};
        component.remainingActions = -1;
        spyOn(component, 'endTurn');

        component.endMovement(mockShortestPathByTile);

        expect(mapGameService.resetMovementPrevisualization).toHaveBeenCalled();
        expect(component.endTurn).toHaveBeenCalled();
    });

    it('should call requestStartAction if remainingActions is 1 and currentStateNumber is MOVING', () => {
        component.remainingActions = 1;
        mapGameService.currentStateNumber = GameState.MOVING;

        component.startAction();

        expect(gameControllerService.requestStartAction).toHaveBeenCalled();
    });

    it('should not call requestStartAction if remainingActions is not 1', () => {
        component.remainingActions = 0;
        mapGameService.currentStateNumber = GameState.MOVING;

        component.startAction();

        expect(gameControllerService.requestStartAction).not.toHaveBeenCalled();
    });

    it('should not call requestStartAction if currentStateNumber is not MOVING', () => {
        component.remainingActions = 1;
        mapGameService.currentStateNumber = GameState.NOTPLAYING;

        component.startAction();

        expect(gameControllerService.requestStartAction).not.toHaveBeenCalled();
    });

    it('should request combat action if active player', () => {
        const mockCombatAction = 'attack';
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.catchSelectCombatAction(mockCombatAction);

        expect(gameControllerService.requestCombatAction).toHaveBeenCalledWith(mockCombatAction);
    });

    it('should not request combat action if not active player', () => {
        const mockCombatAction = 'attack';
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.catchSelectCombatAction(mockCombatAction);

        expect(gameControllerService.requestCombatAction).not.toHaveBeenCalled();
    });

    it('should reset player view', () => {
        component.resetPlayerView();

        expect(mapGameService.resetPlayerView).toHaveBeenCalled();
        expect(component.currentMoveBudget).toBe(-1);
        expect(component.remainingActions).toBe(-1);
    });

    it('should navigate to home when quitGame is called', () => {
        component.quitGame();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should set gameFinished to true and navigate to gameEnd with correct data after delay', fakeAsync(() => {
        const mockGlobalStats = {} as GlobalStats;
        const mockPlayers = [MOCK_PLAYER_COORDS[0].player, MOCK_PLAYER_COORDS[1].player];
        const mockEndGameMessage = 'Game Over';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).gameController.player = { name: 'testPlayer' };
        component.redirectEndGame(mockGlobalStats, mockPlayers, mockEndGameMessage);
        tick(ENDGAME_DELAY);

        expect(component.gameFinished).toBeTrue();
    }));

    it('should handle game setup and replace random items', () => {
        const playerCoords = MOCK_PLAYER_COORDS;
        const turn = 1;
        const randomizedItemsPlacement = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.FLAG_A },
        ];

        component.handleGameSetup(playerCoords, turn, randomizedItemsPlacement);

        expect(mapGameService.replaceRandomItems).toHaveBeenCalledWith(randomizedItemsPlacement);
        expect(gameControllerService.initializePlayers).toHaveBeenCalledWith(playerCoords, turn);
        expect(component.playersInitialized).toBeTrue();
        expect(mapGameService.initializePlayersPositions).toHaveBeenCalledWith(playerCoords);
        expect(mapGameService.setState).toHaveBeenCalledWith(GameState.NOTPLAYING);
        expect(component.timerState).toBe(TimerState.COOLDOWN);
    });

    it('should handle game setup and set playersInitialized to true', () => {
        const playerCoords = MOCK_PLAYER_COORDS;
        const turn = 1;
        const randomizedItemsPlacement = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.FLAG_A },
        ];

        component.handleGameSetup(playerCoords, turn, randomizedItemsPlacement);

        expect(component.playersInitialized).toBeTrue();
    });

    it('should handle game setup and set timerState to COOLDOWN', () => {
        const playerCoords = MOCK_PLAYER_COORDS;
        const turn = 1;
        const randomizedItemsPlacement = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.FLAG_A },
        ];

        component.handleGameSetup(playerCoords, turn, randomizedItemsPlacement);

        expect(component.timerState).toBe(TimerState.COOLDOWN);
    });

    it('should disconnect socket service if game is not finished on destroy', () => {
        component.gameFinished = false;
        component.ngOnDestroy();
        expect(socketService.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect socket service if game is finished on destroy', () => {
        component.gameFinished = true;
        component.ngOnDestroy();
        expect(socketService.disconnect).not.toHaveBeenCalled();
    });

    it('should add listeners for game setup, turns, combat turns, timer, combat timer, movement, actions, combat actions, and endGame events', () => {
        spyOn(component, 'listenGameSetup');
        spyOn(component, 'listenTurns');
        spyOn(component, 'listenCombatTurns');
        spyOn(component, 'listenTimer');
        spyOn(component, 'listenCombatTimer');
        spyOn(component, 'listenMovement');
        spyOn(component, 'listenActions');
        spyOn(component, 'listenCombatActions');
        spyOn(component, 'listenEndGameEvents');
        spyOn(component, 'listenDebugMode');
        spyOn(component, 'listenNewPlayerInventory');
        spyOn(component, 'listenItemToReplace');
        spyOn(component, 'listenTeleportation');
        spyOn(component, 'listenDisperseItems');
        spyOn(component, 'listenVPItemToReplace');

        component.addListeners();

        expect(component.listenGameSetup).toHaveBeenCalled();
        expect(component.listenTurns).toHaveBeenCalled();
        expect(component.listenCombatTurns).toHaveBeenCalled();
        expect(component.listenTimer).toHaveBeenCalled();
        expect(component.listenCombatTimer).toHaveBeenCalled();
        expect(component.listenMovement).toHaveBeenCalled();
        expect(component.listenActions).toHaveBeenCalled();
        expect(component.listenCombatActions).toHaveBeenCalled();
        expect(component.listenEndGameEvents).toHaveBeenCalled();
        expect(component.listenDebugMode).toHaveBeenCalled();
        expect(component.listenNewPlayerInventory).toHaveBeenCalled();
        expect(component.listenItemToReplace).toHaveBeenCalled();
        expect(component.listenTeleportation).toHaveBeenCalled();
        expect(component.listenDisperseItems).toHaveBeenCalled();
        expect(component.listenVPItemToReplace).toHaveBeenCalled();
    });

    it('should listen for responseDebugMode and update isDebugModeActive', () => {
        const mockData = { isDebugMode: true };

        component.listenDebugMode();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(22)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('responseDebugMode', jasmine.any(Function));
        expect(gameControllerService.isDebugModeActive).toBe(mockData.isDebugMode);
    });

    it('should open snackbar with correct message when debug mode is activated', () => {
        const mockData = { isDebugMode: true };

        component.listenDebugMode();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(22)[1](mockData);

        expect(snackbar.open).toHaveBeenCalledWith("Le mode débogage a été activé par l'administrateur", 'Fermer', jasmine.any(Object));
    });

    it('should open snackbar with correct message when debug mode is deactivated', () => {
        const mockData = { isDebugMode: false };

        component.listenDebugMode();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(22)[1](mockData);

        expect(snackbar.open).toHaveBeenCalledWith("Le mode débogage a été désactivé par l'administrateur", 'Fermer', jasmine.any(Object));
    });

    it('should listen for newPlayerInventory and update player coordinates list', () => {
        const mockData = { player: MOCK_PLAYER_COORD, dropItem: ItemTypes.AA1 };

        component.listenNewPlayerInventory();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(23)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('newPlayerInventory', jasmine.any(Function));
        expect(gameControllerService.updatePlayerCoordsList).toHaveBeenCalledWith([mockData.player]);
    });

    it('should place item if dropItem is present in newPlayerInventory', () => {
        const mockData = { player: MOCK_PLAYER_COORD, dropItem: ItemTypes.AA1 };

        component.listenNewPlayerInventory();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(23)[1](mockData);

        expect(mapGameService.placeItem).toHaveBeenCalledWith(mockData.player.position, mockData.dropItem);
    });

    it('should remove item if dropItem is not present in newPlayerInventory', () => {
        const mockData = { player: MOCK_PLAYER_COORD };

        component.listenNewPlayerInventory();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(23)[1](mockData);

        expect(mapGameService.removeItem).toHaveBeenCalledWith(mockData.player.position);
    });

    it('should listen for itemToReplace and inquire player for item replacement if active player and inventory exists', () => {
        const mockData = { player: MOCK_PLAYER_COORD, newItem: ItemTypes.AA1 };
        mockData.player.player.inventory = [ItemTypes.FLAG_A];
        spyOn(component, 'inquirePlayerForItemReplacement');
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.listenItemToReplace();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(24)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('itemToReplace', jasmine.any(Function));
        expect(component.inquirePlayerForItemReplacement).toHaveBeenCalledWith([...mockData.player.player.inventory, mockData.newItem]);
    });

    it('should not inquire player for item replacement if not active player', () => {
        const mockData = { player: MOCK_PLAYER_COORD, newItem: ItemTypes.AA1 };
        spyOn(component, 'inquirePlayerForItemReplacement');
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.listenItemToReplace();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(24)[1](mockData);

        expect(component.inquirePlayerForItemReplacement).not.toHaveBeenCalled();
    });

    it('should listen for teleportResponse and update player position', () => {
        const mockData = { playerId: 'testPlayerId', newPosition: 5, availableMoves: {}, currentPlayerMoveBudget: 3 };
        spyOn(component, 'updatePlayerPosition');

        component.listenTeleportation();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(25)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('teleportResponse', jasmine.any(Function));
        expect(component.updatePlayerPosition).toHaveBeenCalledWith(mockData.playerId, mockData.newPosition);
    });

    it('should handle end move if active player', () => {
        const mockData = { playerId: 'testPlayerId', newPosition: 5, availableMoves: {}, currentPlayerMoveBudget: 3 };
        spyOn(component, 'handleEndMove');
        gameControllerService.isActivePlayer.and.returnValue(true);

        component.listenTeleportation();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(25)[1](mockData);

        expect(component.handleEndMove).toHaveBeenCalledWith(mockData.availableMoves, mockData.currentPlayerMoveBudget, false);
    });

    it('should not handle end move if not active player', () => {
        const mockData = { playerId: 'testPlayerId', newPosition: 5, availableMoves: {}, currentPlayerMoveBudget: 3 };
        spyOn(component, 'handleEndMove');
        gameControllerService.isActivePlayer.and.returnValue(false);

        component.listenTeleportation();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(25)[1](mockData);

        expect(component.handleEndMove).not.toHaveBeenCalled();
    });

    it('should listen for disperseItems and replace random items', () => {
        const mockItemsPositions = [
            { idx: 0, item: ItemTypes.AA1 },
            { idx: 1, item: ItemTypes.FLAG_A },
        ];

        component.listenDisperseItems();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(26)[1](mockItemsPositions);

        expect(socketService.on).toHaveBeenCalledWith('disperseItems', jasmine.any(Function));
        expect(mapGameService.replaceRandomItems).toHaveBeenCalledWith(mockItemsPositions);
    });

    it('should listen for vpItemToReplace and handle it', () => {
        const mockData = { player: MOCK_PLAYER_COORD, newItem: ItemTypes.AA1 };

        component.listenVPItemToReplace();
        // it's the index of the expected listener
        // eslint-disable-next-line
        socketService.on.calls.argsFor(27)[1](mockData);

        expect(socketService.on).toHaveBeenCalledWith('vpItemToReplace', jasmine.any(Function));
        expect(mapGameService.removeItem).toHaveBeenCalledWith(mockData.player.position);
        expect(mapGameService.placeItem).toHaveBeenCalledWith(mockData.player.position, mockData.newItem);
    });

    it('should open dialog with correct data when inquirePlayerForItemReplacement is called', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        spyOn(component.dialog, 'open').and.returnValue(dialogRefSpyObj);

        component.inquirePlayerForItemReplacement(mockItems);

        expect(component.dialog.open).toHaveBeenCalledWith(ChooseItemModalComponent, {
            data: { itemTypes: mockItems },
        });
    });

    it('should call chooseItem with correct arguments when dialog is closed with a result', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const mockResult = ItemTypes.AA1;
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(mockResult), close: null });
        spyOn(component.dialog, 'open').and.returnValue(dialogRefSpyObj);
        spyOn(component, 'chooseItem');

        component.inquirePlayerForItemReplacement(mockItems);

        expect(component.chooseItem).toHaveBeenCalledWith(mockItems, mockResult);
    });

    it('should not call chooseItem when dialog is closed without a result', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(null), close: null });
        spyOn(component.dialog, 'open').and.returnValue(dialogRefSpyObj);
        spyOn(component, 'chooseItem');

        component.inquirePlayerForItemReplacement(mockItems);

        expect(component.chooseItem).not.toHaveBeenCalled();
    });

    it('should place item and request update inventory if player and inventory exist', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const mockRejectedItem = ItemTypes.AA1;
        const mockPlayerCoord = { position: 1, player: { inventory: [ItemTypes.FLAG_A] } as Player };
        gameControllerService.findPlayerCoordById.and.returnValue(mockPlayerCoord);

        component.chooseItem(mockItems, mockRejectedItem);

        expect(mapGameService.placeItem).toHaveBeenCalledWith(mockPlayerCoord.position, mockRejectedItem);
        expect(gameControllerService.requestUpdateInventory).toHaveBeenCalledWith(mockItems, mockRejectedItem);
    });

    it('should not place item or request update inventory if player does not exist', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const mockRejectedItem = ItemTypes.AA1;
        gameControllerService.findPlayerCoordById.and.returnValue(undefined);

        component.chooseItem(mockItems, mockRejectedItem);

        expect(mapGameService.placeItem).not.toHaveBeenCalled();
        expect(gameControllerService.requestUpdateInventory).not.toHaveBeenCalled();
    });

    it('should not place item or request update inventory if player inventory does not exist', () => {
        const mockItems = [ItemTypes.AA1, ItemTypes.FLAG_A];
        const mockRejectedItem = ItemTypes.AA1;
        const mockPlayerCoord = { position: 1, player: {} as Player };
        gameControllerService.findPlayerCoordById.and.returnValue(mockPlayerCoord);

        component.chooseItem(mockItems, mockRejectedItem);

        expect(mapGameService.placeItem).not.toHaveBeenCalled();
        expect(gameControllerService.requestUpdateInventory).not.toHaveBeenCalled();
    });

    it('should call handleKeyDPressed when "d" key is pressed and isAdmin is true', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'd' });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).toHaveBeenCalled();
    });

    it('should call handleKeyDPressed when "d" key is pressed and isAdmin is true', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'D' });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).toHaveBeenCalled();
    });

    it('should call handleKeyDPressed when "d" key is pressed and isAdmin is true', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { code: 'KeyD' });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).toHaveBeenCalled();
    });

    it('should not call handleKeyDPressed when "d" key is pressed and isAdmin is false', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = false;

        const event = new KeyboardEvent('keydown', { key: 'd' });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).not.toHaveBeenCalled();
    });

    it('should not call handleKeyDPressed when "d" key is pressed with ctrl key', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).not.toHaveBeenCalled();
    });

    it('should not call handleKeyDPressed when "d" key is pressed with shift key', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'd', shiftKey: true });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).not.toHaveBeenCalled();
    });

    it('should not call handleKeyDPressed when "d" key is pressed with alt key', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'd', altKey: true });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).not.toHaveBeenCalled();
    });

    it('should not call handleKeyDPressed when "d" key is pressed with meta key', () => {
        spyOn(component, 'handleKeyDPressed');
        component.isAdmin = true;

        const event = new KeyboardEvent('keydown', { key: 'd', metaKey: true });
        window.dispatchEvent(event);

        expect(component.handleKeyDPressed).not.toHaveBeenCalled();
    });
});
