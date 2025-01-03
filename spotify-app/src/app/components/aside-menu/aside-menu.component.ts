import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AsideItemMenuComponent } from "../aside-item-menu/aside-item-menu.component";
import { AsideLibraryItemComponent } from "../aside-library-item/aside-library-item.component";
import { Playlist, playlists } from '@/app/lib/data';
import { CardAsideComponent } from '../card-aside/card-aside.component';



@Component({
  selector: 'app-aside-menu',
  imports: [CommonModule, AsideItemMenuComponent, AsideLibraryItemComponent, CardAsideComponent],
  templateUrl: './aside-menu.component.html',
  styleUrl: './aside-menu.component.css'
})
export class AsideMenuComponent implements OnInit {
  playlists: Playlist[] = []; // Inicializa la propiedad

  ngOnInit(): void {
    // Asigna las playlists desde el archivo de datos
    this.playlists = playlists;
  }

}
