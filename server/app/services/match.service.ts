import { Room } from '@app/model/room';
import { SLICE_INDEX } from '@app/services/match.service.utils';
import { Player, PlayerAttribute } from '@common/player';
import { PlayerMessage } from '@common/player-message';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { v4 as generateID } from 'uuid';
import { GameService } from './game.service';
import { LARGE_STARTING_POINTS, MEDIUM_STARTING_POINTS, SMALL_STARTING_POINTS } from './validation-constants';

@Injectable()
export class MatchService {
    rooms: Map<string, Room> = new Map();
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly FLOOR_RANDOM_NUMBER: number = 1000;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly MAX_VALUE_RANDOM_NUMBER: number = 8999;

    constructor(private readonly gameService: GameService) {}

    async createRoom(
        server: Server,
        client: Socket,
        gameId: string,
        playerData: { playerName: string; avatar: string; attributes: PlayerAttribute },
    ) {
        const game = await this.getGame(client, gameId);
        const mapSize = game.mapSize;
        const maxPlayers = this.setMaxPlayers(mapSize);

        const roomId = this.generateMatchId();
        const room = { gameId, id: roomId, players: [], isLocked: false, maxPlayers, messages: [] };
        this.rooms.set(roomId, room);

        const player: Player = {
            id: client.id,
            name: playerData.playerName,
            isAdmin: true,
            avatar: playerData.avatar,
            attributes: playerData.attributes,
            isActive: true,
            abandoned: true,
            wins: 0,
            inventory: [],
            stats: {
                combatCount: 0,
                escapeCount: 0,
                victoryCount: 0,
                defeatCount: 0,
                totalHealthLost: 0,
                totalHealthTaken: 0,
                uniqueItemsCollected: 0,
                visitedTilesPercent: 0,
                visitedTiles: new Set<number>(),
            },
            isVirtual: false,
        };
        room.players.push(player);

        client.join(roomId);
        client.emit('roomJoined', { roomId, playerId: client.id });
        this.updatePlayers(server, room);
    }

    setMaxPlayers(mapSize: string) {
        return mapSize === '10' ? SMALL_STARTING_POINTS : mapSize === '15' ? MEDIUM_STARTING_POINTS : mapSize === '20' ? LARGE_STARTING_POINTS : 0;
    }

    isCodeValid(roomId: string, client: Socket) {
        const room = this.rooms.get(roomId);
        if (room && !room.isLocked) client.emit('validRoom', true);
        else client.emit('validRoom', false);
    }

    isRoomLocked(roomId: string, client: Socket) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        client.emit('isRoomLocked', room.isLocked);
    }

    getAllPlayersInRoom(roomId: string, client: Socket) {
        const room = this.rooms.get(roomId);
        if (room) client.emit('getPlayers', room.players);
    }

    joinRoom(
        server: Server,
        client: Socket,
        roomId: string,
        playerData: { playerName: string; avatar: string; attributes: PlayerAttribute; virtualProfile: string },
        isVirtual: boolean,
    ) {
        const room = this.rooms.get(roomId);

        if (!room) {
            client.emit('error', 'Room not found');
            return;
        }

        if (room.isLocked) {
            client.emit('error', 'Room is locked');
            return;
        }

        const checkedPlayerName = this.checkAndSetPlayerName(room, playerData.playerName);

        const player: Player = {
            id: isVirtual ? generateID() : client.id,
            name: checkedPlayerName,
            isAdmin: false,
            avatar: playerData.avatar,
            attributes: playerData.attributes,
            isActive: true,
            abandoned: true,
            wins: 0,
            inventory: [],
            stats: {
                combatCount: 0,
                escapeCount: 0,
                victoryCount: 0,
                defeatCount: 0,
                totalHealthLost: 0,
                totalHealthTaken: 0,
                uniqueItemsCollected: 0,
                visitedTilesPercent: 0,
                visitedTiles: new Set<number>(),
            },
            isVirtual,
            virtualProfile: playerData.virtualProfile,
        };
        room.players.push(player);

        if (room.players.length >= room.maxPlayers) {
            room.isLocked = true;
            server.to(roomId).emit('roomLocked');
        }

        if (!isVirtual) client.join(roomId);
        client.emit('roomJoined', { roomId, playerId: client.id, playerName: checkedPlayerName });
        this.updatePlayers(server, room);
    }

    updatePlayers(server: Server, room: Room) {
        server.to(room.id).emit('updatePlayers', room.players);
        server.emit('availableAvatars', {
            roomId: room.id,
            avatars: room.players.map((p) => p.avatar),
        });
    }

    getMaxPlayers(roomId: string, socket: Socket) {
        const room = this.rooms.get(roomId);
        if (room) socket.emit('maxPlayers', room.maxPlayers);
    }

    checkAndSetPlayerName(room: Room, playerName: string) {
        let nameExistsCount = 1;
        while (
            room.players.some((player) => {
                return player.name === playerName;
            })
        ) {
            nameExistsCount++;
            if (nameExistsCount === 2) {
                playerName = playerName + '-2';
                continue;
            }
            playerName = playerName.slice(0, SLICE_INDEX) + '-' + nameExistsCount.toString();
        }
        return playerName;
    }

    leaveRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (!client) return;

        if (client.id === room.players[0].id) {
            room.players.forEach((p) => {
                if (p.id !== client.id) {
                    this.leaveRoom(server, server.sockets.sockets.get(p.id), roomId);
                }
            });
        }

        room.players = room.players.filter((p) => p.id !== client.id);
        client.leave(roomId);
        client.emit('roomLeft');

        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        } else {
            server.to(roomId).emit('updatePlayers', room.players);
        }

        client.disconnect();
    }

    lockRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            room.isLocked = true;
            server.to(roomId).emit('roomLocked');
        }
    }

    unlockRoom(server: Server, client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        if (room.players.length >= room.maxPlayers) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            room.isLocked = false;
            server.to(roomId).emit('roomUnlocked');
        }
    }

    kickPlayer(server: Server, client: Socket, roomId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.find((p) => p.id === client.id);
        if (player && player.isAdmin) {
            const playerToKick = room.players.find((p) => p.id === playerId);
            if (playerToKick && !playerToKick.isVirtual) {
                server.sockets.sockets.get(playerToKick.id).emit('kicked');
                this.leaveRoom(server, server.sockets.sockets.get(playerId), roomId);
            } else if (playerToKick.isVirtual) {
                room.players = room.players.filter((p) => p.id !== playerId);
                server.to(roomId).emit('updatePlayers', room.players);
            }
        }
    }

    leaveAllRooms(server: Server, client: Socket) {
        this.rooms.forEach((room, roomId) => {
            if (room.players.some((p) => p.id === client.id)) {
                this.leaveRoom(server, client, roomId);
            }
        });
    }

    generateMatchId() {
        let randomIntInRange: string = Math.floor(this.FLOOR_RANDOM_NUMBER + Math.random() * this.MAX_VALUE_RANDOM_NUMBER).toString();
        while (this.rooms.get(randomIntInRange)) {
            randomIntInRange = Math.floor(this.FLOOR_RANDOM_NUMBER + Math.random() * this.MAX_VALUE_RANDOM_NUMBER).toString();
        }
        return randomIntInRange;
    }

    startGame(server: Server, client: Socket, roomId: string) {
        // MaxPlayers is implicitly checked in joinRoom method by locking the room when maxPlayers is reached
        const room = this.rooms.get(roomId);
        if (room.players.length < 2) {
            client.emit('startError', 'Il doit y avoir au moins 2 joueurs pour commencer la partie');
        } else if (!room.isLocked) {
            client.emit('startError', 'La partie doit être vérouillée pour commencer la partie');
        } else {
            server.to(roomId).emit('gameStarted', { gameId: room.gameId, players: room.players });
        }
    }

    async getGame(client: Socket, gameId: string) {
        const game = await this.gameService.get(gameId);
        return game;
    }

    roomMessage(server: Server, client: Socket, roomId: string, messageString: string, date: string) {
        const room = this.rooms.get(roomId);
        const player = room.players.find((p) => p.id === client.id);

        const message: PlayerMessage = { name: player.name, message: messageString, date };
        room.messages.push(message);
        server.to(roomId).emit('singleMessage', message);
    }

    loadAllMessages(client: Socket, roomId: string) {
        const room = this.rooms.get(roomId);
        const messages = room.messages;
        client.emit('loadAllMessages', { messages });
    }
}
