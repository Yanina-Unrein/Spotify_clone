import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/app/services/auth/auth.service';
import { User } from '@/app/models/UserModel';

@Component({
  selector: 'app-menu-top',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './menu-top.component.html',
  styleUrls: ['./menu-top.component.css']
})
export class MenuTopComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitial(): string {
    return this.currentUser?.first_name.charAt(0).toUpperCase() || '';
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  onSearch(query: string) {
    if (query) {
      this.router.navigate(['/buscar'], { queryParams: { q: query } });
    }
  }
}
