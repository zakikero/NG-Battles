import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { PlayerAttribute } from '@common/player';
import { Inject } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MatchGateway implements OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    // ! Only one additional parameter is required for this constructor, due to the usefulness of the gateway match.
    // eslint-disable-next-line max-params
    constructor(
        @Inject() private readonly matchService: MatchService,
        private readonly actionHandlerService: ActionHandlerService,
        private readonly action: ActionService,
        private debugModeService: DebugModeService,
        private activeGamesService: ActiveGamesService,
        private logService: LogSenderService,
    ) {}

    @SubscribeMessage('createRoom')
    handleCreateRoom(
        @MessageBody() data: { gameId: string; playerName: string; avatar: string; attributes: PlayerAttribute },
        @ConnectedSocket() client: Socket,
    ) {
        const playerData = { playerName: data.playerName, avatar: data.avatar, attributes: data.attributes };
        this.matchService.createRoom(this.server, client, data.gameId, playerData);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @MessageBody()
        data: { roomId: string; playerName: string; avatar: string; attributes: PlayerAttribute; isVirtual: boolean; virtualProfile: string },
        @ConnectedSocket() client: Socket,
    ) {
        const playerData = { playerName: data.playerName, avatar: data.avatar, attributes: data.attributes, virtualProfile: data.virtualProfile };
        this.matchService.joinRoom(this.server, client, data.roomId, playerData, data.isVirtual);
    }

    @SubscribeMessage('validRoom')
    handleValidRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.isCodeValid(roomId, client);
    }

    @SubscribeMessage('isRoomLocked')
    handleIsRoomLocked(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.isRoomLocked(roomId, client);
    }

    @SubscribeMessage('getPlayers')
    handleGetPlayers(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.getAllPlayersInRoom(roomId, client);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.leaveRoom(this.server, client, roomId);
    }

    @SubscribeMessage('lockRoom')
    handleLockRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.lockRoom(this.server, client, roomId);
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        this.matchService.unlockRoom(this.server, client, roomId);
    }

    @SubscribeMessage('kickPlayer')
    handleKickPlayer(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.kickPlayer(this.server, client, data.roomId, data.playerId);
    }

    @SubscribeMessage('startGame')
    startGame(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.startGame(this.server, client, data.roomId);
    }

    @SubscribeMessage('getMaxPlayers')
    getMaxPlayers(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.getMaxPlayers(data.roomId, client);
    }

    @SubscribeMessage('roomMessage')
    roomMessage(@MessageBody() data: { roomId: string; message: string; date: string }, @ConnectedSocket() client: Socket) {
        this.matchService.roomMessage(this.server, client, data.roomId, data.message, data.date);
    }

    @SubscribeMessage('loadAllMessages')
    loadAllMessages(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        this.matchService.loadAllMessages(client, data.roomId);
    }

    @SubscribeMessage('requestDebugMode')
    handleDebugMode(@MessageBody() data: { roomId: string; playerId: string }) {
        this.debugModeService.switchDebugMode(data.roomId);
        this.logService.sendDebugModeLog(this.server, data.roomId, data.playerId, this.debugModeService.getDebugMode(data.roomId));
        this.server.to(data.roomId).emit('responseDebugMode', { isDebugMode: this.debugModeService.getDebugMode(data.roomId) });
    }

    @SubscribeMessage('teleportPlayer')
    handleTeleportPlayer(@MessageBody() data: { roomId: string; playerId: string; index: number }) {
        this.debugModeService.handleTeleportPlayer(data, this.server);
    }

    handleDisconnect(client: Socket) {
        let roomId = '';
        let isAdmin = false;
        this.matchService.rooms.forEach((room) => {
            const foundPlayer = room.players.find((player) => player.id === client.id);
            if (foundPlayer) {
                roomId = room.id;
                isAdmin = foundPlayer.isAdmin;
            }
        });
        this.debugModeService.handleDisconnect(this.server, client, isAdmin, roomId);
        this.actionHandlerService.handleQuitGame(this.server, client);
        this.matchService.leaveAllRooms(this.server, client);
    }
    afterInit(server: Server) {
        this.server = server;
    }
}
