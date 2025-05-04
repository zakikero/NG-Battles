import { GameValidationService } from '@app/services/game-validation.service';
import { GameService } from '@app/services/game.service';
import { GameStructure } from '@common/game-structure';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly validationService: GameValidationService,
    ) {}

    @Post('upload')
    async uploadGame(@Body() gameData: GameStructure) {
        const errors = await this.validationService.validateNewGame(gameData);
        if (errors.length > 0) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Validation failed',
                    errors,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.gameService.create(gameData);
    }

    @Patch('update')
    async updateGame(@Body() gameData: GameStructure) {
        if (!(await this.validationService.idExists(gameData.id))) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Validation failed',
                    errors: ['Id does not exist'],
                },
                HttpStatus.NOT_FOUND,
            );
        }
        const errors = await this.validationService.validateUpdatedGame(gameData);
        if (errors.length > 0) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Validation failed',
                    errors,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.gameService.update(gameData);
    }

    @Patch('changeVisibility/:id')
    async changeVisibility(@Param('id') id: string) {
        await this.gameService.changeVisibility(id);
    }

    @Delete('delete/:id')
    async deleteGame(@Param('id') id: string) {
        await this.gameService.delete(id);
    }

    @Get('get/:id')
    async getGame(@Param('id') id: string) {
        return await this.gameService.get(id);
    }

    @Get('getAll')
    async getAllGames() {
        return await this.gameService.getAll();
    }
}
