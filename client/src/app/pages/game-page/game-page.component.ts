import { Component, inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { ChooseItemModalComponent } from '@app/components/choose-item-modal/choose-item-modal.component';
import { CombatInterfaceComponent } from '@app/components/combat-interface/combat-interface.component';
import { GameMapComponent } from '@app/components/game-map/game-map.component';
import { GamePanelComponent } from '@app/components/game-panel/game-panel.component';
import { InventoryComponent } from '@app/components/inventory/inventory.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { LogsComponent } from '@app/components/logs/logs.component';
import { PlayerPanelComponent } from '@app/components/player-panel/player-panel.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ENDGAME_DELAY, MAX_NUMBER_OF_WINS, SNACKBAR_PARAMETERS } from '@app/pages/game-page/constant';
import { ActionStateService } from '@app/services/action-state.service';
import { CombatStateService } from '@app/services/combat-state.service';
import { GameControllerService } from '@app/services/game-controller.service';
import { HttpClientService } from '@app/services/http-client.service';
import { MapGameService } from '@app/services/map-game.service';
import { MovingStateService } from '@app/services/moving-state.service';
import { NotPlayingStateService } from '@app/services/not-playing-state.service';
import { SocketService } from '@app/services/socket.service';
import { GameState, GameStructure, GameTile, ShortestPathByTile, TimerState } from '@common/game-structure';
import { GlobalStats } from '@common/global-stats';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';

// Game Page is complex and has many functionalities, so it is normal to have a high number of lines
/* eslint-disable max-lines */
@Component({
    selector: 'app-game-page',
    standalone: true,
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    imports: [
        ChatComponent,
        InventoryComponent,
        MatCardModule,
        MatIconModule,
        MatListModule,
        GameMapComponent,
        MatButtonModule,
        MatTabsModule,
        TimerComponent,
        LeaderboardComponent,
        CombatInterfaceComponent,
        PlayerPanelComponent,
        GamePanelComponent,
        LogsComponent,
    ],
    providers: [GameControllerService, MapGameService, NotPlayingStateService, MovingStateService, ActionStateService, CombatStateService],
})
export class GamePageComponent implements OnDestroy {
    mapSize: number;
    game: GameStructure;
    currentMoveBudget: number = -1;
    remainingActions: number = -1;
    timeLeft: number = -1;
    timerState: TimerState = TimerState.COOLDOWN;
    attackerDiceResult: number = 0;
    defenderDiceResult: number = 0;
    attackSuccessful: boolean;
    gameCreated = false;
    playersInitialized = false;
    remainingEscapeChances: number = -1;
    combatInitiatorId: string = '';
    isAdmin = false;
    gameFinished = false;
    readonly gameController = inject(GameControllerService);
    private readonly httpService = inject(HttpClientService);
    private readonly mapService = inject(MapGameService);
    private readonly socketService = inject(SocketService);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private snackbar: MatSnackBar,
        public dialog: MatDialog,
    ) {
        this.gameController.setRoom(this.route.snapshot.params['roomId'], this.route.snapshot.params['playerId']);
        this.addListeners();
        this.getGame(this.route.snapshot.params['gameId']).then(() => {
            this.isAdmin = this.route.snapshot.params['isAdmin'] === 'true';
            this.initiateGameSetup(this.game);
        });
    }

    addListeners() {
        window.addEventListener('keydown', (event) => {
            if (
                (event.key === 'd' || event.key === 'D' || event.code === 'KeyD') &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey &&
                !event.metaKey &&
                this.isAdmin
            ) {
                this.handleKeyDPressed();
            }
        });

        this.listenGameSetup();
        this.listenTurns();
        this.listenCombatTurns();
        this.listenTimer();
        this.listenCombatTimer();
        this.listenMovement();
        this.listenActions();
        this.listenCombatActions();
        this.listenEndGameEvents();

        this.listenDebugMode();
        this.listenNewPlayerInventory();
        this.listenItemToReplace();

        this.listenTeleportation();
        this.listenDisperseItems();
        this.listenVPItemToReplace();
    }

    listenDisperseItems() {
        this.socketService.on('disperseItems', (itemsPositions: { idx: number; item: ItemTypes }[]) => {
            this.mapService.replaceRandomItems(itemsPositions);
        });
    }

    listenTeleportation() {
        this.socketService.on(
            'teleportResponse',
            (data: { playerId: string; newPosition: number; availableMoves: ShortestPathByTile; currentPlayerMoveBudget: number }) => {
                this.updatePlayerPosition(data.playerId, data.newPosition);
                if (this.gameController.isActivePlayer()) this.handleEndMove(data.availableMoves, data.currentPlayerMoveBudget, false);
            },
        );
    }

    listenNewPlayerInventory() {
        this.socketService.on('newPlayerInventory', (data: { player: PlayerCoord; dropItem?: ItemTypes }) => {
            this.gameController.updatePlayerCoordsList([data.player]);
            if (data.dropItem) {
                this.mapService.placeItem(data.player.position, data.dropItem);
            } else {
                this.mapService.removeItem(data.player.position);
            }
        });
    }

    listenItemToReplace() {
        this.socketService.on('itemToReplace', (data: { player: PlayerCoord; newItem: ItemTypes }) => {
            if (this.gameController.isActivePlayer()) {
                const inventory = data.player.player.inventory;
                this.inquirePlayerForItemReplacement([...inventory, data.newItem]);
            }
        });
    }

    listenVPItemToReplace() {
        this.socketService.on('vpItemToReplace', (data: { player: PlayerCoord; newItem: ItemTypes }) => {
            this.mapService.removeItem(data.player.position);
            this.mapService.placeItem(data.player.position, data.newItem);
        });
    }

    inquirePlayerForItemReplacement(items: ItemTypes[]) {
        const dialogRef = this.dialog.open(ChooseItemModalComponent, {
            data: { itemTypes: items },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.chooseItem(items, result);
            }
        });
    }

    chooseItem(items: ItemTypes[], rejectedItem: ItemTypes) {
        const player = this.gameController.findPlayerCoordById(this.gameController.playerId);
        if (player && player.player.inventory) {
            this.mapService.placeItem(player.position, rejectedItem);
            this.gameController.requestUpdateInventory(items, rejectedItem);
        }
    }

    async getGame(gameId: string) {
        this.game = await this.httpService.getGame(gameId);
    }

    handleKeyDPressed() {
        this.gameController.requestDebugMode();
    }

    initiateGameSetup(game: GameStructure) {
        this.mapService.setTiles(game.map as GameTile[]);
        this.mapSize = parseInt(game.mapSize, 10);
        this.gameCreated = true;
        if (this.isAdmin) this.gameController.requestGameSetup();
    }

    listenGameSetup() {
        this.socketService.once(
            'gameSetup',
            (data: {
                playerCoords: PlayerCoord[];
                turn: number;
                randomizedItemsPlacement: {
                    idx: number;
                    item: ItemTypes;
                }[];
            }) => {
                this.handleGameSetup(data.playerCoords, data.turn, data.randomizedItemsPlacement);
            },
        );
    }

    listenTurns() {
        this.socketService.on('startTurn', (data: { shortestPathByTile: ShortestPathByTile; currentMoveBudget: number }) => {
            this.mapService.switchToMovingStateRoutine(data.shortestPathByTile);
            this.currentMoveBudget = data.currentMoveBudget;
            this.remainingActions = 1;
        });
        this.socketService.on('endTurn', (activePlayerId: string) => {
            this.timerState = TimerState.COOLDOWN;
            this.gameController.setActivePlayer(activePlayerId);
        });
    }

    listenCombatTurns() {
        this.socketService.on('startCombat', (combatData: { attacker: PlayerCoord; defender: PlayerCoord; combatInitiatorId: string }) => {
            this.handleStartCombat(combatData.attacker, combatData.defender, combatData.combatInitiatorId);
        });
        this.socketService.on('changeCombatTurn', (newAttackerId: string) => {
            this.handleChangeCombatTurn(newAttackerId);
        });
        this.socketService.on('endCombat', (newFighters: PlayerCoord[]) => {
            this.handleEndCombat(newFighters);
        });
    }

    listenTimer() {
        this.socketService.on('timerUpdate', (time: number) => {
            this.timeLeft = time;
        });
        this.socketService.on('endTimer', () => {
            this.endTurn();
        });
        this.socketService.on('endCooldown', () => {
            this.timerState = TimerState.REGULAR;
            this.gameController.requestStartTurn();
        });
    }

    listenCombatTimer() {
        this.socketService.on('CombatTimerUpdate', (time: number) => {
            if (this.gameController.isInCombat()) this.timeLeft = time;
        });
        this.socketService.on('endCombatTimer', () => {
            if (this.gameController.isActivePlayer()) this.gameController.requestCombatAction('attack');
        });
    }

    listenMovement() {
        this.socketService.on('playerPositionUpdate', (data: { playerId: string; newPlayerPosition: number }) => {
            this.updatePlayerPosition(data.playerId, data.newPlayerPosition);
        });
        this.socketService.on('endMove', (data: { availableMoves: ShortestPathByTile; currentMoveBudget: number; hasSlipped: boolean }) => {
            this.handleEndMove(data.availableMoves, data.currentMoveBudget, data.hasSlipped);
        });
    }

    listenActions() {
        this.socketService.on('startAction', (availableTiles: number[]) => {
            if (availableTiles.length > 0) this.mapService.switchToActionStateRoutine(availableTiles);
        });
        this.socketService.on('checkValidAction', (availableTiles: number[]) => {
            this.handleCheckValidAction(availableTiles);
        });
        this.socketService.on('interactDoor', (data: { isToggable: boolean; doorPosition: number; availableMoves: ShortestPathByTile }) => {
            this.handleInteractDoor(data.isToggable, data.doorPosition, data.availableMoves);
        });
        this.socketService.on('availableMovesOnBudget', (availableMoves: ShortestPathByTile) => {
            if (this.gameController.isActivePlayer()) this.mapService.switchToMovingStateRoutine(availableMoves);
        });
    }

    listenCombatActions() {
        this.socketService.on(
            'attacked',
            (data: { attacker: PlayerCoord; attackerDice: number; defender: PlayerCoord; defenderDice: number; isAttackSuccessful: boolean }) => {
                if (this.gameController.isInCombat()) {
                    this.handleAttacked(data.attacker, data.attackerDice, data.defender, data.defenderDice, data.isAttackSuccessful);
                }
            },
        );
        this.socketService.on('killedPlayer', (data: { killer: PlayerCoord; killed: PlayerCoord; killedOldPosition: number }) => {
            if (data.killer.player.wins < MAX_NUMBER_OF_WINS) {
                this.handleKilledPlayer(data.killer, data.killed, data.killedOldPosition);
            }
        });
        this.socketService.on('didEscape', (data: { playerId: string; remainingEscapeChances: number; hasEscaped: boolean }) => {
            if (this.gameController.isInCombat()) {
                this.handleEscaped(data.remainingEscapeChances, data.hasEscaped);
            }
        });
    }

    listenEndGameEvents() {
        this.socketService.on('quitGame', (playerId: string) => {
            this.gameController.feedAfkList(playerId);
            this.mapService.removePlayerById(playerId);
        });
        this.socketService.on('lastManStanding', () => {
            this.redirectLastManStanding();
        });
        this.socketService.on('endGame', (data: { globalStats: GlobalStats; players: Player[]; endGameMessage: string }) => {
            this.redirectEndGame(data.globalStats, data.players, data.endGameMessage);
        });
    }

    listenDebugMode() {
        this.socketService.on('responseDebugMode', (data: { isDebugMode: boolean }) => {
            this.gameController.isDebugModeActive = data.isDebugMode;
            this.snackbar.open(
                `Le mode débogage a été ${this.gameController.isDebugModeActive ? 'activé' : 'désactivé'} par l'administrateur`,
                'Fermer',
                SNACKBAR_PARAMETERS as MatSnackBarConfig,
            );
        });
    }

    handleGameSetup(
        playerCoords: PlayerCoord[],
        turn: number,
        randomizedItemsPlacement: {
            idx: number;
            item: ItemTypes;
        }[],
    ) {
        this.mapService.replaceRandomItems(randomizedItemsPlacement);
        this.gameController.initializePlayers(playerCoords, turn);
        this.playersInitialized = true;
        this.mapService.initializePlayersPositions(playerCoords);
        this.mapService.setState(GameState.NOTPLAYING);
        this.timerState = TimerState.COOLDOWN;
    }

    handleStartCombat(attacker: PlayerCoord, defender: PlayerCoord, combatInitiatorId: string) {
        this.remainingEscapeChances = 2;
        this.combatInitiatorId = combatInitiatorId;
        this.gameController.updateActiveFighter([attacker, defender], attacker.player.id);
        if (this.gameController.isFighter([attacker, defender])) {
            this.timerState = TimerState.COMBAT;
            this.gameController.setFighters([attacker, defender]);
            if (this.gameController.isActivePlayer()) {
                this.mapService.setState(GameState.COMBAT);
                this.remainingActions = 0;
            }
        } else {
            this.timerState = TimerState.NONE;
            this.timeLeft = -1;
        }
    }

    handleChangeCombatTurn(newAttackerId: string) {
        this.gameController.setActivePlayer(newAttackerId);
        if (this.gameController.isInCombat()) {
            if (this.gameController.isActivePlayer()) {
                this.mapService.setState(GameState.COMBAT);
            } else {
                this.mapService.setState(GameState.NOTPLAYING);
            }
        }
    }

    handleEndCombat(newFighters: PlayerCoord[]) {
        this.gameController.updatePlayerCoordsList(newFighters);
        this.mapService.setState(GameState.NOTPLAYING);
        this.timerState = TimerState.REGULAR;
        if (this.gameController.isActivePlayer()) {
            if (this.currentMoveBudget === 0 || this.combatInitiatorId !== this.gameController.playerId) {
                this.gameController.requestEndTurn();
            } else {
                this.mapService.switchToMovingStateRoutine();
            }
        }
        this.gameController.resetFighters();
        this.combatInitiatorId = '';
    }

    handleEndMove(availableMoves: ShortestPathByTile, currentMoveBudget: number, hasSlipped: boolean) {
        this.currentMoveBudget = currentMoveBudget;
        if (hasSlipped) this.endTurn();
        else this.endMovement(availableMoves);
    }

    handleCheckValidAction(availableTiles: number[]) {
        if (availableTiles.length === 0) this.endTurn();
        else if (availableTiles.length > 0) this.mapService.setState(GameState.MOVING);
    }

    handleInteractDoor(isToggable: boolean, doorPosition: number, availableMoves: ShortestPathByTile) {
        if (isToggable) this.mapService.toggleDoor(doorPosition);
        if (this.gameController.isActivePlayer()) {
            this.remainingActions = 0;
            this.endMovement(availableMoves);
        }
    }

    handleAttacked(attacker: PlayerCoord, attackerDice: number, defender: PlayerCoord, defenderDice: number, isAttackSuccessful: boolean) {
        [this.attackerDiceResult, this.defenderDiceResult, this.attackSuccessful] = [attackerDice, defenderDice, isAttackSuccessful];
        this.gameController.updatePlayerCoordsList([attacker, defender]);
    }

    handleKilledPlayer(killer: PlayerCoord, killed: PlayerCoord, killedOldPosition: number) {
        this.gameController.updateActiveFighter([killer, killed], this.combatInitiatorId);
        this.mapService.changePlayerPosition(killedOldPosition, killed.position, killed.player);
        if (this.gameController.isActivePlayer()) {
            if (this.combatInitiatorId === killed.player.id) {
                this.currentMoveBudget = this.gameController.isDebugModeActive ? this.currentMoveBudget : 0;
            } else if (this.combatInitiatorId === killer.player.id) {
                if (this.currentMoveBudget !== -1) {
                    this.gameController.requestAvailableMovesOnBudget(this.currentMoveBudget);
                }
            }
        }
    }

    handleEscaped(remainingEscapeChances: number, hasEscaped: boolean) {
        if (hasEscaped) {
            this.gameController.setActivePlayer(this.combatInitiatorId);
            this.remainingEscapeChances = -1;
        } else if (this.gameController.isActivePlayer()) {
            this.remainingEscapeChances = remainingEscapeChances;
        }
    }

    redirectLastManStanding() {
        this.router.navigate(['/home']);
        this.snackbar.open('Tous les autres joueurs ont quitté la partie', 'Fermer', SNACKBAR_PARAMETERS as MatSnackBarConfig);
    }

    endTurn() {
        if (this.gameController.isActivePlayer()) {
            this.resetPlayerView();
            this.gameController.requestEndTurn();
        }
    }

    updatePlayerPosition(playerId: string, newPlayerPosition: number) {
        const playerCoord = this.gameController.findPlayerCoordById(playerId);
        if (playerCoord) {
            this.mapService.changePlayerPosition(playerCoord.position, newPlayerPosition, playerCoord.player);
            playerCoord.position = newPlayerPosition;
        }
    }

    endMovement(shortestPathByTile: ShortestPathByTile) {
        if (Object.keys(shortestPathByTile).length !== 0) {
            this.mapService.switchToMovingStateRoutine(shortestPathByTile);
        } else if (this.remainingActions !== -1 && this.remainingActions > 0) {
            this.mapService.resetMap();
            this.gameController.requestCheckAction();
        } else {
            this.mapService.resetMovementPrevisualization();
            this.endTurn();
        }
    }

    startAction() {
        if (this.remainingActions === 1 && this.mapService.currentStateNumber === GameState.MOVING) {
            this.gameController.requestStartAction();
        }
    }

    catchSelectCombatAction(combatAction: string) {
        if (this.gameController.isActivePlayer()) {
            this.gameController.requestCombatAction(combatAction);
        }
    }

    resetPlayerView() {
        this.mapService.resetPlayerView();
        this.currentMoveBudget = -1;
        this.remainingActions = -1;
    }

    quitGame() {
        this.router.navigate(['/home']);
        this.snackbar.open('Tous les autres joueurs ont quitté la partie', 'Fermer', SNACKBAR_PARAMETERS as MatSnackBarConfig);
    }
    redirectEndGame(globalStats: GlobalStats, players: Player[], endGameMessage: string) {
        let navData;
        this.gameFinished = true;
        setTimeout(() => {
            navData = {
                roomId: this.gameController.roomId,
                characterName: this.gameController.player.name,
                globalStats,
                players,
            };
            const navDataString = JSON.stringify(navData);
            this.router.navigate(['/gameEnd'], { queryParams: { data: navDataString } });
        }, ENDGAME_DELAY);
        this.snackbar.open(endGameMessage, 'Fermer', SNACKBAR_PARAMETERS as MatSnackBarConfig);
    }

    ngOnDestroy() {
        if (!this.gameFinished) this.socketService.disconnect();
    }
}
