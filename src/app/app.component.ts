import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DynamicFormMobilePage } from '../pages/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicFormWebPage } from '../pages/dynamic-form-web/dynamic-form-web';
import { DynamicRangePage } from '../pages/dynamic-range/dynamic-range';
import { DynamicListPage } from '../pages/dynamic-list/dynamic-list';
import { DynamicListOrderPage } from '../pages/dynamic-list-order/dynamic-list-order';
import { DynamicTreePage } from '../pages/dynamic-tree/dynamic-tree';
import { DynamicMediasPage } from '../pages/dynamic-medias/dynamic-medias';
import { DynamicCardSocialPage } from '../pages/dynamic-card-social/dynamic-card-social';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { LoginPage } from '../pages/login/login';
import { SignaturePage } from '../pages/signature/signature';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiAuthService } from '../services/apiAuthService';
import { HomeMenuPage } from '../pages/home-menu/home-menu';
import { HomeSpeedtestPage } from '../pages/home-speedtest/home-speedtest';
import { OwnerImagesPage } from '../pages/owner-images/owner-images';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage:any = HomeMenuPage;
  
  treeMenu:any;
  callbackTreeMenu:any;
  userInfo:any; 

  constructor(
    private menuCtrl: MenuController, //goi trong callback
    private modalCtrl: ModalController,
    private apiStorageService: ApiStorageService,
    private auth: ApiAuthService,
    private events: Events,
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen
    ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {
    
    this.callbackTreeMenu = this.callbackTree;

    this.ionViewDidLoad_main();
      
  }

  ionViewDidLoad_main() {
    //console.log('3. ionViewDidLoad Home');
    
    this.checkTokenLogin();
    //dang ky dich vu kiem tra user login ok
    
    this.events.subscribe('user-log-in-ok', (() => {
      this.checkTokenLogin();
      //console.log('user-log-in-ok');
    }));
    
    this.events.subscribe('user-log-out-ok', (() => {
      this.checkTokenLogin();
    }));

    this.events.subscribe('user-change-image-ok', (() => {
      console.log('call change image');
      this.userChangeImage();
    }));

  }

  userChangeImage(){

    this.userInfo.data.image = ApiStorageService.mediaServer + "/db/get-private?func=avatar&token="+this.apiStorageService.getToken();
    this.userInfo.data.background = ApiStorageService.mediaServer + "/db/get-private?func=background&token="+this.apiStorageService.getToken();

  }

  checkTokenLogin(){

    if (this.apiStorageService.getToken()) {
      this.auth.authorize
        (this.apiStorageService.getToken())
        .then(data => {
          
          //console.log(data);

          this.auth.getServerPublicRSAKey()
            .then(pk => {
              
              this.userInfo = data.user_info;
              //Tiêm token cho các phiên làm việc lấy số liệu cần xác thực
              if (this.userInfo) this.auth.injectToken(); 
              this.userChangeImage();
              this.resetTreeMenu();
            })
            .catch(err => {
              this.resetTreeMenu();
              console.log('Error get Public key',err);
            });
        })
        .catch(err => {
          this.auth.deleteToken();
          this.resetTreeMenu();
        });
    } else {
      this.userInfo = undefined;
      this.resetTreeMenu();
    }
    
  }

  resetTreeMenu(){

    //tuy thuoc vao tung user se co menu khac nhau

    if (this.userInfo&&(this.userInfo.username==='903500888'||this.userInfo.username==='702418821')){
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
  
          icon: "home"
        }
        ,
        {
          name: "2. Home & Tabs speedtest",
          size: "1.3em",
          click: true,
          next: HomeSpeedtestPage,
          icon: "speedometer"
        }
        ,
        {
          name: "3. Các mẫu reponsive",
          size: "1.3em",
          subs: [
            {
              name: "3.1 Các nhập liệu",
              size: "1.3em",
              subs: [
              {
                name: "3.1.1 Mẫu nhập liệu toàn màn hình dành cho di động",
                click: true,
                next: DynamicFormMobilePage,
                icon: "phone-portrait"
              }
              ,
              {
                name: "3.1.2 Nhập liệu và hiển thị cho desktop & di động",
                click: true,
                next: DynamicFormWebPage,
                icon: "desktop"
              }
              ,
              {
                name: "3.1.3 Mẫu nhập chọn & kéo",
                click: true,
                next: DynamicRangePage,
                icon: "radio-button-on"
              }
            ]
            }
            ,
            {
              name: "3.2 Các mẫu hiển thị danh sách",
              size: "1.3em",
              subs: [
              {
                name: "3.2.1 Mẫu danh sách quẹt nút click",
                click: true,
                next: DynamicListPage,
                icon: "paper"
              }
              ,
              {
                name: "3.2.2 Mẫu danh sách bảng, liệt kê & sắp xếp lại",
                click: true,
                next: DynamicListOrderPage,
                icon: "reorder"
              }
              ,
              {
                name: "3.2.3 Mẫu danh sách theo cây FamilyTree",
                click: true,
                next: DynamicTreePage,
                icon: "menu"
              }
            ]
            }
            ,
            {
              name: "3.3 Các mẫu xử lý hình ảnh và file",
              size: "1.3em",
              subs: [
              {
                name: "3.3.1 Mẫu upload ảnh theo facebook",
                click: true,
                next: DynamicMediasPage,
                icon: "images"
              }
              ,
              {
                name: "3.3.2 Mẫu hiển thị ảnh và tương tác mạng xã hội",
                click: true,
                next: DynamicCardSocialPage,
                icon: "logo-facebook"
              }
              ,
              {
                name: "3.3.3 Mẫu vẽ tay lên màn hình trên nền di động",
                click: true,
                next: SignaturePage,
                icon: "create"
              }
            ]
            }        
          ]
        }
        ,
        {
          name: "4. Bản đồ dẫn đường",
          size: "1.3em",
          click: true,
          next: GoogleMapPage,
          icon: "globe"
        }
        ,
        {
          name: "5. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
    }else{
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
  
          icon: "home"
        }
        ,
        {
          name: "2. Home & Tabs speedtest",
          size: "1.3em",
          click: true,
          next: HomeSpeedtestPage,
          icon: "speedometer"
        }
        ,
        {
          name: "3. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
    }

  }


  callbackTree = function(item, idx, parent, isMore:boolean){
    if (item.visible){
      parent.forEach((el,i)=>{
        if (idx!==i) this.expandCollapseAll(el,false)
      })
    }

    if (isMore){
      //console.log(item);
      if (item.next) {
        this.navCtrl.push(item.next);
        this.menuCtrl.close();
      }
    }

  }.bind(this)


  onClickUser(){
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }


  onClickUserImage(){
    this.openModal(OwnerImagesPage);
  }

  onClickLogin(){
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }

  onClickHeader(btn){
    if (btn.next==="EXPAND")this.treeMenu.forEach(el=>this.expandCollapseAll(el,true))
    if (btn.next==="COLLAPSE")this.treeMenu.forEach(el=>this.expandCollapseAll(el,false))
  }

  expandCollapseAll(el,isExpand:boolean){
    if (el.subs){
      el.visible=isExpand;
      el.subs.forEach(el1=>{
        this.expandCollapseAll(el1,isExpand)
      })
    }
  }

  openModal(form,data?:any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }
}

