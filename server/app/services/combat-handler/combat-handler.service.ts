import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { CombatAction } from '@common/combat-actions';
import { TileTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class CombatHandlerService {
    // Il est nécessaire d'avoir un seul parametre supplementaire pour ce constructor du a l'utilité de cet combat handler service
    // eslint-disable-next-line max-params
    constructor(
        private readonly activeGameService: ActiveGamesService,
        @Inject(forwardRef(() => ActionButtonService)) private readonly actionButtonService: ActionButtonService,
        private readonly logService: LogSenderService,
        @Inject(forwardRef(() => CombatService)) private readonly combatService: CombatService,
        @Inject(forwardRef(() => ActionHandlerService)) private readonly actionHandlerService: ActionHandlerService,
        @Inject(forwardRef(() => VirtualPlayerService)) private readonly virtualPlayerService: VirtualPlayerService,
    ) {}

    handleStartAction(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        client.emit('startAction', this.actionButtonService.getAvailableIndexes(roomId, fighter));
    }

    handleCheckAction(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        client.emit('checkValidAction', this.actionButtonService.getAvailableIndexes(roomId, fighter));
    }

    handleAction(roomId: string, playerId: string, target: number, client: Socket, server: Server) {
        const initialPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        if (this.activeGameService.getActiveGame(roomId).game.map[target].hasPlayer) {
            const targetPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.position === target);
            const fighters = [initialPlayer, targetPlayer];
            const [firstTurnPlayer, secondTurnPlayer] = this.combatService.startCombat(roomId, fighters);
            server
                .to(roomId)
                .emit('startCombat', { attacker: firstTurnPlayer, defender: secondTurnPlayer, combatInitiatorId: initialPlayer.player.id });

            this.logService.sendStartCombatLog(server, roomId, firstTurnPlayer.player, secondTurnPlayer.player);
        } else if (
            this.activeGameService.getActiveGame(roomId).game.map[target].tileType === TileTypes.DOORCLOSED ||
            this.activeGameService.getActiveGame(roomId).game.map[target].tileType === TileTypes.DOOROPEN
        ) {
            const newData = { roomId, playerId, doorPosition: target };
            this.actionHandlerService.handleInteractDoor(newData, server);
        }
    }

    async handleCombatAttack(roomId: string, playerId: string, server: Server) {
        if (this.combatService.getCurrentTurnPlayer(roomId).player.id === playerId) {
            const initialPlayer = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
            const targetPlayer = this.combatService.getFighters(roomId).find((player) => player.player.id !== playerId);

            const [attackerDice, defenderDice, combatStatus, defender, isAttackSuccessful] = this.combatService.attack(
                roomId,
                initialPlayer,
                targetPlayer,
                server,
            );

            server.to(roomId).emit('attacked', {
                attacker: initialPlayer,
                attackerDice,
                defender,
                defenderDice,
                isAttackSuccessful,
            });

            if (combatStatus === 'combatTurnEnd') {
                this.combatService.startCombatTurn(roomId, defender);
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
                if (defender.player.isVirtual) {
                    this.virtualPlayerService.roomId = roomId;
                    this.virtualPlayerService.virtualPlayerId = defender.player.id;
                    this.virtualPlayerService.server = server;
                    await this.virtualPlayerService.fight(isAttackSuccessful);
                }
            }
        }
    }

    async handleCombatEscape(roomId: string, playerId: string, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        const defender = this.combatService.getFighters(roomId).find((player) => player.player.id !== playerId);

        const [remainingEscapeChances, escapeResult] = this.combatService.escape(roomId, fighter);
        server.to(roomId).emit('didEscape', { playerId, remainingEscapeChances, hasEscaped: escapeResult });

        if (escapeResult) {
            this.logService.sendEscapedCombat(server, roomId, fighter.player);
            this.combatService.endCombat(roomId, server, fighter);
            if (defender.player.isVirtual) {
                this.virtualPlayerService.roomId = roomId;
                this.virtualPlayerService.virtualPlayerId = defender.player.id;
                this.virtualPlayerService.server = server;
                this.virtualPlayerService.think();
            }
        } else {
            this.logService.sendHasNotEscapedCombat(server, roomId, fighter.player);
            if (!defender.player.isVirtual) {
                this.combatService.startCombatTurn(roomId, defender);
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
            } else if (defender.player.isVirtual) {
                server.to(roomId).emit('changeCombatTurn', defender.player.id);
                this.virtualPlayerService.roomId = roomId;
                this.virtualPlayerService.virtualPlayerId = defender.player.id;
                this.virtualPlayerService.server = server;
                await this.virtualPlayerService.fight(false);
            }
        }
    }

    handleStartCombatTurn(roomId: string, playerId: string, combatAction: CombatAction, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        this.combatService.startCombatTurn(roomId, fighter);
        server.to(roomId).emit('changeCombatTurn', { playerId, combatAction });
    }

    handleEndCombat(roomId: string, playerId: string, server: Server) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        const fighters = this.combatService.endCombat(roomId, server, fighter);
        server.to(roomId).emit('endCombat', fighters);
    }

    handleWinnerPlayer(roomId: string, playerId: string, client: Socket) {
        const fighter = this.activeGameService.getActiveGame(roomId).playersCoord.find((player) => player.player.id === playerId);
        this.combatService.setWinner(roomId, fighter);
        client.emit('winnerPlayer', { roomId, playerId });
    }
}
