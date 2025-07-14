import { ChangeDetectorRef, Component, computed, effect, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/app/services/auth/auth.service';
import { SearchService } from '@/app/services/search/seach.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  private searchSubject = new Subject<string>();
  private cdr = inject(ChangeDetectorRef); 

  currentUser = this.authService.currentUser;
  showUserMenu = false;

  userInitial = computed(() => {
    const firstName = this.currentUser()?.first_name || '';
    return firstName.charAt(0).toUpperCase();
  });

  constructor() {
    // Configura el debounce para las búsquedas
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.handleSearch(query);
    });

    effect(() => {
      this.cdr.detectChanges();
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  private handleSearch(query: string) {
    this.searchService.updateSearch(query);
    if (query) {
      this.router.navigate(['/buscar'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/']);
    }
  }

  goToProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/perfil']);
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
    this.searchService.clearResults();
  }
}
