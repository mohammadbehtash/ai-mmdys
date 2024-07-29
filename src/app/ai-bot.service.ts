import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AiBotService {
 private BaseUrl='http://localhost:3000/api/query'
  constructor(private Http:HttpClient) { }

  getResponse(query:string):Observable<any>{
   

    return this.Http.post<any>(this.BaseUrl,{query})
  }
}
