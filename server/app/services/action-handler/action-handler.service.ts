import { HUNDRED_PERCENT, TIME_BETWEEN_MOVES } from '@app/services/action-handler/action-handler.util';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { Player } from '@common/player';
import { ItemTypes, TileTypes } from '@common/tile-types';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
@Injectable()
export class ActionHandlerService {
    // ! It is necessary to have these 3 additional parameters for this constructor, due to the usefulness of this action handler service
    // eslint-disable-next-line max-params
    constructor(
        private movementService: MovementService,
        private action: ActionService,
        private match: MatchService,
        private activeGamesService: ActiveGamesService,
        private inventoryService: InventoryService,
        private debugModeService: DebugModeService,
        @Inject(forwardRef(() => LogSenderService)) private logSenderService: LogSenderService,
        @Inject(forwardRef(() => CombatService)) private combatService: CombatService,
        @Inject(forwardRef(() => VirtualPlayerService)) private virtualPlayerService: VirtualPlayerService,
    ) {}

    async handleGameSetup(server: Server, roomId: string) {
        const gameId = this.match.rooms.get(roomId).gameId;
        const players = this.match.rooms.get(roomId).players;
        await this.activeGamesService.gameSetup(server, roomId, gameId, players);
        const activeGame = this.activeGamesService.getActiveGame(roomId);
        const playerCoord = activeGame.playersCoord;
        if (playerCoord[0].player.isVirtual) {
            this.handleStartTurn({ roomId, playerId: playerCoord[0].player.id }, server, null);
        }
    }

    handleStartTurn(data: { roomId: string; playerId: string }, server: Server, client: Socket) {
        const activeGame = this.activeGamesService.getActiveGame(data.roomId);
        const player = activeGame.playersCoord[activeGame.turn].player;

        activeGame.globalStatsService.incrementTurn();

        activeGame.globalStatsService.incrementTurn();

        activeGame.currentPlayerMoveBudget = player.attributes.speed;
        activeGame.currentPlayerActionPoint = 1;

        if (!player.isVirtual) {
            client.emit('startTurn', {
                shortestPathByTile: this.action.availablePlayerMoves(data.playerId, data.roomId),
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
            });
        }
        this.logSenderService.sendStartTurnLog(server, data.roomId, player);

        if (player.isVirtual) {
            player.actionNumber = 1;
            this.virtualPlayerService.virtualPlayerId = player.id;
            this.virtualPlayerService.roomId = data.roomId;
            this.virtualPlayerService.server = server;
            this.virtualPlayerService.think();
        }
    }

    handleMove(data: { roomId: string; playerId: string; endPosition: number }, server: Server, client: Socket) {
        const playerId = data.playerId;
        const roomId = data.roomId;

        if (!this.action.isCurrentPlayersTurn(roomId, playerId)) return;

        const activeGame = this.activeGamesService.getActiveGame(roomId);
        const player = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        const startPosition = player.position;

        const playerPositions = this.action.movePlayer(roomId, startPosition, data.endPosition);
        const gameMap = activeGame.game.map;
        let iceSlip = false;
        let isItemAddedToInventory = false;

        let pastPosition = startPosition;
        let tileItem = '';

        const slippingChance = this.inventoryService.getSlippingChance(player.player);

        const isDebugMode = this.debugModeService.getDebugMode(data.roomId);

        let ctfWinCondition = false;
        playerPositions.forEach((playerPosition, index) => {
            if (!isDebugMode && gameMap[playerPosition].tileType === TileTypes.ICE && Math.random() < slippingChance) {
                activeGame.currentPlayerMoveBudget = 0;
                iceSlip = true;
            }
            if (index !== 0 && !iceSlip && !isItemAddedToInventory && !ctfWinCondition) {
                this.syncDelay(TIME_BETWEEN_MOVES);
                this.updatePlayerPosition(server, data.roomId, data.playerId, playerPosition);
                activeGame.currentPlayerMoveBudget -= this.movementService.tileValue(gameMap[playerPosition].tileType);
                player.player.stats.visitedTilesPercent =
                    (player.player.stats.visitedTiles.add(playerPosition).size / activeGame.maxNbTiles) * HUNDRED_PERCENT;

                activeGame.game.map[playerPosition].hasPlayer = true;
                activeGame.game.map[pastPosition].hasPlayer = false;
                activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).position = playerPosition;
                pastPosition = playerPosition;

                ctfWinCondition = this.isOnHomePosition(player.player, playerPosition);

                tileItem = gameMap[playerPosition].item;

                if (tileItem === ItemTypes.FLAG_A) this.activeGamesService.getActiveGame(roomId).globalStatsService.addPlayerHeldFlag(player.player);

                if (tileItem !== ItemTypes.EMPTY && tileItem !== ItemTypes.STARTINGPOINT) {
                    this.inventoryService.addToInventoryAndEmit(server, client, roomId, player, tileItem as ItemTypes);
                    gameMap[playerPosition].item = ItemTypes.EMPTY;
                    isItemAddedToInventory = true;
                }
            }
        });

        if (!player.player.isVirtual && !ctfWinCondition) {
            client.emit('endMove', {
                availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
                currentMoveBudget: activeGame.currentPlayerMoveBudget,
                hasSlipped: iceSlip,
            });
        }
        if (ctfWinCondition) this.action.endGame(roomId, server, player);
    }

    isOnHomePosition(player: Player, position: number): boolean {
        return player.inventory.includes(ItemTypes.FLAG_A) && position === player.homePosition;
    }

    handleEndTurn(data: { roomId: string; playerId: string; lastTurn: boolean }, server: Server) {
        const roomId = data.roomId;
        const activeGame = this.activeGamesService.getActiveGame(roomId);

        activeGame.turnTimer.resetTimer();
        activeGame.turnTimer.startTimer();

        if (this.action.isCurrentPlayersTurn(roomId, data.playerId)) {
            this.action.nextTurn(roomId, data.lastTurn);

            if (activeGame.playersCoord.length > 0) {
                server.to(roomId).emit('endTurn', activeGame.playersCoord[activeGame.turn].player.id);
            }

            if (activeGame.playersCoord[activeGame.turn].player.isVirtual) {
                this.handleStartTurn({ roomId, playerId: activeGame.playersCoord[activeGame.turn].player.id }, server, null);
            }
        }
    }

    handleInteractDoor(data: { roomId: string; playerId: string; doorPosition: number }, server: Server) {
        const roomId = data.roomId;
        const doorPosition = data.doorPosition;
        const activeGame = this.activeGamesService.getActiveGame(roomId);

        const remainingActionPoints = activeGame.currentPlayerActionPoint;
        const map = activeGame.game.map;

        if (remainingActionPoints <= 0) return;

        const isToggable = this.action.interactWithDoor(roomId, data.playerId, data.doorPosition);
        server.to(roomId).emit('interactDoor', {
            isToggable,
            doorPosition,
            availableMoves: this.action.availablePlayerMoves(data.playerId, roomId),
        });

        const player = this.activeGamesService
            .getActiveGame(roomId)
            .playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId).player;

        this.logSenderService.sendDoorInteractionLog(server, roomId, player, map[doorPosition].tileType as TileTypes);
    }

    handleQuitGame(server: Server, client: Socket) {
        const playerId = client.id;
        const activeGame = this.activeGamesService.getActiveGameByPlayerId(playerId);
        if (!activeGame) return;

        const roomId = activeGame.roomId;
        const player = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId).player;

        this.combatService.disperseKilledPlayerObjects(
            server,
            activeGame.roomId,
            activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId),
        );

        this.logSenderService.sendQuitGameLog(server, roomId, player);

        const activePlayerId = activeGame.playersCoord[activeGame.turn].player.id;
        if (this.combatService.fightersMap.get(roomId)) {
            const fighters = this.combatService.fightersMap.get(roomId);
            fighters.forEach((fighter) => {
                if (fighter.player.id === playerId) {
                    this.combatService.killPlayer(roomId, fighter, server);
                }
            });
        }

        if (activePlayerId === playerId) {
            this.handleEndTurn({ roomId, playerId, lastTurn: true }, server);
        } else {
            this.action.quitGame(roomId, playerId);
        }

        server.to(roomId).emit('quitGame', playerId);

        if (activeGame.playersCoord.length === 1) {
            this.logSenderService.sendEndGameLog(server, roomId, activeGame.playersCoord[0].player.name);

            server.to(roomId).emit('lastManStanding');

            this.activeGamesService.removeGameInstance(roomId);
        }
    }

    handleGetAvailableMovesOnBudget(data: { roomId: string; playerId: string; currentBudget: number }, client: Socket) {
        client.emit('availableMovesOnBudget', this.action.availablePlayerMovesOnBudget(data.playerId, data.roomId, data.currentBudget));
    }

    updatePlayerPosition(server: Server, roomId: string, playerId: string, newPlayerPosition: number) {
        server.to(roomId).emit('playerPositionUpdate', {
            playerId,
            newPlayerPosition,
        });
    }

    syncDelay(ms: number) {
        const end = Date.now() + ms;
        while (Date.now() < end) continue;
    }
}
