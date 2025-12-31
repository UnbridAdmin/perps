import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home">
      <h2>Perps Home</h2>
      <p>This is the initial structure for the Perps project.</p>
    </div>
  `,
  styles: [`
    .home {
      padding: 20px;
    }
  `]
})
export class HomeComponent {

}
