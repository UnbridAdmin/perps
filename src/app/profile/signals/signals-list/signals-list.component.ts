import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signal } from '../../../shared/models/signal.model';
import { SignalCardComponent } from '../signal-card/signal-card.component';

@Component({
    selector: 'app-signals-list',
    standalone: true,
    imports: [CommonModule, SignalCardComponent],
    templateUrl: './signals-list.component.html',
    styleUrl: './signals-list.component.scss'
})
export class SignalsListComponent {
    @Input() signals: Signal[] = [];
    @Input() loading: boolean = false;
}
