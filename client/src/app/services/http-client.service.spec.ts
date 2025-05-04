import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameStructure } from '@common/game-structure';
import { HttpClientService } from './http-client.service';
/* eslint-disable */

describe('HttpClientService', () => {
    let service: HttpClientService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [HttpClientService, provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(HttpClientService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if game exists and return true', async () => {
        const gameId = '123';
        const mockGame = { id: gameId } as GameStructure;

        spyOn(service, 'getGame').and.returnValue(Promise.resolve(mockGame));
        const exists = await service.gameExists(gameId);
        expect(exists).toBeTrue();
    });

    it('should check if game exists and return false', async () => {
        const gameId = '123';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(service, 'getGame').and.resolveTo(null as any);
        const notExists = await service.gameExists(gameId);
        expect(notExists).toBeFalse();
    });

    it('should send game', () => {
        const gameJson = { id: '123' } as GameStructure;
        service.sendGame(gameJson).subscribe();

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/upload/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush({});
    });

    it('should get game', async () => {
        const gameId = '123';
        const mockGame = { id: gameId } as GameStructure;

        service.getGame(gameId).then((game) => {
            expect(game).toEqual(mockGame);
        });

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/get/${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockGame);
    });

    it('should get all games', () => {
        const mockGames = [
            { id: '1', creationDate: '2023-01-01' },
            { id: '2', creationDate: '2023-01-02' },
        ] as GameStructure[];

        service.getAllGames().then((games) => {
            expect(games).toEqual(mockGames);
        });

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/getAll/`);
        expect(req.request.method).toBe('GET');
        req.flush(mockGames);
    });

    it('should delete game', () => {
        const gameId = '123';
        service.deleteGame(gameId).subscribe();

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/delete/${gameId}`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush({});
    });

    it('should update game', () => {
        const gameJson = { id: '123' } as GameStructure;
        service.updateGame(gameJson).subscribe();

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/update/`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush({});
    });

    it('should change visibility of game', () => {
        const gameId = '123';
        service.changeVisibility(gameId).subscribe();

        const req = httpMock.expectOne(`${service['BASE_URL']}/game/changeVisibility/${gameId}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush({});
    });
});
