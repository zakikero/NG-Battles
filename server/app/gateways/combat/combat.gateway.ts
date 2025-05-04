import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
import { CombatAction } from '@common/combat-actions';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway()
export class CombatGateway {
    @WebSocketServer() server: Server;

    constructor(private readonly combatHandlerService: CombatHandlerService) {}

    @SubscribeMessage('startAction')
    handleStartAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleStartAction(data.roomId, data.playerId, client);
    }

    @SubscribeMessage('checkAction')
    handleCheckAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleCheckAction(data.roomId, data.playerId, client);
    }

    @SubscribeMessage('action')
    handleAction(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; target: number }) {
        this.combatHandlerService.handleAction(data.roomId, data.playerId, data.target, client, this.server);
    }

    @SubscribeMessage('attack')
    handleAttack(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleCombatAttack(data.roomId, data.playerId, this.server);
    }

    @SubscribeMessage('escape')
    handleEscape(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleCombatEscape(data.roomId, data.playerId, this.server);
    }

    @SubscribeMessage('startCombatTurn')
    handleStartCombatTurn(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string; combatAction: CombatAction }) {
        this.combatHandlerService.handleStartCombatTurn(data.roomId, data.playerId, data.combatAction, this.server);
    }

    @SubscribeMessage('endCombat')
    handleEndCombat(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleEndCombat(data.roomId, data.playerId, this.server);
    }

    @SubscribeMessage('winnerPlayer')
    handleWinnerPlayer(@ConnectedSocket() client, @MessageBody() data: { roomId: string; playerId: string }) {
        this.combatHandlerService.handleWinnerPlayer(data.roomId, data.playerId, client);
    }
}
