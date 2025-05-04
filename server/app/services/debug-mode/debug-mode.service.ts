import { TileTypes } from '@common/tile-types';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';

@Injectable()
export class DebugModeService {
    private isDebugModeHashMap: Map<string, boolean> = new Map<string, boolean>();
    constructor(
        @Inject(ActiveGamesService) private activeGamesService: ActiveGamesService,
        @Inject(forwardRef(() => ActionService)) private readonly action: ActionService,
    ) {}

    debugModeOn(roomId: string): void {
        this.isDebugModeHashMap.set(roomId, true);
    }
    debugModeOff(roomId): void {
        this.isDebugModeHashMap.set(roomId, false);
    }
    switchDebugMode(roomId): void {
        this.isDebugModeHashMap.set(roomId, !this.isDebugModeHashMap.get(roomId));
    }

    getDebugMode(roomId): boolean {
        return this.isDebugModeHashMap.get(roomId);
    }
    handleTeleportPlayer(data: { roomId: string; playerId: string; index: number }, server: Server) {
        if (this.getDebugMode(data.roomId)) {
            const gameInstance = this.activeGamesService.getActiveGame(data.roomId);
            const playerStart = gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId);
            const playerStartIndex = playerStart.position;
            const currentPlayerMoveBudget = gameInstance.currentPlayerMoveBudget;
            const map = gameInstance.game.map;
            if (!map[data.index].hasPlayer && map[data.index].tileType !== TileTypes.WALL && map[data.index].tileType !== TileTypes.DOORCLOSED) {
                map[playerStartIndex].hasPlayer = false;
                map[data.index].hasPlayer = true;
                gameInstance.playersCoord.find((playerCoord) => playerCoord.player.id === data.playerId).position = data.index;
                const availableMoves = this.action.availablePlayerMoves(data.playerId, data.roomId);
                server.to(data.roomId).emit('teleportResponse', {
                    playerId: data.playerId,
                    newPosition: data.index,
                    availableMoves,
                    currentPlayerMoveBudget,
                });
            }
        }
    }
    handleDisconnect(server: Server, client: Socket, isAdmin: boolean, roomId: string) {
        if (isAdmin) {
            this.debugModeOff(roomId);
            server.to(roomId).emit('responseDebugMode', { isDebugMode: this.getDebugMode(roomId) });
        }
    }
}
