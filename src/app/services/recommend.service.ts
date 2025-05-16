import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../common/Product';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class RecommendService {

  url = 'https://electricshopbe.onrender.com/api/recommendations';

  constructor(private httpClient: HttpClient) { }
  
  getRecommend(userId: number) {
    return this.httpClient.get(this.url+'/nopage/' + userId);
  }
}
