import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { ItemTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'dgram';
import { Server } from 'http';
import { InventoryGateway } from './inventory.gateway';
/* eslint-disable */
describe('InventoryGateway', () => {
    let gateway: InventoryGateway;
    let actionHandler: ActionHandlerService;
    let server: Server;
    let inventoryService: InventoryService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryGateway,

                {
                    provide: InventoryService,
                    useValue: {
                        handleGameSetup: jest.fn(),
                        updateInventory: jest.fn(),
                    },
                },
                ActiveGamesService,
                LogSenderService,
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleGameSetup: jest.fn(),
                    },
                },
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();

        gateway = module.get<InventoryGateway>(InventoryGateway);
        actionHandler = module.get<ActionHandlerService>(ActionHandlerService);
        server = {} as Server;
        inventoryService = module.get<InventoryService>(InventoryService);
    });

    it('should exist', () => {
        expect(gateway).toBeDefined();
    });
    it('should call inventoryService.updateInventory when handleUpdateInventory is called', () => {
        const client = {} as Socket;
        const data = {
            roomId: 'room1',
            playerId: 'player1',
            allItems: [],
            droppedItem: {} as ItemTypes,
        };

        gateway.handleUpdateInventory(client as any, data);

        expect(inventoryService.updateInventory).toHaveBeenCalled();
    });
    it('should set the server instance when afterInit is called', () => {
        const mockServer = {} as any;
        gateway.afterInit(mockServer);
        expect(gateway.server).toBe(mockServer);
    });
});
