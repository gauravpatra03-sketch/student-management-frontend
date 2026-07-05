import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Student } from 'src/app/models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private api = environment.apiUrl + '/students';

  constructor(private http: HttpClient) { }

  getStudents(): Observable<Student[]> {

    return this.http.get<Student[]>(this.api);

  }

  getStudent(id: number): Observable<Student> {

    return this.http.get<Student>(`${this.api}/${id}`);

  }

  addStudent(student: Student): Observable<Student> {

    return this.http.post<Student>(this.api, student);

  }

  updateStudent(id: number, student: Student): Observable<Student> {

    return this.http.put<Student>(`${this.api}/${id}`, student);

  }

  deleteStudent(id: number): Observable<any> {

    return this.http.delete(`${this.api}/${id}`);

  }

  searchStudent(name: string): Observable<Student[]> {

    return this.http.get<Student[]>(`${this.api}/search/${name}`);

  }

}