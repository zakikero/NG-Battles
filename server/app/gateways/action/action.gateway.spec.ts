import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { DebugModeService } from '@app/services/debug-mode/debug-mode.service';
import { GameService } from '@app/services/game.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { MatchService } from '@app/services/match.service';
import { MovementService } from '@app/services/movement/movement.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { ActionGateway } from './action.gateway';
/* eslint-disable */
describe('ActionGateway', () => {
    let gateway: ActionGateway;
    let actionHandlerService: ActionHandlerService;
    let server: Server;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DebugModeService,
                InventoryService,
                Server,
                ActiveGamesService,
                ActionGateway,
                GameService,
                MovementService,
                LogSenderService,
                MatchService,
                UniqueItemRandomizerService,
                ActionService,
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleGameSetup: jest.fn(),
                        handleMove: jest.fn(),
                        handleStartTurn: jest.fn(),
                        handleEndTurn: jest.fn(),
                        handleInteractDoor: jest.fn(),
                        handleGetAvailableMovesOnBudget: jest.fn(),
                    },
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        gateway = module.get<ActionGateway>(ActionGateway);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
        server = module.get<Server>(Server);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should handle game setup', () => {
        const roomId = 'roomId';

        gateway.handleGameSetup(roomId);

        expect(actionHandlerService.handleGameSetup).toHaveBeenCalledWith(null, roomId);
    });
    it('should handle start turn', () => {
        const data = { roomId: 'roomId', playerId: 'playerId' };
        const client = { id: 'clientId' } as any;

        gateway.handleStartTurn(data, client);

        expect(actionHandlerService.handleStartTurn).toHaveBeenCalledWith(data, null, client);
    });
    it('should handle move', () => {
        const data = { roomId: 'roomId', playerId: 'playerId', endPosition: 5 };
        const client = { id: 'clientId' } as any;

        gateway.handleMove(data, client);

        expect(actionHandlerService.handleMove).toHaveBeenCalledWith(data, null, client);
    });
    it('should handle end turn', () => {
        const data = { roomId: 'roomId', playerId: 'playerId', lastTurn: true };

        gateway.handleEndTurn(data);

        expect(actionHandlerService.handleEndTurn).toHaveBeenCalledWith(data, null);
    });
    it('should handle interact door', () => {
        const data = { roomId: 'roomId', playerId: 'playerId', doorPosition: 1 };
        const client = { id: 'clientId' } as any;

        gateway.handleInteractDoor(client, data);

        expect(actionHandlerService.handleInteractDoor).toHaveBeenCalled();
    });
    it('should handle get available moves on budget', () => {
        const data = { roomId: 'roomId', playerId: 'playerId', currentBudget: 100 };
        const client = { id: 'clientId' } as any;

        gateway.handleGetAvailableMovesOnBudget(data, client);

        expect(actionHandlerService.handleGetAvailableMovesOnBudget).toHaveBeenCalledWith(data, client);
    });

    it('should initialize the server', () => {
        const mockServer = {} as Server;

        gateway.afterInit(mockServer as any);

        expect(gateway['server']).toBe(mockServer);
    });
});
