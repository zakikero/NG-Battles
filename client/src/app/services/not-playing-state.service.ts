import { Injectable } from '@angular/core';
import { GameState } from '@common/game-structure';
import { BaseStateService } from './base-state.service';

@Injectable()
export class NotPlayingStateService extends BaseStateService {
    onMouseDown(): GameState {
        return GameState.NOTPLAYING;
    }
}
