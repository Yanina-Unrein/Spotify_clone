import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayListDetailComponent } from './pages/playlistdetail/play-list-detail/play-list-detail.component';
import { PlaylistContainerComponent } from './components/playlist-container/playlist-container.component';
import { ArtistDetailComponenComponent } from './pages/artistlistdetail/artist-detail-componen/artist-detail-componen.component';



export const routes: Routes = [
    { 
        path: '', 
        component: HomeComponent ,
        children: [
            { path: '', component: PlaylistContainerComponent },
            {
              path: 'playlist/:id',
              component: PlayListDetailComponent
            },
            { path: 'artist/:id', 
              component: ArtistDetailComponenComponent 
            },
          ]
        }
];
