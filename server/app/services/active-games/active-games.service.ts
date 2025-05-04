import { GameInstance } from '@app/data-structures/game-instance';
import { CHANCES } from '@app/services/active-games/constants';
import { CombatTimerService } from '@app/services/combat-timer/combat-timer.service';
import { GameService } from '@app/services/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameStructure } from '@common/game-structure';
import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { GlobalStatsService } from '@app/services/global-stats/global-stats.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';

@Injectable()
export class ActiveGamesService {
    activeGames: GameInstance[] = [];
    constructor(
        private readonly gameService: GameService,
        readonly uniqueItemRandomizer: UniqueItemRandomizerService,
    ) {}

    findStartingPositions(game: GameStructure): number[] {
        return game.map.map((tile, index) => (tile.item === 'startingPoint' ? index : -1)).filter((index) => index !== -1);
    }

    randomizePlayerPosition(game: GameStructure, players: Player[]): PlayerCoord[] {
        const startingPositions: number[] = this.findStartingPositions(game);
        const playerCoords: PlayerCoord[] = [];

        players.forEach((player) => {
            let randomIndex: number;
            let position: number;

            do {
                randomIndex = Math.floor(Math.random() * startingPositions.length);
                position = startingPositions[randomIndex];
                startingPositions.splice(randomIndex, 1);
            } while (playerCoords.find((playerCoord) => playerCoord.position === position) !== undefined);

            player.wins = 0;
            game.map[position].hasPlayer = true;
            playerCoords.push({ player, position });
        });

        if (startingPositions.length > 0) {
            startingPositions.forEach((position) => {
                game.map[position].item = ItemTypes.EMPTY;
            });
        }

        return playerCoords;
    }

    async checkGameInstance(roomId: string, gameId: string): Promise<void> {
        if (this.activeGames.find((instance) => instance.roomId === roomId) === undefined) {
            const g: GameStructure = await this.gameService.get(gameId).then((game) => game);
            const deepCopyGame = JSON.parse(JSON.stringify(g));
            this.activeGames.push({ roomId, game: deepCopyGame });
        }
    }

    async gameSetup(server: Server, roomId: string, gameId: string, players: Player[]): Promise<void> {
        return new Promise((resolve, reject) => {
            let playerCoord: PlayerCoord[] = [];
            this.checkGameInstance(roomId, gameId)
                .then(() => {
                    const game = this.activeGames.find((instance) => instance.roomId === roomId).game as GameStructure;
                    playerCoord = this.randomizePlayerPosition(game, players);
                    const maxNbDoors = game.map.filter((tile) => tile.tileType === 'doorOpen' || tile.tileType === 'doorClosed').length;
                    const maxNbTiles = game.map.filter((tile) => tile.tileType !== 'wall').length;
                    const activeGameIndex = this.activeGames.findIndex((instance) => instance.roomId === roomId);
                    playerCoord = this.sortPlayersBySpeed(playerCoord);

                    playerCoord.forEach((coord) => {
                        coord.player.homePosition = coord.position;
                    });

                    this.activeGames[activeGameIndex].playersCoord = playerCoord;
                    this.activeGames[activeGameIndex].turn = 0;
                    this.activeGames[activeGameIndex].turnTimer = new TimerService(server, roomId);
                    this.activeGames[activeGameIndex].combatTimer = new CombatTimerService(server, roomId);
                    this.activeGames[activeGameIndex].maxNbTiles = maxNbTiles;
                    this.activeGames[activeGameIndex].globalStatsService = new GlobalStatsService(maxNbDoors, maxNbTiles);
                    this.activeGames[activeGameIndex].globalStatsService.startTimerInterval();
                    this.activeGames[activeGameIndex].turnTimer.startTimer();

                    const randomizedItemsPlacement = this.uniqueItemRandomizer.randomizeUniqueItems(game.map);

                    server.to(roomId).emit('gameSetup', {
                        playerCoords: playerCoord,
                        turn: this.activeGames[activeGameIndex].turn,
                        randomizedItemsPlacement,
                    });

                    resolve();
                })
                .catch(reject);
        });
    }

    sortPlayersBySpeed(playersCoord: PlayerCoord[]): PlayerCoord[] {
        return playersCoord.sort((a, b) => {
            const speedA = a.player.attributes.speed;
            const speedB = b.player.attributes.speed;

            if (speedA !== speedB) {
                return speedB - speedA;
            }
            return Math.random() - CHANCES;
        });
    }

    getActiveGame(roomId: string): GameInstance {
        return this.activeGames.find((instance) => instance.roomId === roomId);
    }

    getActiveGameByPlayerId(playerId: string): GameInstance {
        return this.activeGames.find((instance) => instance.playersCoord.find((player) => player.player.id === playerId));
    }

    removeGameInstance(roomId: string): void {
        this.activeGames = this.activeGames.filter((instance) => instance.roomId !== roomId);
    }
}
