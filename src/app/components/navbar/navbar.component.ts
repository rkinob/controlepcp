import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../model/usuario';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: Usuario | null = null;
  isMenuOpen = false;
  openSubmenu: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navbar = document.querySelector('.navbar');

    // Se clicou fora do navbar e o menu está aberto
    if (navbar && !navbar.contains(target) && this.isMenuOpen) {
      this.closeMenu();
    }

    // Fechar submenu se clicar fora dele (desktop)
    if (this.openSubmenu && !target.closest('.has-submenu')) {
      this.openSubmenu = null;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.openSubmenu = null;
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.openSubmenu = null;
  }

  toggleSubmenu(submenu: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openSubmenu = this.openSubmenu === submenu ? null : submenu;
  }

  isSubmenuOpen(submenu: string): boolean {
    return this.openSubmenu === submenu;
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
