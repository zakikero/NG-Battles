import { Game } from '@app/model/schema/game.schema';
import { GameStructure } from '@common/game-structure';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

    async create(game: GameStructure): Promise<Game> {
        return await this.gameModel.create(game);
    }

    async update(game: GameStructure): Promise<Game> {
        // no-unused-vars is disabled because creationDate is not used in the updateData object
        // eslint-disable-next-line no-unused-vars
        const { creationDate, ...updateData } = game;
        return await this.gameModel.findOneAndUpdate({ id: game.id }, updateData).exec();
    }

    async changeVisibility(gameId: string): Promise<Game> {
        const filteredGameById: Game = await this.gameModel.findOne({ id: gameId }).exec();
        return await this.gameModel.findOneAndUpdate({ id: gameId }, { isVisible: !filteredGameById.isVisible }).exec();
    }

    async delete(gameId: string) {
        await this.gameModel.deleteOne({ id: gameId });
    }

    async get(gameId: string): Promise<Game> {
        return await this.gameModel.findOne({ id: gameId }).exec();
    }

    async getAll(): Promise<Game[]> {
        return await this.gameModel.find().exec();
    }
}
