import { Player } from '@common/player';

export enum TilePreview {
    NONE,
    PREVIEW,
    SHORTESTPATH,
}

export interface TileStructure {
    idx: number;
    tileType: string;
    item: string;
    hasPlayer: boolean;
}

export interface GameTile extends TileStructure {
    isAccessible: TilePreview;
    player: Player | undefined;
}

export interface GameStructure {
    id: string;
    gameName: string;
    gameDescription: string;
    mapSize: string;
    map: TileStructure[];
    gameType: string;
    isVisible: boolean;
    creationDate: string;
    lastModified: string;
}

export interface ShortestPathByTile {
    [key: number]: number[];
}

export enum GameState {
    NOTPLAYING,
    MOVING,
    ACTION,
    COMBAT,
}

export enum TimerState {
    NONE,
    REGULAR,
    COOLDOWN,
    COMBAT,
}

export enum GameMode {
    ClASSIC = 'classic',
    CTF = 'ctf',
}
