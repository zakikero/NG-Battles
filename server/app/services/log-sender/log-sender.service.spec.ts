import { GameInstance } from '@app/data-structures/game-instance';
import { Player } from '@common/player';
import { TileTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { Server } from 'socket.io';
import { ActiveGamesService } from '@app/services/active-games/active-games.service';
import { GameService } from '@app/services/game.service';
import { UniqueItemRandomizerService } from '@app/services/unique-item-randomiser/unique-item-randomiser.service';
import { LogSenderService } from '@app/services/log-sender/log-sender.service';
/* eslint-disable */
describe('LogSenderService', () => {
    let service: LogSenderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LogSenderService,
                { provide: LogSenderService, useValue: {} },
                ActiveGamesService,
                GameService,
                UniqueItemRandomizerService,
                { provide: 'GameModel', useValue: {} },
            ],
        }).compile();

        service = module.get<LogSenderService>(LogSenderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
describe('LogSenderService', () => {
    let service: LogSenderService;
    let activeGamesService: ActiveGamesService;
    let server: sinon.SinonStubbedInstance<Server>;
    let player: Player;

    beforeEach(async () => {
        server = sinon.createStubInstance<Server>(Server);
        const gameService = new GameService({} as any);
        const uniqueItemRandomizer = new UniqueItemRandomizerService();
        activeGamesService = new ActiveGamesService(gameService, uniqueItemRandomizer);
        player = { id: 'player1', name: 'Player One', attributes: { attack: 5, defense: 3 } } as Player;

        const module: TestingModule = await Test.createTestingModule({
            providers: [LogSenderService, { provide: ActiveGamesService, useValue: activeGamesService }],
        }).compile();

        service = module.get<LogSenderService>(LogSenderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should send start turn log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendStartTurnLog(server as any, 'room1', player);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Début de tour de ${player.name}` }))).toBeTruthy();
    });

    it('should send door interaction log for door open', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendDoorInteractionLog(server as any, 'room1', player, TileTypes.DOOROPEN);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Porte a été ouverte par ${player.name}` }))).toBeTruthy();
    });

    it('should send door interaction log for door closed', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendDoorInteractionLog(server as any, 'room1', player, TileTypes.DOORCLOSED);
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Porte a été fermée par ${player.name}` }))).toBeTruthy();
        expect(server.to.calledWith('room1')).toBeTruthy();
    });

    it('should send quit game log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendQuitGameLog(server as any, 'room1', player);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `${player.name} a quitté la partie` }))).toBeTruthy();
        expect(server.to.calledWith('room1')).toBeTruthy();
    });

    it('should send end game log', () => {
        sinon
            .stub(activeGamesService, 'getActiveGame')
            .returns({ playersCoord: [{ player: player }], roomId: 'room1', game: {} } as unknown as GameInstance);
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendEndGameLog(server as any, 'room1', 'Winner');
        expect(server.to.calledWith('room1')).toBeTruthy();
    });

    it('should send start combat log', () => {
        const secondPlayer = { id: 'player2', name: 'Player Two' } as Player;
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendStartCombatLog(server as any, 'room1', player, secondPlayer);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(
            emitStub.calledWith('newLog', sinon.match({ message: `Combat entre ${player.name} et ${secondPlayer.name} a été débuté` })),
        ).toBeTruthy();
        expect(server.to.calledWith('room1')).toBeTruthy();
    });

    it('should send escaped combat log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendEscapedCombat(server as any, 'room1', player);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `${player.name} a réussi à s'échapper du combat` }))).toBeTruthy();
    });

    it('should send has not escaped combat log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendHasNotEscapedCombat(server as any, 'room1', player);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `${player.name} a échoué à s'échapper du combat` }))).toBeTruthy();
    });

    it('should send flag has been picked up log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendFlagHasBeenPickedUp(server as any, 'room1', player.name);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Le Drapeau à été ramassé par ${player.name}` }))).toBeTruthy();
    });

    it('should send attack action log', () => {
        const defender = { id: 'player2', name: 'Player Two', attributes: { attack: 4, defense: 2 } } as Player;
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendAttackActionLog(server as any, 'room1', player, defender, 6, 3, true);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: sinon.match(/attaque a réussi/) }))).toBeTruthy();
    });

    it('should send kill log', () => {
        const killed = { id: 'player2', name: 'Player Two' } as Player;
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendKillLog(server as any, 'room1', player, killed);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Fin du combat: ${player.name} a tué ${killed.name}` }))).toBeTruthy();
    });

    it('should send debug mode log', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendDebugModeLog(server as any, 'room1', player.id, true);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: 'Mode débogage est activé' }))).toBeTruthy();
    });

    it('should send attack action log with failed attack', () => {
        const defender = { id: 'player2', name: 'Player Two', attributes: { attack: 4, defense: 2 } } as Player;
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendAttackActionLog(server as any, 'room1', player, defender, 2, 5, false);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: sinon.match(/attaque a échoué/) }))).toBeTruthy();
    });

    it('should send kill log', () => {
        const killed = { id: 'player2', name: 'Player Two' } as Player;
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendKillLog(server as any, 'room1', player, killed);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: `Fin du combat: ${player.name} a tué ${killed.name}` }))).toBeTruthy();
    });

    it('should send debug mode log when activated', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendDebugModeLog(server as any, 'room1', player.id, true);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: 'Mode débogage est activé' }))).toBeTruthy();
    });

    it('should send debug mode log when deactivated', () => {
        const emitStub = sinon.stub();
        server.to.returns({ emit: emitStub } as any);
        service.sendDebugModeLog(server as any, 'room1', player.id, false);
        expect(server.to.calledWith('room1')).toBeTruthy();
        expect(emitStub.calledWith('newLog', sinon.match({ message: 'Mode débogage est désactivé' }))).toBeTruthy();
    });
});
