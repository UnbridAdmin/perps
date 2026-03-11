import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-how-it-work-intuition',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './how-it-work-intuition.component.html',
    styleUrls: ['./how-it-work-intuition.component.scss']
})
export class HowItWorkIntuitionComponent {
    constructor(public activeModal: NgbActiveModal) { }
}
