import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { MINUS_ONE, MINUS_TWO, ONE, THREE, TWO, ZERO, ZERO_POINT_ONE } from '@app/services/inventory/inventory-service.utils';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
@Injectable()
export class InventoryService {
    constructor(
        readonly activeGameService: ActiveGamesService,
        readonly logSenderService: LogSenderService,
    ) {}

    handleCombatInventory(player: Player) {
        player.inventory.forEach((item) => {
            if (item === ItemTypes.AC1 || item === ItemTypes.AC2) {
                this.handleItemEffect(item, player, false);
            }
        });
    }

    resetCombatBoost(player: Player) {
        if (player.attributes.isCombatBoostedAttack) {
            this.deactivateCombatBoostAttack(player);
        }
        if (player.attributes.isCombatBoostedDefense) {
            this.deactivateCombatBoostDefense(player);
        }
    }

    handleItemEffect(item: ItemTypes, player: Player, isReset: boolean, server?: Server, roomId?: string) {
        switch (item) {
            case ItemTypes.AA1:
                this.handleAA1Item(player, isReset);
                break;
            case ItemTypes.AA2:
                this.handleAA2Item(player, isReset);
                break;
            case ItemTypes.AC1:
                this.handleAC1Item(player, isReset);
                break;
            case ItemTypes.AC2:
                this.handleAC2Item(player, isReset);
                break;
            case ItemTypes.FLAG_A:
                this.handleFlagItem(server, roomId, player);
                break;
            default:
                break;
        }
    }

    inventoryContainsItem(inventory: ItemTypes[], item: ItemTypes) {
        return inventory.includes(item);
    }

    isInventoryFull(inventory: ItemTypes[]) {
        return inventory.length >= 2;
    }

    handleAA1Item(player: Player, isReset: boolean) {
        player.attributes.defense += 2 * (isReset ? -1 : 1);
    }

    handleAA2Item(player: Player, isReset: boolean) {
        player.attributes.speed += 2 * (isReset ? -1 : 1);
        player.attributes.health -= 1 * (isReset ? -1 : 1);
    }

    handleAC1Item(player: Player, isReset: boolean) {
        if (player.attributes.currentHealth <= 2 && !player.attributes.isCombatBoostedDefense) {
            player.attributes.currentAttack += isReset ? MINUS_TWO : TWO;
            player.attributes.isCombatBoostedAttack = !isReset;
        } else if (isReset) {
            player.attributes.currentAttack -= 2;
            player.attributes.isCombatBoostedAttack = false;
        }
    }

    handleAC2Item(player: Player, isReset: boolean) {
        if (player.attributes.currentHealth <= THREE && !player.attributes.isCombatBoostedDefense) {
            player.attributes.currentDefense += TWO * (isReset ? MINUS_ONE : ONE);
            player.attributes.isCombatBoostedDefense = !isReset;
        } else if (isReset) {
            player.attributes.currentDefense -= 2;
            player.attributes.isCombatBoostedDefense = false;
        }
    }

    handleFlagItem(server: Server, roomId: string, player: Player) {
        this.logSenderService.sendFlagHasBeenPickedUp(server, roomId, player.name);
    }

    getSlippingChance(player: Player): number {
        return player.inventory.includes(ItemTypes.AF1) ? ZERO : ZERO_POINT_ONE;
    }

    hasAF2Item(player: Player): boolean {
        return player.inventory.includes(ItemTypes.AF2);
    }

    deactivateCombatBoostAttack(player: Player) {
        player.attributes.currentAttack -= 2;
        player.attributes.isCombatBoostedAttack = false;
    }

    deactivateCombatBoostDefense(player: Player) {
        player.attributes.currentSpeed -= 2;
        player.attributes.isCombatBoostedDefense = false;
    }

    addToInventoryAndEmit(server: Server, client: Socket, roomId: string, player: PlayerCoord, item: ItemTypes) {
        const inventory = player.player.inventory;

        if (this.isInventoryFull(inventory)) {
            this.emitItemToReplace(server, player, item, roomId);
        } else {
            inventory.push(item);
            this.handleItemEffect(item, player.player, false, server, roomId);
            this.emitNewPlayerInventory(server, roomId, player);
            this.setItemsHeldAttribute(player.player, item);
        }
    }

    setItemsHeldAttribute(player: Player, item: ItemTypes) {
        if (!player.attributes.itemsHeld) {
            player.attributes.itemsHeld = new Set<ItemTypes>();
        }
        player.attributes.itemsHeld.add(item);
        player.stats.uniqueItemsCollected = player.attributes.itemsHeld.size;
    }

    emitItemToReplace(server: Server, player: PlayerCoord, newItem: ItemTypes, roomId: string) {
        // TODO: emit to client to choose item to replace and to visually hide the item
        const activeGame = this.activeGameService.getActiveGame(roomId);
        activeGame.turnTimer.pauseTimer();
        server.to(roomId).emit('itemToReplace', { player, newItem });
    }

    updateInventory(server: Server, playerId: string, allItems: ItemTypes[], droppedItem: ItemTypes, roomId: string) {
        const activeGame = this.activeGameService.getActiveGame(roomId);
        const player = activeGame.playersCoord.find((playerCoord) => playerCoord.player.id === playerId);

        const newInventory = allItems.filter((item) => item !== droppedItem);

        this.activeGameService.getActiveGame(roomId).game.map[player.position].item = droppedItem;

        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player.player, true);
        });

        player.player.inventory = newInventory;
        player.player.inventory.forEach((item) => {
            this.handleItemEffect(item, player.player, false);
        });
        activeGame.turnTimer.resumeTimer();
        this.emitNewPlayerInventory(server, roomId, player, droppedItem);
    }

    emitNewPlayerInventory(server: Server, roomId: string, player: PlayerCoord, dropItem?: ItemTypes) {
        server.to(roomId).emit('newPlayerInventory', { player, dropItem });
    }
}
