import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Product } from 'src/app/common/Product';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { ProductService } from 'src/app/services/product.service';
import { RateService } from 'src/app/services/rate.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product!: Product;
  products!: Product[];

  ListproductsCompare!: Product[];
  id!: number;

  isLoading = true;

  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];
  totalLike!: number;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  liked!: boolean;
  rates!:Rate[];
  rateAll!:Rate[];
  countRate!:number;

  itemsComment:number = 3;
  isShowProductCompare :boolean = false
  ProductCompare!:Product
  
  constructor(
    private productService: ProductService,
    private modalService: NgbModal,
    private cartService: CartService, 
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: CustomerService, 
    private favoriteService: FavoritesService,
    private sessionService: SessionService,
    private rateService: RateService) {
    route.params.subscribe(val => {
      this.ngOnInit();
    })
  }

  slideConfig = {"slidesToShow": 7, "slidesToScroll": 2, "autoplay": true};

  ngOnInit(): void {
    this.modalService.dismissAll();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.id = this.route.snapshot.params['id'];
    this.getProduct();
    this.getRates();
    this.getTotalLike();
    this.getAllRate();
    this.isLiked(this.product.productId);
  }

  setItemsComment(size: number) {
    this.getProduct();
    this.getRates();
    this.getTotalLike();
    this.getAllRate();
    this.itemsComment = size;
    console.log(this.itemsComment);
    
  }

  getProduct() {
    this.productService.getOne(this.id).subscribe(data => {
      this.isLoading = false;
      this.product = data as Product;
      this.productService.getSuggest(this.product.category.categoryId, this.product.productId).subscribe(data => {
        this.products = data as Product[];
        //this.ListproductsCompare = data as Product[];
        this.ListproductsCompare =JSON.parse(JSON.stringify(this.products));
      })
    }, error => {
      this.toastr.error('Data Error!', 'System!');
      this.router.navigate(['/home'])
    })
  }

  getRates() {
    this.rateService.getByProduct(this.id).subscribe(data=>{
      this.rates = data as Rate[];
    }, error=>{
      this.toastr.error('Error!', 'System!');
    })
  }

  getAllRate() {
    this.rateService.getAll().subscribe(data => {
      this.rateAll = data as Rate[];
    })
  }

  getAvgRate(id: number): number {
    let avgRating: number = 0;
    this.countRate = 0;
  
    // Kiểm tra xem this.rateAll đã được khởi tạo và có giá trị không
    if (this.rateAll) {
      for (const item of this.rateAll) {
        if (item.product.productId === id) {
          avgRating += item.rating;
          this.countRate++;
        }
      }
    }
  
    // Kiểm tra countRate để tránh chia cho 0
    return this.countRate === 0 ? 0 : Math.round(avgRating / this.countRate * 10) / 10;
  }
  isLiked(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
     this.liked = false;
    }
    this.favoriteService.getByProductIdAndEmail(id, email).subscribe(data => {
      if (data == null) {
        this.liked = false;
      } else {
        this.liked = true;
      }
    }, error => {
      this.toastr.error('Có lỗi xảy ra!', 'System!');
    })
  }
  toggleLike(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Vui lòng đăng nhập để tiếp tục', 'System!');
      return;
    }
    this.favoriteService.getByProductIdAndEmail(id, email).subscribe(data => {
      if (data == null) {
        this.customerService.getByEmail(email).subscribe(data => {
          this.customer = data as Customer;
          this.favoriteService.post(new Favorites(0, new Customer(this.customer.userId), new Product(id))).subscribe(data => {
            this.toastr.success('Thêm thành công!', 'System!');
            this.favoriteService.getByEmail(email).subscribe(data => {
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
              this.getTotalLike();
            }, error => {
              this.toastr.error('Data Error!', 'System!');
            })
          }, error => {
            this.toastr.error('Add Error!', 'System!');
          })
        })
      } else {
        this.favorite = data as Favorites;
        this.favoriteService.delete(this.favorite.favoriteId).subscribe(data => {
          this.toastr.info('Đã xóa khỏi danh sách yêu thích!', 'System!');
          this.favoriteService.getByEmail(email).subscribe(data => {
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
            this.getTotalLike();
          }, error => {
            this.toastr.error('Data Error!', 'System!');
          })
        }, error => {
          this.toastr.error('Error!', 'System!');
        })
      }
    })
  }

  getTotalLike() {
    this.favoriteService.getByProduct(this.id).subscribe(data => {
      this.totalLike = data as number;
    })
  }

  addCart(productId: number, price: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Vui lòng đăng nhập để sử dụng giỏ hàng', 'System!');
      return;
    }
    if(this.product.quantity < 1){
      this.toastr.info('Sản phẩm đã hết hàng!', 'System!');
      return;
    }
    
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.cartId));
      this.cartService.postDetail(this.cartDetail).subscribe(data => {
        this.toastr.success('Đã thêm vào giỏ hàng!', 'System!');
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
        })
      }, error => {
        this.toastr.error('Sản phẩm đã hết hàng!', 'System!');
        // this.router.navigate(['/home']);
        // window.location.href = "/";
      })
    })
  }

  searchQuery: string = '';
  CompareProduct(content: TemplateRef<any>) {
		this.modalService.open(content, { size: 'xl' });
    this.resetListProductsCompare();
    this.searchQuery = ""
	}
  FindProduct() {
    console.log(this.ListproductsCompare)
    this.resetListProductsCompare();
    if(this.searchQuery === ""){
      return
    }
    this.ListproductsCompare = this.ListproductsCompare.filter(product =>
        product.name.toUpperCase().includes(this.searchQuery.toUpperCase())
    );

   
  }
  resetListProductsCompare() {
    this.ListproductsCompare =  JSON.parse(JSON.stringify(this.products));
  }

  SelectProductCompare(item:Product){
    this.isShowProductCompare  = true
    this.ProductCompare = item
  }
  
  page: number = 1;

  key: string = '';
  keyF: string = '';
  reverse: boolean = true;

}
