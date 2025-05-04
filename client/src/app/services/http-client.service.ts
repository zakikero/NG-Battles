import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameStructure } from '@common/game-structure';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class HttpClientService {
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly BASE_URL = environment.serverUrl + '/api';

    constructor(private readonly httpService: HttpClient) {}

    async gameExists(id: string): Promise<boolean> {
        return (await this.getGame(id)) !== null;
    }

    sendGame(gameJson: GameStructure) {
        gameJson.creationDate = new Date().toISOString();
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.post(`${this.BASE_URL}/game/upload/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    async getGame(id: string): Promise<GameStructure> {
        return await firstValueFrom(this.httpService.get<GameStructure>(`${this.BASE_URL}/game/get/` + id));
    }

    async getAllGames(): Promise<GameStructure[]> {
        return await firstValueFrom(
            this.httpService
                .get<GameStructure[]>(`${this.BASE_URL}/game/getAll/`)
                .pipe(map((games: GameStructure[]) => games.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()))),
        );
    }

    deleteGame(id: string) {
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.delete(`${this.BASE_URL}/game/delete/` + id, { headers: { 'Content-Type': 'application/json' } });
    }

    updateGame(gameJson: GameStructure) {
        gameJson.lastModified = new Date().toLocaleString('en-GB', { timeZone: 'America/Toronto' });
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.BASE_URL}/game/update/`, gameJson, { headers: { 'Content-Type': 'application/json' } });
    }

    changeVisibility(id: string) {
        // disabling to allow for the use of 'Content-Type' in train case as camelCase is required by eslint
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return this.httpService.patch(`${this.BASE_URL}/game/changeVisibility/` + id, {}, { headers: { 'Content-Type': 'application/json' } });
    }
}
