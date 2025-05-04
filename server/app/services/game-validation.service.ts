import { Game } from '@app/model/schema/game.schema';
import { MapValidationService } from '@app/services/map-validation.service';
import { GameStructure, TileStructure } from '@common/game-structure';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PROPERTIES_TO_CHECK } from './validation-constants';

@Injectable()
export class GameValidationService {
    errors: string[] = [];

    constructor(
        @InjectModel(Game.name) private gameModel: Model<Game>,
        private readonly mapValidationService: MapValidationService,
    ) {}

    async validateNewGame(game: GameStructure): Promise<string[]> {
        this.errors = [];
        this.validateProperties(game);
        this.validateMap(game);
        this.validateGameName(game);
        this.validateCtfGameMode(game);
        await this.validateUniqueChecks(game);

        return this.errors;
    }

    validateCtfGameMode(game: GameStructure) {
        if (game.gameType !== 'ctf') return;
        if (!game.map.find((tile) => tile.item === 'drapeau-A')) {
            this.errors.push("Il n'y a pas de drapeau sur la carte");
        }
    }

    async validateUpdatedGame(game: GameStructure): Promise<string[]> {
        this.errors = [];

        this.validateProperties(game);
        this.validateMap(game);
        this.validateGameName(game);
        this.validateCtfGameMode(game);
        await this.validateUniqueNameUpdate(game.gameName, game.id);

        return this.errors;
    }

    async idExists(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length !== 0;
    }

    async isUniqueNewName(name: string): Promise<boolean> {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name }).exec();
        return filteredGamesByName.length === 0;
    }

    async validateUniqueNameUpdate(name: string, id: string) {
        const filteredGamesByName: Game[] = await this.gameModel.find({ gameName: name, id: { $ne: id } }).exec();
        if (filteredGamesByName.length !== 0) {
            this.errors.push('Un jeu avec ce nom existe déjà');
        }
    }

    async isUniqueId(id: string): Promise<boolean> {
        const filteredGamesById: Game[] = await this.gameModel.find({ id }).exec();
        return filteredGamesById.length === 0;
    }

    validateProperties(game: GameStructure): void {
        for (const { prop, emptyMsg, type, typeMsg } of PROPERTIES_TO_CHECK) {
            if (!game[prop]) {
                this.errors.push(emptyMsg);
            }
            if (typeof game[prop] !== type) {
                this.errors.push(typeMsg);
            }
        }
    }

    isValidTileJson(tile: TileStructure): boolean {
        if (
            tile &&
            typeof tile.idx === 'number' &&
            tile.idx >= 0 &&
            typeof tile.tileType === 'string' &&
            typeof tile.item === 'string' &&
            typeof tile.hasPlayer === 'boolean'
        ) {
            return true;
        }
        return false;
    }

    validateMap(game: GameStructure): void {
        if (!game.map || !Array.isArray(game.map)) {
            this.errors.push('La carte ne peut pas être vide et doit être un tableau');
            return;
        } else {
            for (const tile of game.map) {
                if (!this.isValidTileJson(tile)) {
                    this.errors.push('La carte contient des tuiles invalides');
                    break;
                }
            }
        }
        this.validateMapServices(game);
    }

    validateGameName(game: GameStructure): void {
        if (/\s{2,}/.test(game.gameName) || game.gameName.trim() !== game.gameName) {
            this.errors.push('Le nom ne doit pas contenir des espaces doubles ou des espaces au début/à la fin');
        }
        if (/[^a-zA-Z0-9 àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(game.gameName)) {
            this.errors.push('Le nom ne doit pas contenir de symboles comme / ? ! - _');
        }
    }

    async validateUniqueChecks(game: GameStructure): Promise<void> {
        if (!(await this.isUniqueNewName(game.gameName))) {
            this.errors.push('Un jeu avec ce nom existe déjà');
        }
        if (!(await this.isUniqueId(game.id))) {
            this.errors.push('Un jeu avec cet id existe déjà');
        }
    }

    validateMapServices(game: GameStructure): void {
        if (game.map.length !== parseInt(game.mapSize, 10) ** 2) {
            this.errors.push('La taille de la carte ne correspond pas à la taille de la carte');
            return; // return early to avoid further errors in MapValidationService
        }
        if (!this.mapValidationService.hasStartingPoints(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push("Il n'y a pas assez de points de départ");
        }
        if (!this.mapValidationService.hasCorrectGroundAmount(game.map)) {
            this.errors.push('Le nombre de tuiles de terrain doit etre supérieur à 50%');
        }
        if (!this.mapValidationService.areAllTilesAccessible(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push('Toutes les tuiles ne sont pas accessibles');
        }
        if (!this.mapValidationService.areAllDoorsValid(game.map, parseInt(game.mapSize, 10))) {
            this.errors.push('Toutes les portes ne sont pas valides');
        }
    }
}
