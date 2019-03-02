import { Component, } from '@angular/core';
import { Platform, NavParams, ViewController, NavController, LoadingController } from 'ionic-angular';
import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
import { ApiAuthService } from '../../services/apiAuthService';

@Component({
  selector: 'page-dynamic-menu',
  templateUrl: 'dynamic-menu.html',
})
export class DynamicMenuPage {

  dynamicTree: any ={
    title:"Trang chủ menu"
  };

  callback: any; // ham goi lai khai bao o trang root gui (neu co)
  step: any;     // buoc thuc hien xuat phat trang root goi (neu co)
  parent:any;    // Noi goi this

  constructor(private platform: Platform
    , private viewCtrl: ViewController
    , private navCtrl: NavController
    , private navParams: NavParams
  ) { }

  ngOnInit() {

    this.dynamicTree = this.navParams.get("tree") ? this.navParams.get("tree") : this.dynamicTree;

    this.callback = this.navParams.get("callback");
    this.step = this.navParams.get("step");
    this.parent = this.navParams.get("parent");

  }

  resetForm() {
    
  }


  // Xử lý sự kiện click button theo id
  onClick(btn) {
      this.next(btn);
  }

  next(btn) {
    //console.log(btn.next_data,this.navCtrl.length());
    if (btn) {
      if (btn.next == 'EXIT') {
        this.platform.exitApp();
      } else if (btn.next == 'RESET') {
        this.resetForm();
      } else if (btn.next == 'CLOSE') {
        if (this.parent) this.viewCtrl.dismiss(btn.next_data)
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
        //if (this.navCtrl.length() > 1) this.navCtrl.pop();      //goback 1 step
      } else if (btn.next == 'CALLBACK') {
        if (this.callback) {
          this.callback(btn.next_data,this.parent)
            .then(nextStep => this.next(nextStep));
        } else {
          if (this.parent) this.navCtrl.pop()
        }
      } else if (btn.next == 'NEXT' && btn.next_data && btn.next_data.data) {
        btn.next_data.callback = this.callback; //gan lai cac function object
        btn.next_data.parent = this.parent;     //gan lai cac function object
        btn.next_data.tree = btn.next_data.data; //gan du lieu tra ve tu server
        this.navCtrl.push(DynamicMenuPage, btn.next_data);
      }
    }

  }

}
