import { NgFor } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Avatar } from '@app/interfaces/avatar';
import { DEFAULT_AVATAR_LIST } from '@app/services/constants';

@Component({
    selector: 'app-avatar-slider',
    standalone: true,
    imports: [NgFor],
    templateUrl: './avatar-slider.component.html',
    styleUrl: './avatar-slider.component.scss',
})
export class AvatarSliderComponent {
    @ViewChild('widgetsContent', { static: false }) widgetsContent: ElementRef;
    @Output() selectedAvatarEmitter = new EventEmitter<Avatar>();
    @Input() avatars: Avatar[] = DEFAULT_AVATAR_LIST;

    selectedAvatar: Avatar | null = null;
    // eslint-disable-next-line -- constants must be in SCREAMING_SNAKE_CASE
    private readonly SCROLL_VALUE: number = 500;

    scrollLeft(): void {
        this.widgetsContent.nativeElement.scrollLeft -= this.SCROLL_VALUE;
    }

    scrollRight(): void {
        this.widgetsContent.nativeElement.scrollLeft += this.SCROLL_VALUE;
    }

    selectAvatar(avatar: Avatar): void {
        this.selectedAvatar = avatar;
        this.selectedAvatarEmitter.emit(this.selectedAvatar);
    }
}
