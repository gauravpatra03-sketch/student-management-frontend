import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Login } from 'src/app/models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(login: Login): Observable<any> {

    return this.http.post(`${this.api}/login`, login);

  }

  register(signupData: Login): Observable<any> {

    return this.http.post(`${this.api}/register`, signupData);

  }

}