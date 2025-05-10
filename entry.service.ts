import { Injectable } from '@angular/core';
//imports the @injectable decorator, which allows this class to be injected into other components or services.
import { HttpClient } from '@angular/common/http';
//imports Angular's built-in HTTP client, which is used to make HTTP requests to a server.
import { Observable } from 'rxjs';
//imports Observables from RxJS. Angular's HTTP methods return Observable types, which represent asynchronous data streams.

//TS interface for what an entry looks like. ensures that all entries have a serial number (srno), name, branch, and rollno
interface Entry {
  srno: number | null;
  name: string;
  branch: string;
  rollno: string;
}

//marks the class as injectable by Angular's  Dependency Injection system.
@Injectable({
  providedIn: 'root', // this means that this service is singleton and would not be needed to be declared within a module. 
})

//declares the service class that will hold all the logic to interact to the backend api
export class EntryService {

  //
  private apiUrl = 'http://localhost:3000/entries';

  constructor(private http: HttpClient) {}

  getEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.apiUrl);
  }

  addEntry(entry: Entry): Observable<any> {
    return this.http.post(this.apiUrl, entry);
  }

  updateEntry(srno: number, entry: Entry): Observable<any> {
    return this.http.put(`${this.apiUrl}/${srno}`, entry);
  }

  deleteEntry(srno: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${srno}`);
  }
}

// this file defines a service for handling HTTP operations related to student entries.