import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiServices } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreatePredictionService {
  constructor(private apiService: ApiServices) { }

  createPrediction(data: { categoryId: number, type: string, title: string, imageLink: string, options: string[] }): Observable<any> {
    return this.apiService.apiCall('/predictions/create-prediction', 'POST', data);
  }
}
