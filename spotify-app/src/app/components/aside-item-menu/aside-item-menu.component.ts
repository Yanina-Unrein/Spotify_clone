import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside-item-menu',
  imports: [CommonModule, RouterLink],
  templateUrl: './aside-item-menu.component.html',
  styleUrl: './aside-item-menu.component.css',
  standalone: true,
})
export class AsideItemMenuComponent implements OnInit {
  mainMenu: {
    defaultOptions: Array<any>;
    accessLink: Array<any>;
  } = { defaultOptions: [], accessLink: [] };

  constructor() {}

  ngOnInit(): void {
    this.mainMenu.defaultOptions = [
      {
        name: 'Inicio',
        icon: 'Home.svg',
        router: ['/'],
      },
      {
        name: 'Buscar',
        icon: 'Search.svg',
        router: ['/buscar'],
      },
    ];
  }
}
