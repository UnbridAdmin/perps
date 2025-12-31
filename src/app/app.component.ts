import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <h1>Welcome to Perps</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
      padding: 20px;
    }
  `],
  standalone: true,
})
export class AppComponent {
  title = 'perps';
}
