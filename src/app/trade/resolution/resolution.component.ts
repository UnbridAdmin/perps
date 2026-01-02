import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resolution',
  standalone: true,
  imports: [],
  templateUrl: './resolution.component.html',
  styleUrl: './resolution.component.scss',
})
export class ResolutionComponent {
  @Input() date: string = '';
}
