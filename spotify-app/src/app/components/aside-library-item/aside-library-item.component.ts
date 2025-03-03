import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside-library-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './aside-library-item.component.html',
  styleUrl: './aside-library-item.component.css'
})
export class AsideLibraryItemComponent {}
