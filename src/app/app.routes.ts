import { Routes } from '@angular/router';
import { PlaylistContainerComponent } from './components/playlist-container/playlist-container.component';
import { HomeComponent } from './features/home/home.component';
import { PlayListDetailComponent } from './features/playlistdetail/play-list-detail/play-list-detail.component';
import { ArtistDetailComponenComponent } from './features/artistlistdetail/artist-detail-componen/artist-detail-componen.component';
import { SearchComponent } from './components/shared/search/search/search.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { LogInComponent } from './features/log-in/log-in.component';
import { ResetPasswordComponent } from './features/resetPassword/reset-password/reset-password.component';
import { PerfilComponent } from './features/perfil/perfil.component';


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
            {
              path: 'perfil',
              component: PerfilComponent
            }        
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
      {
        path: 'reset-password', 
        component: ResetPasswordComponent
      }
];
