import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiServicesService {
  constructor(private http: HttpClient) {}

  getPlayListInfoById(playListId: number): Observable<any> {
    return this.http.get(`/api/get-info-playlist.json?id=${playListId}`);
  }
}
