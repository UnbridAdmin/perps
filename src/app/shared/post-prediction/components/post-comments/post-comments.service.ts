import { Injectable } from '@angular/core';
import { ApiServices } from '../../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostCommentsService {

  constructor(private apiService: ApiServices) { }

  /**
   * Submits a new comment for a prediction.
   * @param predictionId The ID of the prediction.
   * @param comment The comment text.
   * @param urlGif The URL of the GIF (if any).
   * @param burnedFierce The amount of Fierce tokens to burn (optional).
   */
  submitComment(predictionId: number, comment: string, urlGif: string, burnedFierce: number): Observable<any> {
    const payload = {
      predictionId,
      comment,
      urlGif,
      burnedFierce
    };
    return this.apiService.apiCall('predictions/submit-comment', 'POST', payload);
  }

  /**
   * Fetches paginated comments for a prediction.
   * @param predictionId The ID of the prediction.
   * @param page The page number.
   * @param limit The number of items per page.
   */
  getComments(predictionId: number, page: number, limit: number): Observable<any> {
    return this.apiService.apiCall(`predictions/get-comments?prediction_id=${predictionId}&page=${page}&limit=${limit}`, 'GET', null);
  }
}
