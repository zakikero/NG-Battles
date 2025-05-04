import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
import { CombatAction } from '@common/combat-actions';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { CombatGateway } from './combat.gateway';
/* eslint-disable */

describe('CombatGateway', () => {
    let gateway: CombatGateway;
    let combatHandlerService: CombatHandlerService;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatGateway,
                {
                    provide: CombatHandlerService,
                    useValue: {
                        handleStartAction: jest.fn(),
                        handleCheckAction: jest.fn(),
                        handleAction: jest.fn(),
                        handleCombatAttack: jest.fn(),
                        handleCombatEscape: jest.fn(),
                        handleStartCombatTurn: jest.fn(),
                        handleEndCombat: jest.fn(),
                        handleWinnerPlayer: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<CombatGateway>(CombatGateway);
        combatHandlerService = module.get<CombatHandlerService>(CombatHandlerService);
        server = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
        gateway.server = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should handle startAction message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleStartAction(client, data);

        expect(combatHandlerService.handleStartAction).toHaveBeenCalledWith(data.roomId, data.playerId, client);
    });

    it('should handle checkAction message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleCheckAction(client, data);

        expect(combatHandlerService.handleCheckAction).toHaveBeenCalledWith(data.roomId, data.playerId, client);
    });

    it('should handle action message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1', target: 1 };

        gateway.handleAction(client, data);

        expect(combatHandlerService.handleAction).toHaveBeenCalledWith(data.roomId, data.playerId, data.target, client, server);
    });

    it('should handle attack message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleAttack(client, data);

        expect(combatHandlerService.handleCombatAttack).toHaveBeenCalledWith(data.roomId, data.playerId, server);
    });

    it('should handle escape message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleEscape(client, data);

        expect(combatHandlerService.handleCombatEscape).toHaveBeenCalledWith(data.roomId, data.playerId, server);
    });

    it('should handle startCombatTurn message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1', combatAction: {} as CombatAction };

        gateway.handleStartCombatTurn(client, data);

        expect(combatHandlerService.handleStartCombatTurn).toHaveBeenCalledWith(data.roomId, data.playerId, data.combatAction, server);
    });

    it('should handle endCombat message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleEndCombat(client, data);

        expect(combatHandlerService.handleEndCombat).toHaveBeenCalledWith(data.roomId, data.playerId, server);
    });

    it('should handle winnerPlayer message', () => {
        const client = { emit: jest.fn() } as any;
        const data = { roomId: 'room1', playerId: 'player1' };

        gateway.handleWinnerPlayer(client, data);

        expect(combatHandlerService.handleWinnerPlayer).toHaveBeenCalledWith(data.roomId, data.playerId, client);
    });
});
