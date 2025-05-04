import { Player } from '@common/player';
import { PlayerMessage } from '@common/player-message';

export interface Room {
    gameId: string;
    id: string;
    players: Player[];
    isLocked: boolean;
    maxPlayers: number;
    messages: PlayerMessage[];
}
