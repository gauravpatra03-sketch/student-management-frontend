import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Dashboard } from 'src/app/models/dashboard';

import { CourseStatistics } from 'src/app/models/course-statistics';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = environment.apiUrl + '/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<Dashboard> {

    return this.http.get<Dashboard>(this.api);

  }

  // 👇 Add it here
  getCourseStatistics(): Observable<any[]> {

    return this.http.get<any[]>(this.api + '/courses');

  }

}