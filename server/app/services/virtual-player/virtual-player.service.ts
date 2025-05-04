import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { MovementService } from '@app/services/movement/movement.service';
import { GameStructure, TileStructure } from '@common/game-structure';
import { PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AGGRESSIVE_PRIORITY_ITEMS, DEFENSIVE_PRIORITY_ITEMS, RANDOM_MOVE_CHANCE } from './constants';

@Injectable()
export class VirtualPlayerService {
    virtualPlayerId: string;
    roomId: string;
    server: Server;
    shouldEndTurn: boolean;
    itemPriorities: string[];

    /* max-params disabled because the virtual player service needs to be able to access all of these services
    as it needs to be able to interact with the game */
    // eslint-disable-next-line max-params
    constructor(
        @Inject(forwardRef(() => ActionHandlerService)) private readonly actionHandler: ActionHandlerService,
        @Inject(forwardRef(() => CombatHandlerService)) private readonly combatHandlerService: CombatHandlerService,
        @Inject(forwardRef(() => ActionButtonService)) private readonly actionButtonService: ActionButtonService,
        private readonly inventoryService: InventoryService,
        private readonly actionService: ActionService,
        private readonly activeGamesService: ActiveGamesService,
        private readonly movementService: MovementService,
    ) {}

    afterInit(server: Server) {
        this.server = server;
    }

    async think() {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        this.shouldEndTurn = true;
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const virtualPlayerPosition = virtualPlayerCoord.position;

        await this.waitRandomTime();

        if (this.isDefensive()) {
            this.defensiveThink(virtualPlayerPosition);
        } else {
            this.aggressiveThink(virtualPlayerPosition);
        }

        if (this.activeGamesService.getActiveGame(this.roomId) && this.shouldEndTurn) {
            this.actionHandler.handleEndTurn({ roomId: this.roomId, playerId: this.virtualPlayerId, lastTurn: false }, this.server);
        }
    }

    defensiveThink(position: number) {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;

        if (Math.random() < RANDOM_MOVE_CHANCE) {
            this.randomMove();
            return;
        }
        if (!this.moveToItems()) {
            let nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
            if (nearbyPlayers.length > 0) {
                const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
                if (this.canDoAction(this.virtualPlayerId)) {
                    this.startAttack(randomPlayerCoord);
                }
                return;
            }
            if (this.moveToPlayers()) {
                const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
                const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
                const newVirtualPlayerPosition = virtualPlayerCoord.position;
                nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, newVirtualPlayerPosition);
                const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
                if (this.canDoAction(this.virtualPlayerId)) {
                    this.startAttack(randomPlayerCoord);
                }
            } else {
                this.randomMove();
                return;
            }
        }
    }

    aggressiveThink(position: number) {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;

        if (Math.random() < RANDOM_MOVE_CHANCE) {
            this.randomMove();
            return;
        }
        // check if there are players nearby without having to move
        let nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, position);
        if (nearbyPlayers.length > 0 && this.canDoAction(this.virtualPlayerId)) {
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            this.startAttack(randomPlayerCoord);
            return;
        } else if (!this.moveToPlayers()) {
            if (!this.moveToItems()) this.randomMove();
        } else {
            const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
            const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
            const newVirtualPlayerPosition = virtualPlayerCoord.position;
            nearbyPlayers = this.actionButtonService.getPlayersAround(this.roomId, newVirtualPlayerPosition);
            if (nearbyPlayers.length === 0) return;
            const randomPlayerCoord = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
            if (this.canDoAction(this.virtualPlayerId)) {
                this.startAttack(randomPlayerCoord);
            }
        }
    }

    // decides if VP attacks or escapes
    async fight(attacked: boolean) {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        await this.waitRandomTime();
        if (this.isDefensive() && attacked) {
            this.combatHandlerService.handleCombatEscape(this.roomId, this.virtualPlayerId, this.server);
        } else {
            this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
        }
    }

    async waitRandomTime() {
        // used magic numbers to generate a random time between 1 and 3 seconds
        /* eslint-disable-next-line @typescript-eslint/no-magic-numbers */
        const waitTime = Math.floor(Math.random() * 2000) + 1000;
        return new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    isDefensive() {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const profile = virtualPlayerCoord.player.virtualProfile;
        this.itemPriorities = profile === 'defensive' ? DEFENSIVE_PRIORITY_ITEMS : AGGRESSIVE_PRIORITY_ITEMS;
        return profile === 'defensive';
    }

    randomMove() {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) return;
        const position = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId).position;
        const adjacentTiles = this.getAdjacentTiles(position);
        const doorPosition = adjacentTiles.find((tileIdx) => gameInstance.game.map[tileIdx].tileType === 'doorClosed');
        if (doorPosition !== undefined) {
            this.interactWithDoor(doorPosition);
        }
        const availablePlayerMoves = this.actionService.availablePlayerMoves(this.virtualPlayerId, this.roomId);
        const accessibleTiles = Object.keys(availablePlayerMoves).map(Number);
        const endPosition = accessibleTiles[Math.floor(Math.random() * accessibleTiles.length)];
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition }, this.server, null);
    }

    startAttack(targetPlayerCoord: PlayerCoord) {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;
        this.shouldEndTurn = false;
        if (this.canDoAction(this.virtualPlayerId)) {
            this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, targetPlayerCoord.position, null, this.server);
            this.combatHandlerService.handleCombatAttack(this.roomId, this.virtualPlayerId, this.server);
            this.useActionNumber(this.virtualPlayerId);
        } else {
            this.randomMove();
        }
    }

    moveToItems() {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);

        const gameStructureOpenedDoors = this.openAllDoors(gameInstance.game);
        const pathsToItems = this.findPathsToItems(gameStructureOpenedDoors, virtualPlayerCoord.position, gameInstance.currentPlayerMoveBudget);

        const validPaths = pathsToItems.filter((path) => path[0].length !== 0);
        if (validPaths.length === 0) {
            return false;
        }

        validPaths.sort((a, b) => {
            const itemA = a[1];
            const itemB = b[1];
            const priorityA = this.itemPriorities.indexOf(itemA);
            const priorityB = this.itemPriorities.indexOf(itemB);
            return priorityA - priorityB;
        });

        const chosenItem = validPaths[0];
        const chosenItemPath = chosenItem[0];
        const chosenItemName = chosenItem[1];

        let lowestPriorityItem;
        let willReplaceItem = false;
        const inventory = virtualPlayerCoord.player.inventory;
        if (this.inventoryService.isInventoryFull(inventory)) {
            lowestPriorityItem = this.findLowestPriorityItem(inventory, this.itemPriorities);
            if (this.itemPriorities.indexOf(chosenItemName) < this.itemPriorities.indexOf(lowestPriorityItem)) {
                willReplaceItem = true;
            } else {
                return false;
            }
        }

        this.moveThroughDoors(virtualPlayerCoord.position, chosenItemPath, gameInstance.game.map);

        if (willReplaceItem) {
            this.replaceItem(lowestPriorityItem, chosenItemName);
        }
        return true;
    }

    moveToPlayers() {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);

        const gameStructureOpenedDoors = this.openAllDoors(gameInstance.game);
        const pathsToPlayers = this.findPathsToPlayers(gameStructureOpenedDoors, virtualPlayerCoord.position, gameInstance.currentPlayerMoveBudget);

        const validPaths = pathsToPlayers.filter((path) => path.length !== 0);
        if (validPaths.length === 0) {
            return false;
        }

        validPaths.sort((a, b) => a.length - b.length);
        const chosenPlayerPath = validPaths[0];

        this.moveThroughDoors(virtualPlayerCoord.position, chosenPlayerPath, gameInstance.game.map);
        return true;
    }

    findPathsToPlayers(gameStructure: GameStructure, startPosition: number, budget: number) {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;

        const pathsToPlayers = [];
        const adjacentTiles = this.getAdjacentTiles(startPosition);

        gameStructure.map.forEach((tile) => {
            if (
                tile.tileType !== 'wall' &&
                tile.idx !== startPosition &&
                !adjacentTiles.includes(tile.idx) &&
                this.actionButtonService.getPlayersAround(this.roomId, tile.idx).length > 0
            ) {
                const player = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
                pathsToPlayers.push(player.path);
            }
        });
        return pathsToPlayers;
    }

    findPathsToItems(gameStructure: GameStructure, startPosition: number, budget: number) {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;
        const pathsToItems = [];
        gameStructure.map.forEach((tile) => {
            if (tile.item !== '' && tile.item !== 'startingPoint') {
                const item = this.movementService.shortestPath(budget, gameStructure, startPosition, tile.idx);
                pathsToItems.push([item.path, tile.item]);
            }
        });
        return pathsToItems;
    }

    getAdjacentTiles(position: number) {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const mapSize = parseInt(gameInstance.game.mapSize, 10);
        const mapLength = gameInstance.game.map.length;

        const isRightValid = position % mapSize !== mapSize - 1;
        const isLeftValid = position % mapSize !== 0;
        const isUpValid = position - mapSize >= 0;
        const isDownValid = position + mapSize < mapLength;

        const adjacentTiles = [];

        if (isRightValid) adjacentTiles.push(position + 1);
        if (isLeftValid) adjacentTiles.push(position - 1);
        if (isUpValid) adjacentTiles.push(position - mapSize);
        if (isDownValid) adjacentTiles.push(position + mapSize);

        return adjacentTiles;
    }

    // this is necessary since the shortest path function does not take into account closed doors
    openAllDoors(game: GameStructure): GameStructure {
        const gameStructureOpenedDoors = JSON.parse(JSON.stringify(game)) as GameStructure;
        gameStructureOpenedDoors.map.forEach((tile) => {
            if (tile.tileType === 'doorClosed') {
                tile.tileType = 'doorOpen';
            }
        });
        return gameStructureOpenedDoors;
    }

    findLowestPriorityItem(inventory: string[], itemPriorities: string[]): string {
        let lowestPriorityItem = inventory[0];
        for (let i = 1; i < inventory.length; i++) {
            if (itemPriorities.indexOf(inventory[i]) > itemPriorities.indexOf(lowestPriorityItem)) {
                lowestPriorityItem = inventory[i];
            }
        }
        return lowestPriorityItem;
    }

    moveThroughDoors(startPosition: number, path: number[], map: TileStructure[]): void {
        if (!this.activeGamesService.getActiveGame(this.roomId)) return;
        const doorIndexes = map.filter((tile) => tile.tileType === 'doorClosed').map((tile) => tile.idx);
        const doorsToOpen = [];

        let lastIndexBeforeDoor = startPosition;
        for (const index of path) {
            if (doorIndexes.includes(index)) {
                doorsToOpen.push([lastIndexBeforeDoor, index]);
            } else {
                lastIndexBeforeDoor = index;
            }
        }

        doorsToOpen.forEach((doorCoords) => {
            this.moveToDoor(doorCoords[0]); // move to tile before door
            if (!this.canDoAction(this.virtualPlayerId)) return;
            this.interactWithDoor(doorCoords[1]); // open door
        });
        // move to item after all doors are opened
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: path[path.length - 1] }, this.server, null);
    }

    replaceItem(droppedItem, collectedItem: ItemTypes) {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === this.virtualPlayerId);
        const allItems = [...virtualPlayerCoord.player.inventory, collectedItem];
        this.inventoryService.updateInventory(this.server, this.virtualPlayerId, allItems, droppedItem, this.roomId);
    }

    moveToDoor(tileBeforeDoor: number) {
        this.actionHandler.handleMove({ roomId: this.roomId, playerId: this.virtualPlayerId, endPosition: tileBeforeDoor }, this.server, null);
    }

    interactWithDoor(doorPosition: number) {
        this.combatHandlerService.handleAction(this.roomId, this.virtualPlayerId, doorPosition, null, this.server);
        this.useActionNumber(this.virtualPlayerId);
    }

    canDoAction(playerId: string): boolean {
        const virtualPlayer = this.activeGamesService.activeGames
            .find((instance) => instance.roomId === this.roomId)
            .playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        if (virtualPlayer.player.actionNumber > 0) {
            return true;
        } else {
            return false;
        }
    }

    useActionNumber(playerId: string): void {
        const gameInstance = this.activeGamesService.activeGames.find((instance) => instance.roomId === this.roomId);
        if (!gameInstance) {
            return;
        }
        const virtualPlayerCoord = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);
        virtualPlayerCoord.player.actionNumber = 0;
    }

    handleVirtualPlayerTurn(roomId: string, virtualPlayerId: string) {
        this.actionHandler.handleEndTurn({ roomId, playerId: virtualPlayerId, lastTurn: false }, this.server);
    }
}
