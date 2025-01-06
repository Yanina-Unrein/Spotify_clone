import { Component } from '@angular/core';
import { AsideMenuComponent } from "../../components/aside-menu/aside-menu.component";
import { CommonModule } from '@angular/common';
import { Playlist } from '@/app/lib/data';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PlayerComponent } from '@/app/components/player/player.component';



@Component({
  selector: 'app-home',
  imports: [CommonModule, AsideMenuComponent, RouterOutlet, PlayerComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedCard: Playlist | null = null; // Inicialmente no hay tarjeta seleccionada

  constructor(private router: Router, private route: ActivatedRoute) {}

  // Método para manejar el clic en una tarjeta
  onCardClick(playlist: Playlist) {
    this.selectedCard = playlist;
    // Navegar a la ruta con el ID de la playlist dentro de la misma página
    this.router.navigate(['playlist', playlist.id], { relativeTo: this.route });
  }

  // Método para limpiar la selección de la tarjeta
  clearSelection() {
    this.selectedCard = null;
    this.router.navigate(['/']);  // Navega a la ruta principal
  }
}
