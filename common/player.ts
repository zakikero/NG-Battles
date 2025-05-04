import { ItemTypes } from '@common/tile-types';

export interface Player {
    id: string;
    name: string;
    isAdmin: boolean;
    avatar: string;
    attributes: PlayerAttribute;
    isActive: boolean;
    abandoned: boolean;
    wins: number;
    isVirtual: boolean;
    virtualProfile?: string;
    inventory: ItemTypes[];
    homePosition?: number;
    stats: PlayerStats;
    actionNumber?: number;
}

export interface PlayerAttribute {
    health: number; // maxHealth
    currentHealth?: number;
    speed: number; // maxSpeed
    currentSpeed?: number;
    attack: number; // maxAttack
    currentAttack?: number;
    defense: number; // maxDefense
    currentDefense?: number;
    dice: string;
    escape?: number;
    isCombatBoostedAttack?: boolean;
    isCombatBoostedDefense?: boolean;
    itemsHeld?: Set<ItemTypes>;
}

export interface PlayerCoord {
    player: Player;
    position: number;
}

export interface PlayerStats {
    combatCount: number;
    escapeCount: number;
    victoryCount: number;
    defeatCount: number;
    totalHealthLost: number;
    totalHealthTaken: number;
    uniqueItemsCollected: number;
    visitedTilesPercent: number;
    visitedTiles: Set<number>;
}
