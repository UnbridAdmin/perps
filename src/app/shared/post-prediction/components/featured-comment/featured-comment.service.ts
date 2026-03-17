import { Injectable } from '@angular/core';
import { ApiServices } from '../../../../services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeaturedCommentService {

  constructor(private apiService: ApiServices) { }

  /**
   * Overthrows the current king of the hill by burning more Fierce tokens.
   * @param predictionId The ID of the prediction.
   * @param comment The comment text.
   * @param urlGif The URL of the GIF (if any).
   * @param burnedFierce The amount of Fierce tokens to burn.
   */
  overthrowKing(predictionId: number, comment: string, urlGif: string, burnedFierce: number): Observable<any> {
    const payload = {
      predictionId,
      comment,
      urlGif,
      burnedFierce
    };
    return this.apiService.apiCall('predictions/overthrow-king', 'POST', payload);
  }
}
