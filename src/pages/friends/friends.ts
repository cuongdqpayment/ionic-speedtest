import { Component } from '@angular/core';
import { LoadingController, ToastController, ItemSliding, AlertController, ModalController, ViewController, NavParams, NavController } from 'ionic-angular';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';


@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html'
})
export class FriendsPage {

  countView = 1;

  //du lieu khoi tao ban dau
  userInfo: any;
  parent:any;
  callback:any;
  contacts:any = {};

  friends:any = [];
  newFriends:any = [];
  publicFriends: any = [];
  morePublic:number= this.countView;

  //cac tuy chon
  dynamicFriends: any = {};
  options: any = [];
  friendViews:any;

  isSearch: boolean = false;
  searchString: string = '';



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

    this.options = [
      { color: "secondary", icon: "contact", name: "Kết bạn", next: "ADD-FRIEND" }
      , { color: "danger", icon: "trash", name: "Xóa", next: "REMOVE" }
    ]

    this.userInfo = this.navParams.get("user");
    this.callback = this.navParams.get("callback");
    this.parent = this.navParams.get("parent");
    this.contacts = this.navParams.get("contacts");
    this.friends = this.navParams.get("friends");
    this.newFriends = this.navParams.get("new_friends");

    console.log(this.userInfo, this.contacts, this.friends, this.newFriends);
    this.prepairViewFriend();

  }


  checkExistsFriends(username){
    if (this.userInfo&&this.userInfo.username===username) return true;
    if (this.friends&&this.friends.findIndex(x => x.username === username)>=0) return true;
    if (this.newFriends&&this.newFriends.findIndex(x => x.username === username)>=0) return true;
    return false;
  }

  prepairViewFriend(){
    //bạn có thể tìm một số điện thoại để yêu cầu kết bạn (user đó đang ở chế độ ẩn danh)
    //danh sách bạn có thể biết (do user public contacts lấy ra - hiển thị avatar, tên và nickname, địa chỉ)
    if (this.contacts){
      for (let key in this.contacts){
        //loai bo userInfo, friends, va newFriends
        if (!this.checkExistsFriends(key)){
          this.publicFriends.push({
            username: key,
            fullname: this.contacts[key].fullname,
            nickname: this.contacts[key].nickname,
            phone: this.contacts[key].phone,
            address: this.contacts[key].address,
            avatar: this.contacts[key].avatar,
            image: this.contacts[key].image,
            relationship: this.contacts[key].relationship
          })
        }
      }
    }
    //danh sách bạn bè trong danh bạ của bạn (hiển thị 5 bạn đầu tiên - yêu cầu kết bạn)

    //danh sách bạn bè của bạn (hiển thị 5 bạn đầu tiên - yêu cầu hủy kết bạn)

  }


  onClickMore(type){
    if (type==='PUBLIC'&&this.morePublic<this.publicFriends.length) this.morePublic +=this.countView;    
    if (type==='PUBLIC-CLOSE') this.morePublic =this.countView; 

  }


  closeSwipeOptions(slidingItem: ItemSliding) {
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
  }

  onClickDetails(slidingItem: ItemSliding, btn: any, idx: any, contact:any) {
    this.closeSwipeOptions(slidingItem);

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




