import { Injectable } from '@angular/core';
import { DELAY } from '@app/pages/game-page/constant';
import { SocketService } from '@app/services/socket.service';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';

@Injectable()
export class GameControllerService {
    activePlayer: Player;
    player: Player;
    playerCoords: PlayerCoord[];
    afklist: PlayerCoord[] = [];
    roomId: string;
    playerId: string;
    turn: number = 0;
    fighters: PlayerCoord[] = [];
    isDebugModeActive = false;

    constructor(private readonly socketService: SocketService) {}

    setRoom(roomId: string, playerId: string): void {
        this.roomId = roomId;
        this.playerId = playerId;
    }

    initializePlayers(playerCoords: PlayerCoord[], turn: number) {
        this.playerCoords = playerCoords;
        for (const playerCoord of this.playerCoords) {
            if (playerCoord.player.id === this.playerId) {
                this.player = playerCoord.player;
                // player.inventory should be initialized on server side
                this.player.inventory = [ItemTypes.EMPTY, ItemTypes.EMPTY];
                break;
            }
        }
        this.activePlayer = this.playerCoords[turn].player; // the array playerCoords is set in order of player turns
    }

    updatePlayerCoords(playerCoord: PlayerCoord): void {
        const index = this.playerCoords.findIndex((coord) => coord.player.id === playerCoord.player.id);
        if (index !== -1) {
            this.playerCoords[index] = playerCoord;
        }
    }

    updatePlayer(playerCoord: PlayerCoord): void {
        if (this.player.id === playerCoord.player.id) {
            this.player = playerCoord.player;
        }
    }

    updatePlayerCoordsList(playerCoords: PlayerCoord[]): void {
        playerCoords.forEach((playerCoord) => {
            this.updatePlayerCoords(playerCoord);
            this.updatePlayer(playerCoord);
        });
    }

    getPlayerCoords(): PlayerCoord[] {
        return this.playerCoords;
    }

    findPlayerCoordById(playerId: string): PlayerCoord | undefined {
        return this.playerCoords.find((playerCoord) => playerCoord.player.id === playerId);
    }

    setActivePlayer(activePlayerId: string): void {
        const activePlayer = this.findPlayerCoordById(activePlayerId)?.player;
        if (activePlayer) {
            this.activePlayer = activePlayer;
        }
    }

    isActivePlayer(): boolean {
        return this.activePlayer.id === this.player.id;
    }

    removePlayerFromPlayerCoord(playerId: string): void {
        this.playerCoords = this.playerCoords.filter((playerCoord) => playerCoord.player.id !== playerId);
    }

    feedAfkList(afkPlayerId: string): void {
        const afkPlayerCoord = this.findPlayerCoordById(afkPlayerId);
        if (afkPlayerCoord) {
            this.afklist.push(afkPlayerCoord);
            this.removePlayerFromPlayerCoord(afkPlayerId);
        }
    }

    setFighters(fighters: PlayerCoord[]): void {
        this.fighters = fighters;
    }

    resetFighters(): void {
        this.fighters = [];
    }

    isFighter(fighters: PlayerCoord[]): boolean {
        return fighters.some((fighter) => fighter.player.id === this.player.id);
    }

    isInCombat(): boolean {
        return this.fighters.length > 0;
    }

    updateActiveFighter(playerCoords: PlayerCoord[], playerId: string): void {
        this.updatePlayerCoordsList(playerCoords);
        this.setActivePlayer(playerId);
    }

    requestGameSetup(): void {
        setTimeout(() => {
            this.socketService.emit('gameSetup', this.roomId);
        }, DELAY);
    }

    requestStartTurn(): void {
        if (this.activePlayer.id === this.player.id) {
            this.socketService.emit('startTurn', { roomId: this.roomId, playerId: this.player.id });
        }
    }

    requestMove(endPosition: number): void {
        this.socketService.emit('move', { roomId: this.roomId, playerId: this.player.id, endPosition });
    }

    requestEndTurn(lastTurn: boolean = false): void {
        this.socketService.emit('endTurn', { roomId: this.roomId, playerId: this.player.id, lastTurn });
    }

    requestStartAction(): void {
        if (this.activePlayer.id === this.player.id) {
            this.socketService.emit('startAction', { roomId: this.roomId, playerId: this.player.id });
        }
    }

    requestCheckAction(): void {
        this.socketService.emit('checkAction', { roomId: this.roomId, playerId: this.player.id });
    }

    requestAction(target: number): void {
        this.socketService.emit('action', { roomId: this.roomId, playerId: this.player.id, target });
    }

    requestCombatAction(combatAction: string): void {
        this.socketService.emit(combatAction, { roomId: this.roomId, playerId: this.player.id });
    }

    requestAvailableMovesOnBudget(currentBudget: number): void {
        this.socketService.emit('getAvailableMovesOnBudget', { roomId: this.roomId, playerId: this.player.id, currentBudget });
    }

    requestDebugMode(): void {
        this.socketService.emit('requestDebugMode', { roomId: this.roomId, playerId: this.player.id });
    }

    turnOffDebugMode(): void {
        this.socketService.emit('turnOffDebugMode', { roomId: this.roomId, playerId: this.player.id });
    }

    requestUpdateInventory(allItems: ItemTypes[], droppedItem: ItemTypes): void {
        this.socketService.emit('updateInventory', { roomId: this.roomId, playerId: this.player.id, allItems, droppedItem });
    }

    requestTeleport(index: number): void {
        this.socketService.emit('teleportPlayer', { roomId: this.roomId, playerId: this.player.id, index });
    }
}
