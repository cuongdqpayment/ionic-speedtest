import { Component, } from '@angular/core';
import { ApiMediaService } from '../../services/apiMediaService';
import { ApiStorageService } from '../../services/apiStorageService';
import { ApiAuthService } from '../../services/apiAuthService';
import { LoadingController, ModalController } from 'ionic-angular';
import { OwnerImagesPage } from '../owner-images/owner-images';

@Component({
  selector: 'page-home-menu',
  templateUrl: 'home-menu.html',
})
export class HomeMenuPage {

  dynamicTree: any;

  userInfo: any;

  constructor(
    private apiMedia: ApiMediaService
    , private apiStorageService: ApiStorageService
    , private auth: ApiAuthService
    , private loadingCtrl: LoadingController
    , private modalCtrl: ModalController
  ) { }

  ngOnInit() {

    //doc tu bo nho len lay danh sach da load truoc day ghi ra 
    this.dynamicTree = this.apiStorageService.getHome();

    let loading = this.loadingCtrl.create({
      content: 'Đợi load form...'
    });
    loading.present();
    setTimeout(() => {
      this.checkTokenLogin();
      loading.dismiss();
    }, 3000);
}

  checkTokenLogin() {

    if (this.apiStorageService.getToken()) {

      let loading = this.loadingCtrl.create({
        content: 'Đợi kiểm tra xác thực và load dữ liệu...'
      });
      loading.present();

      this.apiMedia.authorizeFromResource
        (this.apiStorageService.getToken())
        .then(login => {
          if (login.status
            && login.user_info
            && login.token
          ) {

            this.userInfo = login.user_info;

            this.auth.getDynamicUrl(ApiStorageService.mediaServer + "/db/list-groups?limit=12&offset=0", true)
              .then(data => {

                loading.dismiss();

                //console.log('list-groups token:', data);

                let items = [];
                data.forEach(el => {

                  let medias = [];
                  if (el.medias){
                    el.medias.forEach(e=>{
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
                
                this.apiStorageService.saveHome(this.dynamicTree);

              })
              .catch(err => {
                loading.dismiss();
                console.log(err);
              })

          }
        })
        .catch(err => { loading.dismiss() });
    } else {
      this.userInfo = undefined;
      this.getPublicNews();
      //truong hop khong co mang thi thoi
    }

  }

  getPublicNews() {

    let loading = this.loadingCtrl.create({
      content: 'Đợi kiểm tra xác thực và load dữ liệu...'
    });
    loading.present();

    this.auth.getDynamicUrl(ApiStorageService.mediaServer + "/db/public-groups?limit=12&offset=0", true)
      .then(data => {
        loading.dismiss();

        let items = [];
        data.forEach(el => {

          let medias = [];
          if (el.medias){
            el.medias.forEach(e=>{
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
        
        console.log(err);
      })
  }


  // Xử lý sự kiện click button theo id
  onClickAdd() {
    this.openModal(OwnerImagesPage);
  }

  onClickMedia(idx, item) {
    console.log(idx, item);
  }

  onClickHeader(btn) {
    console.log(btn);
  }

  onClickShortDetails(btn, item) {
    console.log(btn, item);
  }

  onClickActions(btn, item) {
    console.log(btn, item);
  }


  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

}
