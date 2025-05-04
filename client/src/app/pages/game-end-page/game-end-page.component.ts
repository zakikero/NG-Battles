import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GlobalStatsComponent } from '@app/components/global-stats/global-stats.component';
import { PlayerStatsComponent } from '@app/components/player-stats/player-stats.component';
import { SocketService } from '@app/services/socket.service';
import { GlobalStats } from '@common/global-stats';
import { Player } from '@common/player';

@Component({
    selector: 'app-game-end-page',
    standalone: true,
    imports: [ChatComponent, PlayerStatsComponent, GlobalStatsComponent, RouterLink],
    templateUrl: './game-end-page.component.html',
    styleUrl: './game-end-page.component.scss',
})
export class GameEndPageComponent implements OnInit {
    roomId: string;
    characterName: string;
    playerList: Player[];
    globalStats: GlobalStats;
    gameMode: string;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly socketService: SocketService,
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe((queryParams) => {
            const navDataString = queryParams['data'];
            if (navDataString) {
                const navData = JSON.parse(navDataString);
                this.roomId = navData.roomId;
                this.characterName = navData.characterName;
                this.globalStats = navData.globalStats;
                this.playerList = navData.players;
            }
        });
    }

    leaveRoom() {
        this.socketService.disconnect();
    }
}
