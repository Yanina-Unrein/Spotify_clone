import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayListDetailComponent } from './pages/playlistdetail/play-list-detail/play-list-detail.component';



export const routes: Routes = [
    { 
        path: '', 
        component: HomeComponent ,
        children: [
            {
              path: 'playlist/:id',
              component: PlayListDetailComponent
            }
          ]
        }
];
