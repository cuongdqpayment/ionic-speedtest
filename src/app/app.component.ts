import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { DynamicRangePage } from '../pages/dynamic-range/dynamic-range';
import { DynamicMenuPage } from '../pages/dynamic-menu/dynamic-menu';
import { DynamicTreePage } from '../pages/dynamic-tree/dynamic-tree';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = DynamicMenuPage;
  
  treeMenu:any;
  callbackTreeMenu:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {

    this.callbackTreeMenu = this.callbackTree;

    this.treeMenu = [
        {
          name: "1. Xem menu",
          size: "1.3em",
          subs: [
            {
              name: "1.1 Chi 1 của nhánh 1",
              subs: [{
                name: "1.1.1 Nhóm 1 của chi 1 nhánh 1",
                click: true, //khai ở lá cây, click trên item, gọi hàm như click more
              }]
            },
            {
              name: "1.2 chi 2 của nhánh 1",
              click: true, //khai ở lá cây, click trên item, gọi hàm như click more
            }
          ]
        }
        ,
        {
          name: "2. Nhánh 2",
          size: "1.3em",
          subs: [
            {
              name: "2.1 Chi 1 của nhánh 2",
              subs: [{
                name: "2.1.1 Nhóm 1 chi 1 nhánh 2",
                click: true, //khai ở lá cây, click trên item, gọi hàm như click more
                icon: "leaf"
              }]
            },
            {
              name: "2.2 Chi 2 Sáng nay (2/3), sau khi vào lăng viếng Chủ tịch Hồ Chí Minh, Chủ tịch Triều Tiên Kim Jong-un kết thúc chuyến thăm hữu nghị chính thức Việt Nam. Trên đường di chuyển rời Hà Nội, ông Kim Jong-un đã hạ kính xe vẫy tay chào người dân. Ông Kim tới ga Đồng Đăng (Lạng Sơn) để trở về nước bằng tàu hỏa. ",
              click: true, //khai ở lá cây, click trên item, gọi hàm như click more
              icon: "plane"
            }
            ,
            {
              name: "2.3 Chi 3 của nhánh 2",
              subs: [{
                name: "2.3.1 Nhóm 1 chi 3 nhánh 2",
                click: true, //khai ở lá cây, click trên item, gọi hàm như click more
                icon: "leaf"
              }]
            },
            {
              name: "2.4 Chi 4 của nhánh 2",
              subs: [{
                name: "2.4.1 Nhóm 4 chi 1 nhánh 2",
                click: true, //khai ở lá cây, click trên item, gọi hàm như click more
                icon: "leaf"
              }]
            }
          ]
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
      console.log(item);
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

