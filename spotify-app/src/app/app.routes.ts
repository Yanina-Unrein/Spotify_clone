import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayListDetailComponent } from './pages/playlistdetail/play-list-detail/play-list-detail.component';
import { PlaylistContainerComponent } from './components/playlist-container/playlist-container.component';
import { ArtistDetailComponenComponent } from './pages/artistlistdetail/artist-detail-componen/artist-detail-componen.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { SearchComponent } from './components/search/search/search.component';



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
            { path: 'buscar', 
              component: SearchComponent
            },         
          ]
      },
      {
        path: 'registrarse', 
        component: SignUpComponent
      },
      {
        path: 'login', 
        component: LogInComponent
      },
];
