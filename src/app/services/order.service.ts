import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../common/Cart';
import { Order } from '../common/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  url = "https://electricshopbe.onrender.com/api/orders";

  urlOrderDetail = "https://electricshopbe.onrender.com/api/orderDetail";

  constructor(private httpClient: HttpClient) { }

  post(email: string, cart: Cart) {
    return this.httpClient.post(this.url+'/'+email, cart);
  }

  get(email:string) {
    return this.httpClient.get(this.url+'/user/'+email);
  }

  getById(id:number) {
    return this.httpClient.get(this.url+'/'+id);
  }

  getByOrder(id:number) {
    return this.httpClient.get(this.urlOrderDetail+'/order/'+id);
  }

  cancel(id: number) {
    return this.httpClient.get(this.url+'/cancel/'+id);
  }
  paid(id: number) {
    return this.httpClient.get(this.url+'/paid/'+id);
  }
  postpaypal(email: string, cart: Cart) {
    return this.httpClient.post(this.url+'/paypal/'+email, cart);
  }
  
}
