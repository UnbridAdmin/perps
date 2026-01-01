import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements AfterViewInit {
  isSidebarExpanded = true;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const arrows = this.el.nativeElement.querySelectorAll('.arrow');
    arrows.forEach((arrow: any) => {
      arrow.addEventListener('click', (e: Event) => {
        const arrowParent = (e.target as HTMLElement).parentElement!.parentElement;
        arrowParent!.classList.toggle('showMenu');
      });
    });
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      // Agregar/remover clase al documento para que otros componentes se adapten
      if (sidebar.classList.contains('collapsed')) {
        this.renderer.addClass(document.documentElement, 'sidebar-collapsed');
      } else {
        this.renderer.removeClass(document.documentElement, 'sidebar-collapsed');
      }
    }
  }
}
