import { Component, } from '@angular/core';
import { ApiStorageService } from '../../services/apiStorageService';
import { ApiAuthService } from '../../services/apiAuthService';
import { LoadingController, ModalController, NavController, Events } from 'ionic-angular';
import { OwnerImagesPage } from '../owner-images/owner-images';
import { ApiContactService } from '../../services/apiContactService';
import { ApiChatService } from '../../services/apiChatService';

@Component({
  selector: 'page-home-menu',
  templateUrl: 'home-menu.html',
})
export class HomeMenuPage {

  dynamicTree: any = {
    title: "Home",
    items:[]
  };
  
  maxOnePage = 6;
  curPageIndex = 0;
  lastPageIndex = 0;
  maxPage = 10; //toi da cua trang de khong bi lag

  contacts = {}  // this.apiContact.getUniqueContacts()

  userInfo: any; // this.apiAuth.getUserInfo()
  token:any;     // this.apiStorage.getToken() hoac ApiStorageService.token

  isLoaded: boolean = true;

  chatRooms:any;
  chatFriends: any;
  chatNewFriends: any;

  constructor(
      private apiStorage: ApiStorageService
    , private apiAuth: ApiAuthService
    , private apiContact: ApiContactService
    , private apiChat: ApiChatService
    , private loadingCtrl: LoadingController
    , private navCtrl: NavController
    , private modalCtrl: ModalController
    , private events: Events
  ) { }

  ngOnInit() {
    
    this.refreshNews();

    this.events.subscribe('event-main-login-checked'
      , (data => {

        this.token = data.token;
        this.userInfo = data.user;

        this.contacts = this.apiContact.getUniqueContacts();

        //console.log('Contact for new',this.contacts);
        //them danh ba cua nguoi login vao
        if (this.userInfo){
          if (!this.contacts[this.userInfo.username]) {
            Object.defineProperty(this.contacts, this.userInfo.username, {
                value: {
                    fullname: this.userInfo.fullname,
                    nickname: this.userInfo.nickname,
                    image: this.userInfo.data&&this.userInfo.data.image?this.userInfo.data.image:undefined,
                    avatar: this.userInfo.data&&this.userInfo.data.avatar?this.userInfo.data.avatar:undefined,
                    relationship: [this.userInfo.relationship === 1 ? 'public' : 'friend']
                },
                writable: true, enumerable: true, configurable: false
            });
          } else {
              if (this.userInfo.data&&this.userInfo.data.image) this.contacts[this.userInfo.username].image = this.userInfo.data.image;
              if (this.userInfo.data&&this.userInfo.data.avatar) this.contacts[this.userInfo.username].avatar = this.userInfo.data.avatar;
          }
        }
        //doi 3 giay sau neu login tu dong bang token
        //thi moi lay thong tin cua user
        setTimeout(() => {
          this.getHomeNews(true);
        }, 3000);
      })
    )


    this.events.subscribe('event-chat-init-room'
      , (data => {
        this.chatRooms = data.rooms;
        this.chatFriends = data.friends;
        this.chatNewFriends = data.new_friends;

      })
    )
    
  }


  async refreshNews(){
    //lay publicUser truoc tien roi moi tiep tuc cac buoc khac
    let publicUsers = await this.apiContact.getPublicUsers(true);
    //neu co roi thi moi di checking login

    //thong tin tu public user
    this.token = this.apiStorage.getToken();
    this.userInfo = this.apiAuth.getUserInfo();
    this.contacts = this.apiContact.getUniqueContacts();

    this.getHomeNews(true);

    //this.dynamicTree.items.push(items);
    //doc tu bo nho len lay danh sach da load truoc day ghi ra 
    //this.dynamicTree = this.apiStorage.getHome();
    let chattingData = this.apiChat.getRoomsFriends();

    this.chatRooms = chattingData.rooms;
    this.chatFriends = chattingData.friends;
    this.chatNewFriends = chattingData.new_friends;


  }

  /** lay tin tuc moi nhat */
  getHomeNews(isRenew?:boolean) {
    if (isRenew) {
      this.lastPageIndex = this.curPageIndex>0?this.curPageIndex:this.lastPageIndex;
      this.curPageIndex = 0;
    }
    this.getJsonPostNews(this.userInfo?true:false)
      .then(items=>{
        if (isRenew) {
          let isHaveNew = false;
          items.reverse().forEach((el,idx)=>{
            let index = this.dynamicTree.items
                        .findIndex(x => x.group_id === el.group_id);
            //console.log(idx, el, index);
            if (index >= 0) {
              //this.dynamicTree.items.splice(index, 1, el);
            } else {
              this.dynamicTree.items.unshift(el);
              isHaveNew = true;           
            }
          })
          if (isHaveNew&&this.lastPageIndex>0) this.lastPageIndex--;
        }else{
          this.curPageIndex = this.curPageIndex<this.lastPageIndex?this.lastPageIndex:this.curPageIndex;
          items.forEach((el,idx)=>{
            let index = this.dynamicTree.items
                        .findIndex(x => x.group_id === el.group_id);
            if (index >= 0) {
              //this.dynamicTree.items.splice(index, 1, el);
            } else {
              this.dynamicTree.items.push(el);              
            }
          })
        }
        //Array.prototype.push.apply(this.dynamicTree.items,items);
      })
      .catch(err=>{})
      ;
  }

  /**
   * thuc hien post json gom:
   * token,
   * contacts list user 
   * result: 
   * server se kiem tra token 
   * neu co token se doc tin cua user + tin cua contacts moi nhat
   * neu khong co token hoac khong hop le
   * sever tra ket qua la tin public cua contact truyen len
   * 
   */
  getJsonPostNews(isToken?:boolean){
   
    let offset = this.curPageIndex * this.maxOnePage;
    let limit = offset + this.maxOnePage;

    let follows = [];
    for (let key in this.contacts){
      follows.push(key);
    }

    let json_data = {
      limit: limit,
      offset: offset,
      follows: follows
    }
    //console.log('json_data',json_data);

    return this.apiAuth.postDynamicForm(ApiStorageService.mediaServer 
                                      + "/db/public-groups", json_data)
        .then(data => {
          
          //console.log('public-groups',data);

          let items = [];
          data.forEach(el => {

            let medias = [];
            if (el.medias) {
              el.medias.forEach(e => {
                e.image = ApiStorageService.mediaServer + "/db/get-file/" + encodeURI(e.url);
                medias.push(e);
              })
            }

            el.medias = medias;
            el.actions = {
              like: { name: "LIKE", color: "primary", icon: "thumbs-up", next: "LIKE" }
              , comment: { name: "COMMENT", color: "primary", icon: "chatbubbles", next: "COMMENT" }
              , share: { name: "SHARE", color: "primary", icon: "share-alt", next: "SHARE" }
            }

            items.push(el);

          });

          if (items.length>0) this.curPageIndex++; 
          //da doc duoc trang 1
           return items;
          
        })
        .catch(err => {return []})
  }


  getPrivateNews(){

    if (this.userInfo) {

      let loading = this.loadingCtrl.create({
        content: 'Đợi lấy dữ liệu cá nhân...'
      });
      loading.present();
      //chuyen thu tuc lay thong tin sang keo len, keo xuong
      this.apiAuth.getDynamicUrl(ApiStorageService.mediaServer + "/db/list-groups?limit=6&offset=0", true)
        .then(data => {

          let items = [];
          data.forEach(el => {

            let medias = [];
            if (el.medias) {
              el.medias.forEach(e => {
                e.image = ApiStorageService.mediaServer + "/db/get-file/" + encodeURI(e.url);
                medias.push(e);
              })
            }

            el.medias = medias;
            el.actions = {
              like: { name: "LIKE", color: "primary", icon: "thumbs-up", next: "LIKE" }
              , comment: { name: "COMMENT", color: "primary", icon: "chatbubbles", next: "COMMENT" }
              , share: { name: "SHARE", color: "primary", icon: "share-alt", next: "SHARE" }
            }

            items.push(el);

          });

          // this.dynamicTree.items = items;
          // this.apiStorage.saveHome(this.dynamicTree);

          loading.dismiss();
        })
        .catch(err => {
          loading.dismiss();
        })
    } 
  }

  // Xử lý sự kiện click button theo id
  onClickAdd() {
    this.openModal(OwnerImagesPage,{parent: this});
  }

  onClickChatRoom() {
    /* this.navCtrl.push(HomeChatPage, {
      token: this.token,
      user: this.userInfo,
      socket: this.socket,
      users: this.users,
      rooms: this.rooms
    }); */
  }

  //thuc hien ket ban
  onClickChatFriend(){
    
  }

  doInfinite(infiniteScroll,direction) {
    if (direction==='UP'){
      console.log('UP', this.curPageIndex);
      if (!this.isLoaded){
        this.getHomeNews(true);
      }
      setTimeout(() => {
        this.isLoaded = true;
        infiniteScroll.complete();
      }, 1000);
    }else{
      console.log('DOWN', this.curPageIndex);
      this.getHomeNews(false);
      this.isLoaded = false; //khi keo xuong duoi thi o tren moi cho phep
      setTimeout(() => {
        infiniteScroll.complete();
      }, 1000);
    }

  }

  onClickMedia(idx, item) {
    console.log(idx, item);
  }

  onClickHeader(btn) {
    console.log(btn);
  }

  onClickShortDetails(item) {
    console.log(item);
  }

  onClickActions(btn, item) {
    console.log(btn, item);
  }


  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

}
