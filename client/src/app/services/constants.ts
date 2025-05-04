import { GameStructure } from '@common/game-structure';
import { Player, PlayerAttribute, PlayerStats } from '@common/player';

/* eslint-disable */
export const DEFAULT_STARTING_POINT_NUMBER = 5;
export const DEFAULT_MAP_SIZE_SMALL = 10;
export const DEFAULT_MAP_SIZE_MEDIUM = 15;
export const DEFAULT_STARTING_COUNTER_TWO = 2;
export const DEFAULT_STARTING_COUNTER_FOUR = 4;
export const DEFAULT_STARTING_COUNTER_SIX = 6;
export const DEFAULT_STARTING_COUNTER_ONE = 1;

export const TEST_AVAILABLE_TILES = [1, 2, 3];
export const RANDOM_TILE_INDEX = 4;
export const TEST_SHORTEST_PATH = { 1: [2, 3] };
export const TEST_SHORTEST_PATH_BY_INDEX = { 1: [2, 3], 2: [3, 4] };

export const TEST_MOVE_BUDGET = 6;

export const MOCK_PLAYER: Player = {
    id: '1',
    name: 'player1',
    isAdmin: false,
    avatar: '1',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: false,
    wins: 0,
    inventory: [],
    stats: {} as PlayerStats,
    isVirtual: false,
};

export const MOCK_PLAYER_TWO: Player = {
    id: '2',
    name: 'player2',
    isAdmin: false,
    avatar: '2',
    attributes: {} as PlayerAttribute,
    isActive: false,
    abandoned: false,
    wins: 0,
    inventory: [],
    stats: {} as PlayerStats,
    isVirtual: false,
};

export const MOCK_PLAYER_COORD = { player: MOCK_PLAYER, position: 1 };
export const MOCK_PLAYER_TWO_COORD = { player: MOCK_PLAYER_TWO, position: 2 };

export const MOCK_PLAYER_COORDS = [MOCK_PLAYER_COORD, MOCK_PLAYER_TWO_COORD];
export const MOCKGAME: GameStructure = {
    id: 'testGame',
    gameName: 'Test Game',
    gameDescription: 'This is a test game',
    mapSize: '10',
    map: [],
    gameType: 'Test Type',
    isVisible: true,
    creationDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
};
export const DEFAULT_AVATAR_LIST = [
    { name: 'Avatar 1', img: './assets/characters/1.png' },
    { name: 'Avatar 2', img: './assets/characters/2.png' },
    { name: 'Avatar 3', img: './assets/characters/3.png' },
    { name: 'Avatar 4', img: './assets/characters/4.png' },
    { name: 'Avatar 5', img: './assets/characters/5.png' },
    { name: 'Avatar 6', img: './assets/characters/6.png' },
    { name: 'Avatar 7', img: './assets/characters/7.png' },
    { name: 'Avatar 8', img: './assets/characters/8.png' },
    { name: 'Avatar 9', img: './assets/characters/9.png' },
    { name: 'Avatar 10', img: './assets/characters/10.png' },
    { name: 'Avatar 11', img: './assets/characters/11.png' },
    { name: 'Avatar 12', img: './assets/characters/12.png' },
];
