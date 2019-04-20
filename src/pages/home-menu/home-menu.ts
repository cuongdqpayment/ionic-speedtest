import { Component, } from '@angular/core';
import { ApiStorageService } from '../../services/apiStorageService';
import { ApiAuthService } from '../../services/apiAuthService';
import { LoadingController, ModalController, NavController, Events } from 'ionic-angular';
import { OwnerImagesPage } from '../owner-images/owner-images';
import { ApiContactService } from '../../services/apiContactService';

@Component({
  selector: 'page-home-menu',
  templateUrl: 'home-menu.html',
})
export class HomeMenuPage {

  dynamicTree: any = {
    title: "Home"
  };
  
  contacts = {}

  userInfo: any;
  token:any;

  isLoaded: boolean = true;

  constructor(
      private apiStorage: ApiStorageService
    , private apiAuth: ApiAuthService
    , private apiContact: ApiContactService
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

        console.log('Contact for new',this.contacts);

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


        this.getHomeNews();
        
      })
    )
    
  }


  async refreshNews(){
    //lay publicUser truoc tien roi moi tiep tuc cac buoc khac
    let publicUsers = await this.apiContact.getPublicUsers();
    //neu co roi thi moi di checking login

    //thong tin tu public user
    this.contacts = this.apiContact.getUniqueContacts();

    //doc tu bo nho len lay danh sach da load truoc day ghi ra 
    this.dynamicTree = this.apiStorage.getHome();

  }

  getHomeNews() {
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

          this.dynamicTree.items = items;
          this.apiStorage.saveHome(this.dynamicTree);

          loading.dismiss();
        })
        .catch(err => {
          loading.dismiss();
        })
    } else {
      this.userInfo = undefined;
      this.getPublicNews();
    }
  }

  getPublicNews() {
    let loading = this.loadingCtrl.create({
      content: 'Đợi load dữ liệu chung...'
    });
    loading.present();

    this.apiAuth.getDynamicUrl(ApiStorageService.mediaServer + "/db/public-groups?limit=6&offset=0", false)
      .then(data => {
        loading.dismiss();

        let items = [];
        data.forEach(el => {

          let medias = [];
          if (el.medias) {
            el.medias.forEach(e => {
              e.image = ApiStorageService.mediaServer + "/db/get-file/" + encodeURI(e.url);
              e.note = el.time;
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

        this.dynamicTree.items = items;
      })
      .catch(err => {
        loading.dismiss();
      })
  }

  // Xử lý sự kiện click button theo id
  onClickAdd() {
    this.openModal(OwnerImagesPage,{parent: this});
  }

  onClickChat() {
    /* this.navCtrl.push(HomeChatPage, {
      token: this.token,
      user: this.userInfo,
      socket: this.socket,
      users: this.users,
      rooms: this.rooms
    }); */
  }


  doInfinite(infiniteScroll,direction) {
    if (direction==='UP'){
      console.log('UP');

      if (!this.isLoaded){
        this.getHomeNews()
      }
      setTimeout(() => {
        this.isLoaded = true;
        infiniteScroll.complete();
      }, 1000);
    }else{
      console.log('DOWN');

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
