import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DynamicMenuPage } from '../pages/dynamic-menu/dynamic-menu';
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
import { SpeedTestPage } from '../pages/speed-test/speed-test';
import { TabsPage } from '../pages/tabs/tabs';
import { SignaturePage } from '../pages/signature/signature';
import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage:any = DynamicMenuPage;
  
  treeMenu:any;
  callbackTreeMenu:any;

  constructor(
    private menuCtrl: MenuController,
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

    this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,

          icon: "home"
        },
        {
          name: "2. Các mẫu reponsive",
          size: "1.5em",
          subs: [
            {
              name: "2.1 Các nhập liệu",
              size: "1.3em",
              subs: [
              {
                name: "2.1.1 Mẫu nhập liệu toàn màn hình dành cho di động",
                click: true,
                next: DynamicFormMobilePage,
                icon: "phone-portrait"
              }
              ,
              {
                name: "2.1.2 Nhập liệu và hiển thị cho desktop & di động",
                click: true,
                next: DynamicFormWebPage,
                icon: "desktop"
              }
              ,
              {
                name: "2.1.3 Mẫu nhập chọn & kéo",
                click: true,
                next: DynamicRangePage,
                icon: "radio-button-on"
              }
            ]
            }
            ,
            {
              name: "2.2 Các mẫu hiển thị danh sách",
              size: "1.3em",
              subs: [
              {
                name: "2.2.1 Mẫu danh sách quẹt nút click",
                click: true,
                next: DynamicListPage,
                icon: "paper"
              }
              ,
              {
                name: "2.2.2 Mẫu danh sách bảng, liệt kê & sắp xếp lại",
                click: true,
                next: DynamicListOrderPage,
                icon: "reorder"
              }
              ,
              {
                name: "2.2.3 Mẫu danh sách theo cây FamilyTree",
                click: true,
                next: DynamicTreePage,
                icon: "menu"
              }
            ]
            }
            ,
            {
              name: "2.3 Các mẫu xử lý hình ảnh và file",
              size: "1.3em",
              subs: [
              {
                name: "2.3.1 Mẫu upload ảnh theo facebook",
                click: true,
                next: DynamicMediasPage,
                icon: "images"
              }
              ,
              {
                name: "2.3.2 Mẫu hiển thị ảnh và tương tác mạng xã hội",
                click: true,
                next: DynamicCardSocialPage,
                icon: "logo-facebook"
              }
              ,
              {
                name: "2.3.3 Mẫu vẽ tay lên màn hình trên nền di động",
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
          name: "3. Kiểm tra tốc độ speedtest",
          size: "1.3em",
          click: true,
          next: SpeedTestPage,
          icon: "speedometer"
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
        ,
        {
          name: "6. Tabs Hiển thị động",
          size: "1.3em",
          click: true,
          next: TabsPage,
          icon: "logo-buffer"
        }
        ,
        {
          name: "7. Khởi tạo sqlite trên thiết bị di động",
          size: "1.3em",
          click: true,
          next: HomePage,
          icon: "cloud"
        }
      ]
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
}

