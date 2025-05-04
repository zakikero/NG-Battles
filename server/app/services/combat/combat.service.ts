import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import {
    ATTACKER_INDEX,
    BOOSTED_BONUS_DICE,
    COMBAT_FIGHTERS_NUMBER,
    COUNTER_INITIATOR,
    DEFAULT_ESCAPE_TOKENS,
    DEFENDER_INDEX,
    ESCAPE_PROBABILITY,
    ICE_PENALTY,
    LEFT_TILE,
    MINIMAL_BONUS_DICE,
    RIGHT_TILE,
    SUCCESSFUL_ATTACK_DAMAGE,
    THROW_DICE_MIN,
    THROW_DICE_RANDOM_CHANCE,
    WINS_TO_WIN,
} from '@app/services/combat/constants';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { CombatAction } from '@common/combat-actions';
import { PlayerAttribute, PlayerCoord } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class CombatService {
    fightersMap: Map<string, PlayerCoord[]> = new Map(); // room id and fighters
    private currentTurnMap: Map<string, number> = new Map(); // Track current turn index by roomId
    constructor(
        @Inject(ActiveGamesService) private readonly activeGamesService: ActiveGamesService,
        @Inject(DebugModeService) private readonly debugModeService: DebugModeService,
        @Inject(forwardRef(() => VirtualPlayerService)) private readonly virtualPlayerService: VirtualPlayerService,
        @Inject(InventoryService) private readonly inventoryService: InventoryService,
        @Inject(LogSenderService) private readonly logSender: LogSenderService,
    ) {}

    isPlayerInCombat(roomId: string, player: PlayerCoord): boolean {
        const fighters = this.fightersMap.get(roomId);
        return fighters ? fighters.some((fighter) => fighter.player.id === player.player.id) : false;
    }

    getFighters(roomId: string): PlayerCoord[] {
        return this.fightersMap.get(roomId);
    }

    startCombat(roomId: string, fighters: PlayerCoord[]): PlayerCoord[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.turnTimer.pauseTimer();
        if (fighters.length === COMBAT_FIGHTERS_NUMBER) {
            fighters.forEach((fighter) => {
                if (fighter.player.attributes.currentHealth === undefined) fighter.player.attributes.currentHealth = fighter.player.attributes.health;
                if (fighter.player.attributes.currentAttack === undefined) fighter.player.attributes.currentAttack = fighter.player.attributes.attack;
                if (fighter.player.attributes.currentDefense === undefined)
                    fighter.player.attributes.currentDefense = fighter.player.attributes.defense;
                if (fighter.player.attributes.currentSpeed === undefined) fighter.player.attributes.currentSpeed = fighter.player.attributes.speed;
                this.applyIceDisadvantage(roomId, fighter);
            });
            this.fightersMap.set(roomId, fighters);
            this.setEscapeTokens(roomId);
            gameInstance.combatTimer.startTimer(true);
            const firstPlayer = this.whoIsFirstPlayer(roomId);
            const secondPlayer = fighters.find((f) => f.player.id !== firstPlayer.player.id);
            firstPlayer.player.stats.combatCount++;
            const firstPlayerIndex = fighters.findIndex((f) => f.player.id === firstPlayer.player.id);
            this.currentTurnMap.set(roomId, firstPlayerIndex);
            return [firstPlayer, secondPlayer];
        }
    }

    endCombat(roomId: string, server: Server, player?: PlayerCoord): PlayerCoord[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.combatTimer.resetTimer();
        const fighters = this.fightersMap.get(roomId);
        if (fighters.length !== 0) {
            fighters.forEach((fighter) => {
                this.resetHealth(fighter);
            });
        }
        this.fightersMap.delete(roomId);
        this.currentTurnMap.delete(roomId);
        if (player && player.player.wins === WINS_TO_WIN) {
            this.logSender.sendEndGameLog(server, roomId, player.player.name);
            const globalStats = this.activeGamesService.getActiveGame(roomId).globalStatsService.getFinalStats();
            const allPlayers = this.activeGamesService.getActiveGame(roomId).playersCoord.map((playerCoord) => playerCoord.player);
            server.to(roomId).emit('endGame', { globalStats, players: allPlayers, endGameMessage: `${player.player.name} a gagné la partie` });
            return;
        }
        gameInstance.turnTimer.resumeTimer();
        server.to(roomId).emit('endCombat', fighters);
        return fighters;
    }

    whoIsFirstPlayer(roomId: string): PlayerCoord {
        const currentFighters = this.fightersMap.get(roomId);
        return currentFighters[ATTACKER_INDEX].player.attributes.speed >= currentFighters[DEFENDER_INDEX].player.attributes.speed
            ? currentFighters[ATTACKER_INDEX]
            : currentFighters[DEFENDER_INDEX];
    }

    applyIceDisadvantage(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerOnIce(roomId, player)) {
            player.player.attributes.currentAttack -= ICE_PENALTY;
            player.player.attributes.currentDefense -= ICE_PENALTY;
        }
    }

    setEscapeTokens(roomId: string): void {
        if (this.fightersMap.get(roomId).length === COMBAT_FIGHTERS_NUMBER) {
            this.fightersMap.get(roomId).forEach((fighter) => {
                fighter.player.attributes.escape = DEFAULT_ESCAPE_TOKENS;
            });
        }
    }

    escape(roomId: string, player: PlayerCoord): [PlayerAttribute['escape'], boolean] {
        if (this.getCurrentTurnPlayer(roomId)?.player.id !== player.player.id || player.player.attributes.escape < 1)
            return [player.player.attributes.escape, false];
        const canPlayerEscape = this.canPlayerEscape(roomId, player);
        if (this.isPlayerInCombat(roomId, player) && !canPlayerEscape) {
            player.player.attributes.escape--;
            this.endCombatTurn(roomId, player);
            return [player.player.attributes.escape, false];
        } else if (this.isPlayerInCombat(roomId, player) && canPlayerEscape) {
            player.player.attributes.escape--;
            player.player.stats.escapeCount++;
            return [player.player.attributes.escape, true];
        }
    }

    setWinner(roomId: string, player: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, player)) {
            player.player.wins++;
            player.player.stats.victoryCount++;
        }
    }

    startCombatTurn(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const hasEscape = player.player.attributes.escape > 0;
        gameInstance.combatTimer.startTimer(hasEscape);
        const currentPlayerTurnIndex = this.fightersMap.get(roomId).findIndex((fighter) => fighter.player.id === player.player.id);
        this.currentTurnMap.set(roomId, currentPlayerTurnIndex);
    }

    startCombatAction(roomId: string, player: PlayerCoord, combatAction: CombatAction, server: Server): void {
        if (combatAction === CombatAction.ATTACK) {
            const defender = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
            this.attack(roomId, player, defender, server);
        } else if (combatAction === CombatAction.ESCAPE) this.escape(roomId, player);
    }

    endCombatTurn(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        gameInstance.combatTimer.resetTimer();
        if (!this.isPlayerInCombat(roomId, player)) return;
        const currentTurnIndex = this.currentTurnMap.get(roomId);
        const newTurnIndex = (currentTurnIndex + 1) % COMBAT_FIGHTERS_NUMBER;
        this.currentTurnMap.set(roomId, newTurnIndex);
    }

    getCurrentTurnPlayer(roomId: string): PlayerCoord | undefined {
        const fighters = this.fightersMap.get(roomId);
        const currentTurnIndex = this.currentTurnMap.get(roomId) || ATTACKER_INDEX;
        return fighters?.[currentTurnIndex];
    }

    checkAttackSuccessful(attacker: PlayerCoord, defender: PlayerCoord, roomId: string): [boolean, number[]] {
        let bonusAttackDice: number = BOOSTED_BONUS_DICE;
        let bonusDefenseDice: number = MINIMAL_BONUS_DICE;
        let attackerRoll: number;
        let defenderRoll: number;
        if (attacker.player.attributes.dice === 'attack') bonusAttackDice = BOOSTED_BONUS_DICE;
        else if (defender.player.attributes.dice === 'defense') bonusDefenseDice = BOOSTED_BONUS_DICE;
        if (this.debugModeService.getDebugMode(roomId)) {
            attackerRoll = bonusAttackDice;
            defenderRoll = bonusDefenseDice;
        } else {
            attackerRoll = this.throwDice(bonusAttackDice, attacker);
            defenderRoll = this.throwDice(bonusDefenseDice, defender);
        }
        const isAttackSuccessful = attacker.player.attributes.currentAttack + attackerRoll > defender.player.attributes.currentDefense + defenderRoll;
        return [isAttackSuccessful, [attackerRoll, defenderRoll]];
    }

    attack(roomId: string, attackPlayer: PlayerCoord, defensePlayer: PlayerCoord, server: Server): [number, number, string, PlayerCoord, boolean] {
        if (this.isPlayerInCombat(roomId, attackPlayer) && this.isPlayerInCombat(roomId, defensePlayer)) {
            const checkAttack = this.checkAttackSuccessful(attackPlayer, defensePlayer, roomId);
            if (checkAttack[0]) {
                defensePlayer.player.attributes.currentHealth -= SUCCESSFUL_ATTACK_DAMAGE;
                if (defensePlayer.player.attributes.currentHealth <= 0) {
                    const [playerKiller, playerKilled] = this.killPlayer(roomId, defensePlayer, server);
                    this.inventoryService.resetCombatBoost(playerKiller.player);
                    this.inventoryService.resetCombatBoost(playerKilled.player);
                    this.logSender.sendKillLog(server, roomId, playerKiller.player, playerKilled.player);
                    if (playerKiller.player.isVirtual) {
                        this.virtualPlayerService.roomId = roomId;
                        this.virtualPlayerService.virtualPlayerId = playerKiller.player.id;
                        this.virtualPlayerService.server = server;
                        this.virtualPlayerService.think();
                    } else if (playerKilled.player.isVirtual) {
                        const activeGame = this.activeGamesService.getActiveGame(roomId);
                        if (activeGame.playersCoord[activeGame.turn].player.id === playerKilled.player.id)
                            this.virtualPlayerService.handleVirtualPlayerTurn(roomId, playerKilled.player.id);
                    }
                    return [checkAttack[1][0], checkAttack[1][1], 'combatEnd', defensePlayer, checkAttack[0]];
                }
            }
            this.logSender.sendAttackActionLog(
                server,
                roomId,
                attackPlayer.player,
                defensePlayer.player,
                checkAttack[1][0],
                checkAttack[1][1],
                checkAttack[0],
            );
            this.endCombatTurn(roomId, attackPlayer);
            return [checkAttack[1][0], checkAttack[1][1], 'combatTurnEnd', defensePlayer, checkAttack[0]];
        }
        return [-1, -1, 'playerNotInCombat', defensePlayer, false];
    }

    resetAllAttributes(roomId: string, fighter: PlayerCoord): void {
        if (this.isPlayerInCombat(roomId, fighter)) {
            this.resetHealth(fighter);
            this.resetAttack(fighter);
            this.resetDefense(fighter);
            this.resetSpeed(fighter);
        }
    }

    killPlayer(roomId: string, player: PlayerCoord, server: Server): [PlayerCoord, PlayerCoord, PlayerCoord[]] {
        const playerKilled: PlayerCoord = player;
        const playerKiller: PlayerCoord = this.fightersMap.get(roomId).find((fighter) => fighter.player.id !== player.player.id);
        const killedOldPosition = playerKilled.position;
        if (playerKiller && playerKilled) {
            this.setWinner(roomId, playerKiller);
            this.resetAllAttributes(roomId, playerKilled);
            this.resetAllAttributes(roomId, playerKiller);
            this.disperseKilledPlayerObjects(server, roomId, playerKilled);
            playerKilled.player.inventory = [];
            this.teleportPlayerToHome(roomId, playerKilled);
            server.to(roomId).emit('killedPlayer', {
                killer: playerKiller,
                killed: playerKilled,
                killedOldPosition,
            });
            const fighters = this.endCombat(roomId, server, playerKiller);
            playerKilled.player.stats.defeatCount++;
            return [playerKiller, playerKilled, fighters];
        }
        return [null, null, []];
    }

    disperseKilledPlayerObjects(server: Server, roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const position = player.position;
        const possiblePositions = this.verifyPossibleObjectsPositions(roomId, position);
        const itemsPositions: { idx: number; item: string }[] = [];
        player.player.inventory.forEach((item) => {
            const randomIndex = Math.floor(Math.random() * possiblePositions.length);
            const randomPosition = position + possiblePositions[randomIndex];
            game.map[randomPosition].item = item;
            possiblePositions.splice(randomIndex, 1);
            itemsPositions.push({ idx: randomPosition, item });
        });

        this.emitDisperseItemsKilledPlayer(server, roomId, itemsPositions);
    }

    emitDisperseItemsKilledPlayer(server: Server, roomId: string, itemsPositions: { idx: number; item: string }[]): void {
        server.to(roomId).emit('disperseItems', itemsPositions);
    }

    teleportPlayerToHome(roomId: string, player: PlayerCoord): void {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        game.map[player.position].hasPlayer = false;
        const playerHomePosition = player.player.homePosition;
        if (game.map[playerHomePosition].hasPlayer === false) {
            player.position = playerHomePosition;
            game.map[playerHomePosition].hasPlayer = true;
        } else {
            const verifiedPositions = this.verifyPossibleObjectsPositions(roomId, playerHomePosition);
            const randomIndex = Math.floor(Math.random() * verifiedPositions.length);
            player.position = playerHomePosition + verifiedPositions[randomIndex];
            game.map[player.position].hasPlayer = true;
        }
    }

    private throwDice(diceSize: number, fighter: PlayerCoord): number {
        if (this.inventoryService.hasAF2Item(fighter.player)) return Math.random() > THROW_DICE_RANDOM_CHANCE ? diceSize : THROW_DICE_MIN;
        else return Math.floor(Math.random() * diceSize) + THROW_DICE_MIN;
    }

    // ! this verification logic is complex by nature, and cutting it down would make it less readable
    // eslint-disable-next-line complexity
    private verifyPossibleObjectsPositions(roomId: string, position: number): number[] {
        const gameInstance = this.activeGamesService.getActiveGame(roomId);
        const game = gameInstance.game;
        const mapSize = parseInt(game.mapSize, 10);
        const verifiedPositions = [];
        const mapLength = gameInstance.game.map.length;
        let scaleIterator = COUNTER_INITIATOR;
        while (verifiedPositions.length < 2) {
            scaleIterator++;
            if (position % mapSize < mapSize) {
                if (
                    game.map[position + RIGHT_TILE * scaleIterator].tileType !== TileTypes.WALL &&
                    game.map[position + RIGHT_TILE * scaleIterator].tileType !== TileTypes.DOORCLOSED &&
                    game.map[position + RIGHT_TILE * scaleIterator].hasPlayer === false
                ) {
                    verifiedPositions.push(RIGHT_TILE * scaleIterator);
                }
            }
            if (position % mapSize <= 0) {
                if (
                    game.map[position + LEFT_TILE * scaleIterator].tileType !== TileTypes.WALL &&
                    game.map[position + LEFT_TILE * scaleIterator].tileType !== TileTypes.DOORCLOSED &&
                    game.map[position + LEFT_TILE * scaleIterator].hasPlayer === false
                ) {
                    verifiedPositions.push(LEFT_TILE * scaleIterator);
                }
            }
            if (position - mapSize * scaleIterator >= 0) {
                if (
                    game.map[position - mapSize * scaleIterator].tileType !== TileTypes.WALL &&
                    game.map[position - mapSize * scaleIterator].tileType !== TileTypes.DOORCLOSED &&
                    game.map[position - mapSize * scaleIterator].hasPlayer === false
                ) {
                    verifiedPositions.push(scaleIterator * mapSize * -1);
                }
            }
            if (position + mapSize * scaleIterator < mapLength) {
                if (
                    game.map[position + mapSize * scaleIterator].tileType !== TileTypes.WALL &&
                    game.map[position + mapSize * scaleIterator].tileType !== TileTypes.DOORCLOSED &&
                    game.map[position + mapSize * scaleIterator].hasPlayer === false
                ) {
                    verifiedPositions.push(mapSize * scaleIterator);
                }
            }
        }
        return verifiedPositions;
    }

    private canPlayerEscape(roomId: string, player: PlayerCoord): boolean {
        if (this.isPlayerInCombat(roomId, player)) return Math.random() < ESCAPE_PROBABILITY;
        return false;
    }

    private isPlayerOnIce(roomId: string, player: PlayerCoord): boolean {
        const position = player.position;
        const game = this.activeGamesService.getActiveGame(roomId).game;
        return game.map[position].tileType === TileTypes.ICE;
    }

    private resetHealth(fighter: PlayerCoord): void {
        fighter.player.attributes.currentHealth = fighter.player.attributes.health;
    }

    private resetAttack(fighter: PlayerCoord): void {
        fighter.player.attributes.currentAttack = fighter.player.attributes.attack;
    }

    private resetDefense(fighter: PlayerCoord): void {
        fighter.player.attributes.currentDefense = fighter.player.attributes.defense;
    }

    private resetSpeed(fighter: PlayerCoord): void {
        fighter.player.attributes.currentSpeed = fighter.player.attributes.speed;
    }
}
