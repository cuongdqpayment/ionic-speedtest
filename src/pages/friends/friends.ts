import { Component } from '@angular/core';
import { LoadingController, ToastController, ItemSliding, AlertController, ModalController, ViewController, NavParams, NavController } from 'ionic-angular';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';


@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html'
})
export class FriendsPage {

  parent:any;
  callback:any;
  friends:any;
  newFriends:any;

  dynamicFriends: any = {};
  options: any = [];
  friendViews:any;

  maxOnePage = 6;
  curPageIndex = 0;
  lastPageIndex = 0;
  maxPage = 10; //toi da cua trang de khong bi lag


  isLoaded: boolean = false;
 

  isSearch: boolean = false;
  searchString: string = '';

  userInfo: any;


  constructor(
    private apiAuth: ApiAuthService,
    private apiStorage: ApiStorageService,
    private viewCtrl: ViewController,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private navCtrl: NavController
    ) { }


  ngOnInit() {

    this.dynamicFriends.title="DANH SÁCH BẠN BÈ"
    this.dynamicFriends.buttons = [{
      color:"danger", icon:"close", next:"CLOSE"
    }]

    this.callback = this.navParams.get("callback");
    this.parent = this.navParams.get("parent");
    this.friends = this.navParams.get("friends");
    this.newFriends = this.navParams.get("new_friends");

    console.log(this.friends,this.newFriends);

  }

  doInfinite(infiniteScroll,direction) {
    if (direction==='UP'){
      console.log('UP', this.curPageIndex);
      if (!this.isLoaded){
        //this.getHomeNews(true);
        //doc du lieu moi
      }
      setTimeout(() => {
        this.isLoaded = true;
        infiniteScroll.complete();
      }, 1000);
    }else{
      console.log('DOWN', this.curPageIndex);
      //this.getHomeNews(false);
      //doc du lieu cu
      this.isLoaded = false; //khi keo xuong duoi thi o tren moi cho phep
      setTimeout(() => {
        infiniteScroll.complete();
      }, 1000);
    }

  }

  onClickHeader(btn){
    this.next(btn);
  }

  next(btn) {

    if (btn) {
      if (btn.next == 'CLOSE') {
        if (this.parent) this.viewCtrl.dismiss(btn)
      } else if (btn.next == 'HOME') {
        if (this.parent) this.navCtrl.popToRoot()
      } else if (btn.next == 'BACK') {
        if (this.parent) this.navCtrl.pop()
      } else if (btn.next == 'CALLBACK') {
        if (this.callback) {
          this.callback(btn.next_data)
            .then(nextStep => this.next(nextStep));
        } else {
          if (this.parent) this.navCtrl.pop()
        }
      } 
    }
  }

}




