import { CombatAction } from '@common/combat-actions';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatService } from '@app/services/combat/combat.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
/* eslint-disable */
describe('CombatHandlerService', () => {
    let service: CombatHandlerService;
    let activeGamesService: ActiveGamesService;
    let actionButtonService: ActionButtonService;
    let logSenderService: LogSenderService;
    let combatService: CombatService;
    let actionHandlerService: ActionHandlerService;
    let virtualPlayerService: VirtualPlayerService;
    let client: Socket;
    let server: Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CombatHandlerService,
                {
                    provide: ActiveGamesService,
                    useValue: {
                        getActiveGame: jest.fn().mockReturnValue({
                            playersCoord: [
                                { player: { id: 'player1' }, position: 1 },
                                { player: { id: 'player2' }, position: 2 },
                            ],
                            game: {
                                map: [
                                    { hasPlayer: false, tileType: TileTypes.BASIC },
                                    { hasPlayer: true, tileType: TileTypes.BASIC },
                                    { hasPlayer: false, tileType: TileTypes.DOORCLOSED },
                                ],
                            },
                        }),
                    },
                },
                {
                    provide: ActionButtonService,
                    useValue: {
                        getAvailableIndexes: jest.fn().mockReturnValue([1, 2, 3]),
                    },
                },
                {
                    provide: LogSenderService,
                    useValue: {
                        sendStartCombatLog: jest.fn(),
                        sendEscapedCombat: jest.fn(),
                        sendHasNotEscapedCombat: jest.fn(),
                    },
                },
                {
                    provide: CombatService,
                    useValue: {
                        startCombat: jest.fn().mockReturnValue([{ player: { id: 'player1' } }, { player: { id: 'player2' } }]),
                        getCurrentTurnPlayer: jest.fn().mockReturnValue({ player: { id: 'player1' } }),
                        getFighters: jest.fn().mockReturnValue([{ player: { id: 'player1' } }, { player: { id: 'player2', isVirtual: true } }]),
                        attack: jest.fn().mockReturnValue([1, 2, 'combatTurnEnd', { player: { id: 'player2', isVirtual: true } }, true]),
                        escape: jest.fn().mockReturnValue([1, true]),
                        endCombat: jest.fn().mockReturnValue([{ player: { id: 'player1' } }, { player: { id: 'player2' } }]),
                        startCombatTurn: jest.fn(),
                        setWinner: jest.fn(),
                    },
                },
                {
                    provide: ActionHandlerService,
                    useValue: {
                        handleInteractDoor: jest.fn(),
                    },
                },
                {
                    provide: VirtualPlayerService,
                    useValue: {
                        fight: jest.fn(),
                        think: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CombatHandlerService>(CombatHandlerService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        actionButtonService = module.get<ActionButtonService>(ActionButtonService);
        logSenderService = module.get<LogSenderService>(LogSenderService);
        combatService = module.get<CombatService>(CombatService);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
        virtualPlayerService = module.get<VirtualPlayerService>(VirtualPlayerService);
        client = { emit: jest.fn() } as unknown as Socket;
        server = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } as unknown as Server;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('handleStartAction should emit startAction event', () => {
        service.handleStartAction('room1', 'player1', client);
        expect(client.emit).toHaveBeenCalledWith('startAction', [1, 2, 3]);
    });

    it('handleCheckAction should emit checkValidAction event', () => {
        service.handleCheckAction('room1', 'player1', client);
        expect(client.emit).toHaveBeenCalledWith('checkValidAction', [1, 2, 3]);
    });

    it('handleAction should start combat if target has player', () => {
        service.handleAction('room1', 'player1', 1, client, server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('startCombat', {
            attacker: { player: { id: 'player1' } },
            defender: { player: { id: 'player2' } },
            combatInitiatorId: 'player1',
        });
        expect(logSenderService.sendStartCombatLog).toHaveBeenCalled();
    });

    it('handleAction should handle door interaction if target is a closed door', () => {
        service.handleAction('room1', 'player1', 2, client, server);
        expect(actionHandlerService.handleInteractDoor).toHaveBeenCalled();
    });

    it('handleAction should handle door interaction if target is an open door', () => {
        activeGamesService.getActiveGame = jest.fn().mockReturnValue({
            playersCoord: [
                { player: { id: 'player1' }, position: 1 },
                { player: { id: 'player2' }, position: 2 },
            ],
            game: {
                map: [
                    { hasPlayer: false, tileType: TileTypes.BASIC },
                    { hasPlayer: true, tileType: TileTypes.BASIC },
                    { hasPlayer: false, tileType: TileTypes.DOOROPEN },
                ],
            },
        });
        service.handleAction('room1', 'player1', 2, client, server);
        expect(actionHandlerService.handleInteractDoor).toHaveBeenCalled();
    });

    it('handleCombatAttack should emit attacked event and change turn if combatTurnEnd', async () => {
        await service.handleCombatAttack('room1', 'player1', server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('attacked', {
            attacker: { player: { id: 'player1' }, position: 1 },
            attackerDice: 1,
            defender: { player: { id: 'player2', isVirtual: true } },
            defenderDice: 2,
            isAttackSuccessful: true,
        });
        expect(server.to('room1').emit).toHaveBeenCalledWith('changeCombatTurn', 'player2');
        expect(virtualPlayerService.fight).toHaveBeenCalled();
    });

    it('handleCombatEscape should emit didEscape event and end combat if escape successful', async () => {
        await service.handleCombatEscape('room1', 'player1', server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('didEscape', { playerId: 'player1', remainingEscapeChances: 1, hasEscaped: true });
        expect(logSenderService.sendEscapedCombat).toHaveBeenCalled();
        expect(combatService.endCombat).toHaveBeenCalled();
        expect(virtualPlayerService.think).toHaveBeenCalled();
    });

    it('handleCombatEscape should emit changeCombatTurn and start player combat turn if not virtual', async () => {
        combatService.getFighters = jest
            .fn()
            .mockReturnValue([{ player: { id: 'player1', isVirtual: false } }, { player: { id: 'player2', isVirtual: false } }]);
        combatService.escape = jest.fn().mockReturnValue([1, false]);
        await service.handleCombatEscape('room1', 'player1', server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('didEscape', { playerId: 'player1', remainingEscapeChances: 1, hasEscaped: false });
        expect(server.to('room1').emit).toHaveBeenCalledWith('changeCombatTurn', 'player2');
        expect(combatService.startCombatTurn).toHaveBeenCalled;
    });

    it('handleCombatEscape should emit changeCombatTurn and start virtual player combat turn if virtual', async () => {
        combatService.getFighters = jest
            .fn()
            .mockReturnValue([{ player: { id: 'player1', isVirtual: true } }, { player: { id: 'player2', isVirtual: true } }]);
        combatService.escape = jest.fn().mockReturnValue([1, false]);
        await service.handleCombatEscape('room1', 'player1', server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('didEscape', { playerId: 'player1', remainingEscapeChances: 1, hasEscaped: false });
        expect(server.to('room1').emit).toHaveBeenCalledWith('changeCombatTurn', 'player2');
        expect(virtualPlayerService.fight).toHaveBeenCalledWith(false);
    });

    it('handleStartCombatTurn should emit changeCombatTurn event', () => {
        service.handleStartCombatTurn('room1', 'player1', CombatAction.ATTACK, server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('changeCombatTurn', { playerId: 'player1', combatAction: CombatAction.ATTACK });
    });

    it('handleEndCombat should emit endCombat event', () => {
        service.handleEndCombat('room1', 'player1', server);
        expect(server.to('room1').emit).toHaveBeenCalledWith('endCombat', [{ player: { id: 'player1' } }, { player: { id: 'player2' } }]);
    });

    it('handleWinnerPlayer should emit winnerPlayer event', () => {
        service.handleWinnerPlayer('room1', 'player1', client);
        expect(client.emit).toHaveBeenCalledWith('winnerPlayer', { roomId: 'room1', playerId: 'player1' });
    });
});
