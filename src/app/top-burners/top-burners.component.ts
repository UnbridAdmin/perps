import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Router, RouterModule } from '@angular/router';
import { TopBurnersService } from './top-burners.service';
import { AuthorizationService } from '../services/authorization.service';
import { Subscription } from 'rxjs';

interface Burner {
  url_avatar: string;
  user_username: string;
  total_burned_fierce: number;
}

@Component({
  selector: 'app-top-burners',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, RouterModule],
  templateUrl: './top-burners.component.html',
  styleUrls: ['./top-burners.component.scss']
})
export class TopBurnersComponent implements OnInit, OnDestroy {
  burners: Burner[] = [];
  currentPage = 1;
  pageSize = 20;
  isLoading = false;
  hasMoreData = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private topBurnersService: TopBurnersService,
    private authService: AuthorizationService,
    private router: Router
  ) { }

  navigateToProfile(username: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Solución al bug: forzamos navegación completa incluso si la ruta es similar
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/' + username]);
    });
  }

  ngOnInit(): void {
    this.loadTopBurners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadTopBurners(): void {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    this.subscriptions.add(
      this.topBurnersService.getTopBurners(this.currentPage, this.pageSize).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            const newBurners = response.data.data || response.data;
            if (newBurners.length < this.pageSize) {
              this.hasMoreData = false;
            }
            this.burners = [...this.burners, ...newBurners];
            this.currentPage++;
          } else {
            this.hasMoreData = false;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading top burners:', err);
          this.isLoading = false;
          this.hasMoreData = false;
        }
      })
    );
  }

  onScroll(): void {
    this.loadTopBurners();
  }
}
