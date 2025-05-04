import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LogMessage } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatCardModule, MatChipsModule, MatProgressBarModule, FormsModule, CommonModule],
    templateUrl: './logs.component.html',
    styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
    @ViewChild('logsContainer') logsContainer: ElementRef;
    @Input() roomId: string;
    @Input() player: Player;

    btnText: string = 'Journalisation des messages';
    logs: LogMessage[] = [];
    playerLogs: LogMessage[] = []; // Logs that concern the player only
    currentLogs = this.logs;

    constructor(
        private socketService: SocketService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.receiveLog();
    }

    receiveLog() {
        this.socketService.on('newLog', (log: LogMessage) => {
            if (!log.exclusive) this.logs.push(log);
            if (log.receiver === this.player.id || log.sender === this.player.id) {
                if (log.exclusive) this.logs.push(log);
                this.playerLogs.push(log);
            }
            this.cdr.detectChanges();
            this.scrollToBottom();
        });
    }

    scrollToBottom() {
        this.logsContainer.nativeElement.scrollTop = this.logsContainer.nativeElement.scrollHeight;
    }

    toggleLogs() {
        if (this.currentLogs === this.logs) {
            this.currentLogs = this.playerLogs;
            this.btnText = 'Afficher tous les messages';
        } else {
            this.currentLogs = this.logs;
            this.btnText = 'Filtrer messages';
        }
    }
}
