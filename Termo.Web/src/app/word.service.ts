import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WordValidations } from './models/WordValidations';

@Injectable({
  providedIn: 'root'
})
export class WordService {

  apiURL = 'https://localhost:7015/words/';

  constructor(private http: HttpClient) { }

  getWord(): Observable<string> {
    return this.http.get<string>(this.apiURL);
  }

  getValidations(word: string): Observable<WordValidations> {
    return this.http.get<WordValidations>(`${this.apiURL}validations?word=${word}`);
  }
}
