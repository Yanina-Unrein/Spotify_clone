import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/app/services/auth/auth.service';
import { SearchService } from '@/app/services/search/seach.service';

@Component({
  selector: 'app-menu-top',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu-top.component.html',
  styleUrls: ['./menu-top.component.css']
})
export class MenuTopComponent {
 private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  // Usamos la signal directamente
  currentUser = this.authService.currentUser;
  showUserMenu = false;

  getUserInitial(): string {
    // Accedemos al valor de la signal con ()
    return this.currentUser()?.first_name?.charAt(0).toUpperCase() || '';
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
    this.searchService.clearResults();
  }

  onSearch(query: string) {
    this.searchService.updateSearch(query);
    if (query) {
      this.router.navigate(['/buscar'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/']);
    }
  }
}
