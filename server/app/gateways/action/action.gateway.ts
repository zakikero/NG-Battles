import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({ cors: { origin: '*' } })
export class ActionGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;
    gateway: import('http').Server<typeof import('http').IncomingMessage, typeof import('http').ServerResponse>;

    constructor(
        private readonly actionHandler: ActionHandlerService,
        private readonly inventoryService: InventoryService,
        private logSenderService: LogSenderService,
        private matchService: MatchService,
        private debugModeService: DebugModeService,
    ) {}

    @SubscribeMessage('gameSetup')
    async handleGameSetup(@MessageBody() roomId: string) {
        await this.actionHandler.handleGameSetup(this.server, roomId);
    }

    @SubscribeMessage('startTurn')
    handleStartTurn(@MessageBody() data: { roomId: string; playerId: string }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleStartTurn(data, this.server, client);
    }

    @SubscribeMessage('move')
    handleMove(@MessageBody() data: { roomId: string; playerId: string; endPosition: number }, @ConnectedSocket() client: Socket) {
        this.actionHandler.handleMove(data, this.server, client);
    }

    @SubscribeMessage('endTurn')
    handleEndTurn(@MessageBody() data: { roomId: string; playerId: string; lastTurn: boolean }) {
        this.actionHandler.handleEndTurn(data, this.server);
    }

    @SubscribeMessage('interactDoor')
    handleInteractDoor(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; playerId: string; doorPosition: number }) {
        this.actionHandler.handleInteractDoor(data, this.server);
    }

    @SubscribeMessage('getAvailableMovesOnBudget')
    handleGetAvailableMovesOnBudget(
        @MessageBody() data: { roomId: string; playerId: string; currentBudget: number },
        @ConnectedSocket() client: Socket,
    ) {
        this.actionHandler.handleGetAvailableMovesOnBudget(data, client);
    }

    afterInit(server: Server) {
        this.server = server;
    }
}
