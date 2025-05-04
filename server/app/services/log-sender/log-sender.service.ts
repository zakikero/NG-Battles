import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { Player } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class LogSenderService {
    constructor(readonly activeGames: ActiveGamesService) {}

    sendStartTurnLog(server: Server, roomId: string, player: Player): void {
        const message = `Début de tour de ${player.name}`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: player.id });
    }

    sendDoorInteractionLog(server: Server, roomId: string, player: Player, doorState: TileTypes): void {
        let message = '';
        if (doorState === TileTypes.DOOROPEN) {
            message = `Porte a été ouverte par ${player.name}`;
        } else if (doorState === TileTypes.DOORCLOSED) {
            message = `Porte a été fermée par ${player.name}`;
        }
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: player.id });
    }

    sendQuitGameLog(server: Server, roomId: string, player: Player): void {
        const message = `${player.name} a quitté la partie`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: player.id });
    }

    sendEndGameLog(server: Server, roomId: string, winnerName: string): void {
        const playersLeft = this.activeGames
            .getActiveGame(roomId)
            .playersCoord.map((playerCoord) => playerCoord.player.name)
            .reduce((acc, name) => acc.concat(`${name} `), ' ')
            .concat('.');

        const logMessage = `Partie terminée: ${winnerName} a gagné la partie. Joueurs restants:${playersLeft}`;
        this.emitLogToRoom(server, roomId, logMessage);
    }

    sendStartCombatLog(server: Server, roomId: string, firstTurnPlayer: Player, secondTurnPlayer: Player): void {
        const message = `Combat entre ${firstTurnPlayer.name} et ${secondTurnPlayer.name} a été débuté`;
        server.to(roomId).emit('newLog', {
            date: this.getCurrentTimeFormatted(),
            message,
            sender: firstTurnPlayer.id,
            receiver: secondTurnPlayer.id,
        });
    }

    sendEscapedCombat(server: Server, roomId: string, player: Player): void {
        const message = `${player.name} a réussi à s'échapper du combat`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: player.id, exclusive: true });
    }

    sendHasNotEscapedCombat(server: Server, roomId: string, player: Player): void {
        const message = `${player.name} a échoué à s'échapper du combat`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, receiver: player.id, exclusive: true });
    }

    sendFlagHasBeenPickedUp(server: Server, roomId: string, playerName: string): void {
        const message = `Le Drapeau à été ramassé par ${playerName}`;
        this.emitLogToRoom(server, roomId, message);
    }
    // Le paramètre isAttackSuccessful est un boolean necessaire , il est donc important de le passer dans cette fonction qui
    // fait en sorte d'avoir un argument en plus.
    // eslint-disable-next-line max-params
    sendAttackActionLog(
        server: Server,
        roomId: string,
        initialPlayer: Player,
        defender: Player,
        attackerDice: number,
        defenderDice: number,
        isAttackSuccessful: boolean,
    ): void {
        const attackResult = isAttackSuccessful ? 'réussi' : 'échoué';
        const message = `${initialPlayer.name} attaque ${defender.name}. \n L'attaque a ${attackResult}. \n
            Jet de dé attaquant: ${attackerDice}.\n Jet de dé défenseur: ${defenderDice}\n
            calcul: ${initialPlayer.attributes.attack + attackerDice} vs ${defender.attributes.defense + defenderDice}`;
        server.to(roomId).emit('newLog', {
            date: this.getCurrentTimeFormatted(),
            message,
            sender: initialPlayer.id,
            receiver: defender.id,
            exclusive: true,
        });
    }

    sendKillLog(server: Server, roomId: string, killer: Player, killed: Player): void {
        const message = `Fin du combat: ${killer.name} a tué ${killed.name}`;
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message, sender: killer.id, receiver: killed.id });
    }

    sendDebugModeLog(server: Server, roomId: string, playerId: string, isDebugMode: boolean): void {
        const logMessage = 'Mode débogage est ' + (isDebugMode ? 'activé' : 'désactivé');
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message: logMessage, receiver: playerId, exclusive: false });
    }

    emitLogToRoom(server: Server, roomId: string, logMessage: string): void {
        server.to(roomId).emit('newLog', { date: this.getCurrentTimeFormatted(), message: logMessage });
    }

    getCurrentTimeFormatted(): string {
        const currentTime = new Date();
        return currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }); // HH:MM:SS in EST
    }
}
