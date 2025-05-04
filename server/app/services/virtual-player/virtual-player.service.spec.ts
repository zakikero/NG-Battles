import { ActionButtonService } from '@app/services/action-button/action-button.service';
import { ActionHandlerService } from '@app/services/action-handler/action-handler.service';
import { ActionService } from '@app/services/action/action.service';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { CombatHandlerService } from '@app/services/combat-handler/combat-handler.service';
import { CombatService } from '@app/services/combat/combat.service';
import { InventoryService } from '@app/services/inventory/inventory.service';
import { MovementService } from '@app/services/movement/movement.service';
import { ItemTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { AGGRESSIVE_PRIORITY_ITEMS, DEFENSIVE_PRIORITY_ITEMS } from './constants';
import { VirtualPlayerService } from './virtual-player.service';

/* eslint-disable */

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerService,
                { provide: ActionHandlerService, useValue: {} },
                { provide: CombatHandlerService, useValue: {} },
                { provide: CombatService, useValue: {} },
                { provide: InventoryService, useValue: {} },
                { provide: ActionService, useValue: {} },
                { provide: ActiveGamesService, useValue: {} },
                { provide: ActionButtonService, useValue: {} },
                { provide: MovementService, useValue: {} },
            ],
        }).compile();

        service = module.get<VirtualPlayerService>(VirtualPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let actionHandlerService: ActionHandlerService;
    let combatHandlerService: CombatHandlerService;
    let inventoryService: InventoryService;
    let actionService: ActionService;
    let activeGamesService: ActiveGamesService;
    let actionButtonService: ActionButtonService;
    let movementService: MovementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerService,
                { provide: ActionHandlerService, useValue: { handleEndTurn: jest.fn(), handleMove: jest.fn() } },
                {
                    provide: CombatHandlerService,
                    useValue: { handleCombatEscape: jest.fn(), handleCombatAttack: jest.fn(), handleAction: jest.fn() },
                },
                { provide: InventoryService, useValue: { isInventoryFull: jest.fn(), updateInventory: jest.fn() } },
                { provide: ActionService, useValue: { availablePlayerMoves: jest.fn() } },
                { provide: ActiveGamesService, useValue: { activeGames: [], getActiveGame: jest.fn() } },
                { provide: ActionButtonService, useValue: { getPlayersAround: jest.fn() } },
                { provide: MovementService, useValue: { shortestPath: jest.fn() } },
            ],
        }).compile();

        service = module.get<VirtualPlayerService>(VirtualPlayerService);
        actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
        combatHandlerService = module.get<CombatHandlerService>(CombatHandlerService);
        inventoryService = module.get<InventoryService>(InventoryService);
        actionService = module.get<ActionService>(ActionService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        actionButtonService = module.get<ActionButtonService>(ActionButtonService);
        movementService = module.get<MovementService>(MovementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize server', () => {
        const server = {} as Server;
        service.afterInit(server);
        expect(service.server).toBe(server);
    });

    it('should end turn if no game instance found', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        await service.think();
        expect(actionHandlerService.handleEndTurn).not.toHaveBeenCalled();
    });

    it('should call defensiveThink if profile is defensive', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        jest.spyOn(service, 'defensiveThink').mockImplementation();
        await service.think();
        expect(service.defensiveThink).toHaveBeenCalled();
    });

    it('should call aggressiveThink if profile is not defensive', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'aggressive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'isDefensive').mockReturnValue(false);
        jest.spyOn(service, 'aggressiveThink').mockImplementation();
        await service.think();
        expect(service.aggressiveThink).toHaveBeenCalled();
    });

    it('should handle end turn if shouldEndTurn is true', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        jest.spyOn(service, 'defensiveThink').mockImplementation();
        service.shouldEndTurn = true;
        await service.think();
        expect(actionHandlerService.handleEndTurn).toHaveBeenCalledWith({ roomId: 'room1', playerId: 'vp1', lastTurn: false }, service.server);
    });

    it('should return if game instance is not found in defensiveThink', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        service.defensiveThink(1);
        expect(actionHandlerService.handleMove).not.toHaveBeenCalled();
    });

    it('should return if game instance is not found in aggressiveThink', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        service.aggressiveThink(1);
        expect(actionHandlerService.handleMove).not.toHaveBeenCalled();
    });

    it('should move if random number is less than 0.1 in defensiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.05);
        jest.spyOn(service, 'randomMove').mockImplementation();
        service.defensiveThink(1);
        expect(service.randomMove).toHaveBeenCalled();
    });

    it('should move to items if random number is greater than or equal to 0.1 in defensiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(service, 'moveToItems').mockReturnValue(true);
        service.defensiveThink(1);
        expect(service.moveToItems).toHaveBeenCalled();
    });

    it("should try to attack nearby players if it can't move to items", () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(service, 'moveToItems').mockReturnValue(false);
        jest.spyOn(service, 'startAttack').mockImplementation();
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        service.defensiveThink(1);
        expect(service.startAttack).toHaveBeenCalled();
    });

    it('should move to players if no players around in defensiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([] as any);
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(service, 'moveToItems').mockReturnValue(false);
        jest.spyOn(service, 'moveToPlayers').mockImplementation();
        service.defensiveThink(1);
        expect(service.moveToPlayers).toHaveBeenCalled();
    });

    it('should attack players after moving to them in defensiveThink', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(service, 'moveToItems').mockReturnValue(false);
        jest.spyOn(service, 'moveToPlayers').mockReturnValue(true);
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValueOnce([]);
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        jest.spyOn(service, 'startAttack').mockImplementation();
        service.defensiveThink(1);
        expect(service.startAttack).toHaveBeenCalled();
    });

    it('should move if random number is less than 0.1 in aggressiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.05);
        jest.spyOn(service, 'randomMove').mockImplementation();
        service.aggressiveThink(1);
        expect(service.randomMove).toHaveBeenCalled();
    });

    it('should try to attack nearby players if random number is greater than or equal to 0.1 in aggressiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(service, 'startAttack').mockImplementation();
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        service.aggressiveThink(1);
        expect(service.startAttack).toHaveBeenCalled();
    });

    it('should move to players if no players around in aggressiveThink', () => {
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([] as any);
        jest.spyOn(service, 'moveToPlayers').mockImplementation();
        service.aggressiveThink(1);
        expect(service.moveToPlayers).toHaveBeenCalled();
    });

    it("should return if after moving to players it doesn't find any players around in aggresiveThink", () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'aggressive' }, position: 1 }],
        };
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([] as any);
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'moveToPlayers').mockReturnValue(true);
        service.aggressiveThink(1);
        expect(service.moveToPlayers).toHaveBeenCalled();
    });

    it('should attack players after moving to them in aggressiveThink', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        jest.spyOn(service, 'moveToPlayers').mockReturnValue(true);
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValueOnce([]);
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        jest.spyOn(service, 'startAttack').mockImplementation();
        service.aggressiveThink(1);
        expect(service.startAttack).toHaveBeenCalled();
    });

    it('should handle combat escape if defensive and attacked', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        await service.fight(true);
        expect(combatHandlerService.handleCombatEscape).toHaveBeenCalledWith('room1', 'vp1', service.server);
    });

    it('should handle combat attack if not defensive or not attacked', async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'aggressive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'isDefensive').mockReturnValue(false);
        await service.fight(false);
        expect(combatHandlerService.handleCombatAttack).toHaveBeenCalledWith('room1', 'vp1', service.server);
    });

    it("should return if it doesn't find a game instance in fight", async () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        await service.fight(true);
        expect(combatHandlerService.handleCombatEscape).not.toHaveBeenCalled();
    });

    it("should return if it doesns't find a game instance in isDefensive", () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.isDefensive()).toBeUndefined();
    });

    it('should return true if player is defensive', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'defensive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.isDefensive()).toBe(true);
        expect(service.itemPriorities).toBe(DEFENSIVE_PRIORITY_ITEMS);
    });

    it('should return false if player is not defensive', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', virtualProfile: 'aggressive' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.isDefensive()).toBe(false);
        expect(service.itemPriorities).toBe(AGGRESSIVE_PRIORITY_ITEMS);
    });

    it('should open door if door is adjacent in randomMove then perform a random move', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameStructure = {
            map: [
                { idx: 1, tileType: 'doorClosed' },
                { idx: 2, tileType: '' },
                { idx: 3, tileType: '' },
                { idx: 4, tileType: '' },
            ],
            mapSize: '2',
        };
        const gameInstance = {
            roomId: 'room1',
            game: gameStructure,
            playersCoord: [{ player: { id: 'vp1' }, position: 2 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(actionService, 'availablePlayerMoves').mockReturnValue({ 2: [1, 2, 3], 3: [2, 3, 4] });
        jest.spyOn(service, 'interactWithDoor').mockImplementation();
        service.randomMove();
        expect(service.interactWithDoor).toHaveBeenCalled();
        expect(actionHandlerService.handleMove).toHaveBeenCalled();
    });

    it('should call handleAction and handleCombatAttack if player can attack in startAttack', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameStructure = {
            map: [
                { idx: 1, tileType: 'doorClosed' },
                { idx: 2, tileType: '' },
                { idx: 3, tileType: '' },
                { idx: 4, tileType: '' },
            ],
            mapSize: '2',
        };
        const gameInstance = {
            roomId: 'room1',
            game: gameStructure,
            playersCoord: [{ player: { id: 'vp1' }, position: 2 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        const targetPlayerCoord = { player: { id: 'p1' }, position: 1 };
        service.startAttack(targetPlayerCoord as any);
        expect(combatHandlerService.handleAction).toHaveBeenCalled();
        expect(combatHandlerService.handleCombatAttack).toHaveBeenCalled();
    });

    it('should return if game instance is not found in startAttack', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        const targetPlayerCoord = { player: { id: 'p1' }, position: 1 };
        service.startAttack(targetPlayerCoord as any);
        expect(combatHandlerService.handleAction).not.toHaveBeenCalled();
    });

    it('should call randomMove if player cannot attack in startAttack', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameStructure = {
            map: [
                { idx: 1, tileType: 'doorClosed' },
                { idx: 2, tileType: '' },
                { idx: 3, tileType: '' },
                { idx: 4, tileType: '' },
            ],
            mapSize: '2',
        };
        const gameInstance = {
            roomId: 'room1',
            game: gameStructure,
            playersCoord: [{ player: { id: 'vp1' }, position: 2 }],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(service, 'randomMove').mockImplementation();
        jest.spyOn(service, 'canDoAction').mockReturnValue(false);
        const targetPlayerCoord = { player: { id: 'p1' }, position: 1 };
        service.startAttack(targetPlayerCoord as any);
        expect(service.randomMove).toHaveBeenCalled();
    });

    it('should return true if player can do action', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', actionNumber: 1 }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.canDoAction('vp1')).toBe(true);
    });

    it('should return false if player cannot do action', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', actionNumber: 0 }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.canDoAction('vp1')).toBe(false);
    });

    it('should use action number', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', actionNumber: 1 }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        service.useActionNumber('vp1');
        expect(gameInstance.playersCoord[0].player.actionNumber).toBe(0);
    });

    it('should return false if no valid paths to items are found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', inventory: [] }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([]);
        expect(service.moveToItems()).toBe(false);
    });

    it('should return false if inventory is full and chosen item has lower priority than the lowest priority item in inventory', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.itemPriorities = DEFENSIVE_PRIORITY_ITEMS;
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', inventory: ['item1'] }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([[[1, 2, 3], 'item2']]);
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        jest.spyOn(inventoryService, 'isInventoryFull').mockReturnValue(true);
        jest.spyOn(service, 'findLowestPriorityItem').mockReturnValue('item1');
        expect(service.moveToItems()).toBe(false);
    });

    it('should move through doors and replace item if inventory is full and chosen item has higher priority than the lowest priority item in inventory', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.itemPriorities = DEFENSIVE_PRIORITY_ITEMS;
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', inventory: ['AC2', 'AF1'] }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([
            [[1, 2, 3], 'AA1'],
            [[1, 2, 3], 'AF2'],
        ]);
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        jest.spyOn(inventoryService, 'isInventoryFull').mockReturnValue(true);
        jest.spyOn(service, 'findLowestPriorityItem').mockReturnValue('AF1');
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        jest.spyOn(service, 'replaceItem').mockImplementation();
        expect(service.moveToItems()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2, 3], gameInstance.game.map);
        expect(service.replaceItem).toHaveBeenCalledWith('AF1', 'AA1');
    });

    it('should move through doors and not replace item if inventory is not full', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', inventory: [] }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([[[1, 2, 3], 'item2']]);
        jest.spyOn(service, 'isDefensive').mockReturnValue(true);
        jest.spyOn(inventoryService, 'isInventoryFull').mockReturnValue(false);
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        jest.spyOn(service, 'replaceItem').mockImplementation();
        expect(service.moveToItems()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2, 3], gameInstance.game.map);
        expect(service.replaceItem).not.toHaveBeenCalled();
    });

    it("should return if it can't do action in moveThroughDoors", () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: {
                map: [
                    { idx: 1, tileType: '' },
                    { idx: 2, tileType: 'doorClosed' },
                    { idx: 3, tileType: '' },
                    { idx: 4, tileType: '' },
                    { idx: 5, tileType: '' },
                    { idx: 6, tileType: '' },
                    { idx: 7, tileType: '' },
                    { idx: 8, tileType: '' },
                    { idx: 9, tileType: '' },
                ],
                mapSize: '3',
            },
            currentPlayerMoveBudget: 10,
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(service, 'canDoAction').mockReturnValue(false);
        jest.spyOn(service, 'interactWithDoor').mockImplementation();
        service.moveThroughDoors(1, [1, 2, 3], gameInstance.game.map as any);
        expect(service.interactWithDoor).not.toHaveBeenCalled();
    });

    it('should return if game instance is not found in moveThroughDoors', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        service.moveThroughDoors(1, [1, 2, 3], []);
        expect(actionHandlerService.handleMove).not.toHaveBeenCalled();
    });

    it('should return undefined if no game instance is found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.moveToPlayers()).toBe(undefined);
    });

    it('should return false if no valid paths to players are found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([]);
        expect(service.moveToPlayers()).toBe(false);
    });

    it('should move through doors if valid paths to players are found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([[1, 2, 3]]);
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        expect(service.moveToPlayers()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2, 3], gameInstance.game.map);
    });

    it('should sort valid paths by length and choose the shortest path', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([
            [1, 2, 3, 4],
            [1, 2],
        ]);
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        expect(service.moveToPlayers()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2], gameInstance.game.map);
    });
    it('should return undefined if no game instance is found', () => {
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([[[1, 2, 3], 'item2']]);
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.moveToPlayers()).toBe(undefined);
    });

    it('should return false if no valid paths to players are found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([]);
        expect(service.moveToPlayers()).toBe(false);
    });

    it('should return if no game instance is found in findPathsToPlayers', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.findPathsToPlayers([] as any, 1, 5)).toBe(undefined);
    });

    it('should return if no game instance is found in findPathsToItems', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.findPathsToItems([] as any, 1, 5)).toBe(undefined);
    });

    it('should move through doors if valid paths to players are found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([[1, 2, 3]]);
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        expect(service.moveToPlayers()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2, 3], gameInstance.game.map);
    });

    it('should sort valid paths by length and choose the shortest path', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
            game: { map: [] },
            currentPlayerMoveBudget: 10,
        };
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(service, 'openAllDoors').mockReturnValue(gameInstance.game as any);
        jest.spyOn(service, 'findPathsToPlayers').mockReturnValue([
            [1, 2, 3, 4],
            [1, 2],
        ]);
        jest.spyOn(service, 'moveThroughDoors').mockImplementation();
        expect(service.moveToPlayers()).toBe(true);
        expect(service.moveThroughDoors).toHaveBeenCalledWith(1, [1, 2], gameInstance.game.map);
    });

    it('should return undefined if no game instance is found in getAdjacentTiles', () => {
        jest.spyOn(service, 'findPathsToItems').mockReturnValue([[[1, 2, 3], 'item2']]);
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.getAdjacentTiles(1)).toBe(undefined);
    });

    it('should return adjacent tiles', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            roomId: 'room1',
            game: {
                map: [
                    { idx: 1, tileType: '' },
                    { idx: 2, tileType: '' },
                    { idx: 3, tileType: '' },
                    { idx: 4, tileType: '' },
                    { idx: 5, tileType: '' },
                    { idx: 6, tileType: '' },
                    { idx: 7, tileType: '' },
                    { idx: 8, tileType: '' },
                    { idx: 9, tileType: '' },
                ],
                mapSize: '3',
            },
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.getAdjacentTiles(5)).toStrictEqual([4, 2, 8]);
    });

    it('should call shortestPath and return paths to players', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            game: {
                map: [
                    { idx: 1, tileType: '' },
                    { idx: 2, tileType: '' },
                    { idx: 3, tileType: '' },
                    { idx: 4, tileType: '' },
                    { idx: 5, tileType: '' },
                    { idx: 6, tileType: '' },
                    { idx: 7, tileType: '' },
                    { idx: 8, tileType: '' },
                    { idx: 9, tileType: '' },
                ],
                mapSize: '3',
            },
            playersCoord: [
                { player: { id: 'vp1' }, position: 1 },
                { player: { id: 'p1' }, position: 9 },
            ],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        activeGamesService.activeGames = [gameInstance as any];
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(service, 'getAdjacentTiles').mockReturnValue([1, 3]);
        jest.spyOn(movementService, 'shortestPath').mockReturnValue({ moveCost: 3, path: [1, 2, 3] });
        expect(service.findPathsToPlayers(gameInstance.game as any, 1, 5)).toStrictEqual([
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3],
        ]);
    });

    it('should call shortestPath and return paths to items', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const gameInstance = {
            game: {
                map: [
                    { idx: 1, tileType: '', item: '' },
                    { idx: 2, tileType: '', item: 'startingPoint' },
                    { idx: 3, tileType: '', item: '' },
                    { idx: 4, tileType: '', item: '' },
                    { idx: 5, tileType: '', item: '' },
                    { idx: 6, tileType: '', item: 'item1' },
                    { idx: 7, tileType: '', item: '' },
                    { idx: 8, tileType: '', item: '' },
                    { idx: 9, tileType: '', item: 'item12' },
                ],
                mapSize: '3',
            },
            playersCoord: [
                { player: { id: 'vp1' }, position: 1 },
                { player: { id: 'p1' }, position: 9 },
            ],
        };
        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(actionButtonService, 'getPlayersAround').mockReturnValue([{ player: { id: 'p1' } }] as any);
        jest.spyOn(service, 'getAdjacentTiles').mockReturnValue([1, 3]);
        jest.spyOn(movementService, 'shortestPath').mockReturnValue({ moveCost: 3, path: [1, 2, 3] });
        expect(service.findPathsToItems(gameInstance.game as any, 1, 5)).toStrictEqual([
            [[1, 2, 3], 'item1'],
            [[1, 2, 3], 'item12'],
        ]);
    });

    it('should open all doors on given map', () => {
        const gameStructure = {
            map: [
                { idx: 1, tileType: 'doorClosed' },
                { idx: 2, tileType: 'doorClosed' },
                { idx: 3, tileType: 'doorClosed' },
                { idx: 4, tileType: 'doorClosed' },
            ],
            mapSize: '2',
        };

        const gameStructureOpenedDoors = service.openAllDoors(gameStructure as any);
        expect(gameStructureOpenedDoors.map[0].tileType).toBe('doorOpen');
        expect(gameStructureOpenedDoors.map[1].tileType).toBe('doorOpen');
        expect(gameStructureOpenedDoors.map[2].tileType).toBe('doorOpen');
        expect(gameStructureOpenedDoors.map[3].tileType).toBe('doorOpen');
    });

    it('should find lowest priority item in inventory', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';

        const inventory = ['AC2', 'AF1'];
        const gameInstance = {
            playersCoord: [{ player: { id: 'vp1', inventory }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        expect(service.findLowestPriorityItem(inventory, DEFENSIVE_PRIORITY_ITEMS)).toBe('AF1');
    });

    it('should move through doors and handle move action', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        const server = {} as Server;
        service.server = server;
        const map = [
            { idx: 0, tileType: 'basic' },
            { idx: 1, tileType: 'doorClosed' },
            { idx: 2, tileType: 'basic' },
        ];
        const path = [0, 1, 2];
        const gameInstance = { roomId: 'room1' };

        jest.spyOn(activeGamesService, 'getActiveGame').mockReturnValue(gameInstance as any);
        jest.spyOn(service, 'moveToDoor').mockImplementation();
        jest.spyOn(service, 'canDoAction').mockReturnValue(true);
        jest.spyOn(service, 'interactWithDoor').mockImplementation();

        service.moveThroughDoors(0, path, map as any);

        expect(service.moveToDoor).toHaveBeenCalledWith(0);
        expect(service.interactWithDoor).toHaveBeenCalledWith(1);
        expect(actionHandlerService.handleMove).toHaveBeenCalledWith({ roomId: 'room1', playerId: 'vp1', endPosition: 2 }, server, null);
    });

    it('should return if game instance is not found in findLowestPriorityItem', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        activeGamesService.activeGames = [];
        expect(service.findLowestPriorityItem([], DEFENSIVE_PRIORITY_ITEMS)).toBe(undefined);
    });

    it('should replace item', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.server = {} as Server;

        const gameInstance = {
            roomId: 'room1',
            playersCoord: [{ player: { id: 'vp1', inventory: ['AC2', 'AF1'] }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];
        const allItems = ['AC2', 'AF1', 'AA1'];

        service.replaceItem(ItemTypes.AF1, ItemTypes.AA1);
        expect(inventoryService.updateInventory).toHaveBeenCalled();
    });

    it('should return in replaceItem if game instance is not found', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.server = {} as Server;
        activeGamesService.activeGames = [];

        service.replaceItem(ItemTypes.AF1, ItemTypes.AA1);
        expect(inventoryService.updateInventory).not.toHaveBeenCalled();
    });

    it('should move to door', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';

        const gameInstance = {
            playersCoord: [{ player: { id: 'vp1' }, position: 1 }],
        };
        activeGamesService.activeGames = [gameInstance as any];

        service.moveToDoor(1);

        expect(actionHandlerService.handleMove).toHaveBeenCalledWith({ roomId: 'room1', playerId: 'vp1', endPosition: 1 }, service.server, null);
    });

    it('should interact with door', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.server = {} as Server;
        service.interactWithDoor(1);

        expect(combatHandlerService.handleAction).toHaveBeenCalledWith('room1', 'vp1', 1, null, service.server);
    });

    it('should handle virtual player turn', () => {
        service.roomId = 'room1';
        service.virtualPlayerId = 'vp1';
        service.server = {} as Server;

        service.handleVirtualPlayerTurn('room1', 'vp1');

        expect(actionHandlerService.handleEndTurn).toHaveBeenCalledWith({ roomId: 'room1', playerId: 'vp1', lastTurn: false }, service.server);
    });
});
