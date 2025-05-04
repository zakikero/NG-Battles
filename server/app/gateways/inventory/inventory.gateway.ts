import { InventoryService } from '@app/services/inventory/inventory.service';
import { ItemTypes } from '@common/tile-types';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class InventoryGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    constructor(private readonly inventoryService: InventoryService) {}

    @SubscribeMessage('updateInventory')
    handleUpdateInventory(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; playerId: string; allItems: ItemTypes[]; droppedItem: ItemTypes },
    ) {
        this.inventoryService.updateInventory(this.server, data.playerId, data.allItems, data.droppedItem, data.roomId);
    }

    afterInit(server: Server) {
        this.server = server;
    }
}
