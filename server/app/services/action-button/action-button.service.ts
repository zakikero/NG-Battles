import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { TileStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
@Injectable()
export class ActionButtonService {
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(ActionService) private readonly actionService: ActionService,
        @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService,
    ) {}

    getAvailableIndexes(roomId: string, activePlayer: PlayerCoord): number[] {
        const availableIndexes: number[] = [];
        this.getPlayersAround(roomId, activePlayer.position).forEach((opponentPlayer) => {
            availableIndexes.push(opponentPlayer.position);
        });
        this.getDoorsAround(roomId, activePlayer).forEach((door) => {
            availableIndexes.push(door.idx);
        });
        return availableIndexes;
    }

    getPlayersAround(roomId: string, position: number): PlayerCoord[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const mapSize = parseInt(gameInstance.game.mapSize, 10);
        const mapLength = gameInstance.game.map.length;

        const isRightValid = position % mapSize !== mapSize - 1;
        const isLeftValid = position % mapSize !== 0;
        const isUpValid = position - mapSize >= 0;
        const isDownValid = position + mapSize < mapLength;

        const right = isRightValid ? gameInstance.game.map[position + 1].hasPlayer : false;
        const left = isLeftValid ? gameInstance.game.map[position - 1].hasPlayer : false;
        const up = isUpValid ? gameInstance.game.map[position - mapSize].hasPlayer : false;
        const down = isDownValid ? gameInstance.game.map[position + mapSize].hasPlayer : false;

        const players: PlayerCoord[] = [];
        if (right) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position + 1);
            if (player) players.push(player);
        }
        if (left) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - 1);
            if (player) players.push(player);
        }
        if (up) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position - mapSize);
            if (player) players.push(player);
        }
        if (down) {
            const player: PlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.position === position + mapSize);
            if (player) players.push(player);
        }
        return players;
    }

    getDoorsAround(roomId: string, player: PlayerCoord): TileStructure[] {
        const doorsFound: TileStructure[] = [];
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const mapSize = parseInt(gameInstance.game.mapSize, 10);
        const doors: TileTypes[] = [TileTypes.DOOR, TileTypes.DOORCLOSED, TileTypes.DOOROPEN];
        const mapLength = gameInstance.game.map.length;

        if (player.position + 1 < mapLength && player.position % mapSize !== mapSize - 1) {
            if (doors.includes(gameInstance.game.map[player.position + 1].tileType as TileTypes)) {
                doorsFound.push(gameInstance.game.map[player.position + 1]);
            }
        }

        if (player.position - 1 >= 0 && player.position % mapSize !== 0) {
            if (doors.includes(gameInstance.game.map[player.position - 1].tileType as TileTypes)) {
                doorsFound.push(gameInstance.game.map[player.position - 1]);
            }
        }

        if (player.position - mapSize >= 0) {
            if (doors.includes(gameInstance.game.map[player.position - mapSize].tileType as TileTypes)) {
                doorsFound.push(gameInstance.game.map[player.position - mapSize]);
            }
        }

        if (player.position + mapSize < mapLength) {
            if (doors.includes(gameInstance.game.map[player.position + mapSize].tileType as TileTypes)) {
                doorsFound.push(gameInstance.game.map[player.position + mapSize]);
            }
        }

        return doorsFound;
    }

    chosenAction(roomId: string, originalPlayer: PlayerCoord, tileIndex: number): void {
        const map = this.activeGamesService.getActiveGame(roomId).game.map;
        if (map[tileIndex].tileType === TileTypes.DOORCLOSED || map[tileIndex].tileType === TileTypes.DOOROPEN) {
            this.actionService.interactWithDoor(roomId, originalPlayer.player.id, originalPlayer.position);
        } else if (map[tileIndex].hasPlayer) {
            const targetPlayer = this.activeGamesService.getActiveGame(roomId).playersCoord.find((playerCoord) => playerCoord.position === tileIndex);
            const newFighters: PlayerCoord[] = [originalPlayer, targetPlayer];
            this.startCombat(roomId, newFighters);
        }
    }

    startCombat(roomId: string, fighters: PlayerCoord[]): void {
        this.combatService.startCombat(roomId, fighters);
    }
}
