import { Component } from '@angular/core';
import { NavController, ModalController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';
import { DynamicListPage } from '../dynamic-list/dynamic-list';
import { ApiResourceService } from '../../services/apiResourceServices';
import { DynamicFormMobilePage } from '../dynamic-form-mobile/dynamic-form-mobile';
import { DynamicCardSocialPage } from '../dynamic-card-social/dynamic-card-social';
import { DynamicMediasPage } from '../dynamic-medias/dynamic-medias';
import { DynamicListOrderPage } from '../dynamic-list-order/dynamic-list-order';
import { HomePage } from '../home/home';
import { SignaturePage } from '../signature/signature';
import { LoginPage } from '../login/login';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  
  tabs: any = [
    {
      root: HomePage,
      title: 'Home',
      icon: 'home'
    },
    {
      root: LoginPage,
      title: 'Login',
      icon: 'log-in'
    },
    {
      root: DynamicFormWebPage,
      title: 'Form web',
      icon: 'desktop'
    },
    {
      root: DynamicFormMobilePage,
      title: 'Form mobile',
      icon: 'phone-portrait'
    },
    {
      root: DynamicMediasPage,
      title: 'Images',
      icon: 'images'
    },
    {
      root: DynamicCardSocialPage,
      title: 'Social',
      icon: 'share'
    },
    {
      root: DynamicListPage,
      title: 'List Options',
      icon: 'paper'
    },
    {
      root: DynamicListOrderPage,
      title: 'List Order',
      icon: 'reorder'
    },
    {
      root: SignaturePage,
      title: 'Signature',
      icon: 'create'
    }
  ];

  constructor(private navCtrl: NavController
            , private modalCtrl: ModalController
            , private platform: Platform
            , private alertCtrl: AlertController
            , private loadingCtrl: LoadingController
            , private resource: ApiResourceService
  ) {
    //console.log('1. constructor tabs')
  }
  
  ngOnInit(){
    //console.log('2. ngOnInit tabs')
  }

  ionViewDidLoad() {
    //console.log('3. ionViewDidLoad tabs')
  }

  ionViewWillEnter(){
    //console.log('4. ionViewWillEnter tabs')
  }

  callback(){

  }

  callWaiting(){

  }

  
  openModal(data) {

    return new Promise( (resolve, reject) => { 
      let formPopup:any;
     
      if (this.platform.is('core')){
        formPopup = DynamicFormWebPage;
      }else{
        formPopup = DynamicFormMobilePage;
      }

      let modal = this.modalCtrl.create(formPopup, data);
          modal.onDidDismiss(data=>{
            resolve(data);
          })
      modal.present();
    })
    
  }


  presentConfirm(jsonConfirm:{title:string,message:string,cancel_text:string,ok_text:string,ok:any}) {
    let alert = this.alertCtrl.create({
      title: jsonConfirm.title, //'Xác nhận phát hành',
      message: jsonConfirm.message, //'Bạn muốn ',
      buttons: [
        {
          text: jsonConfirm.cancel_text, //Bỏ qua
          role: 'cancel',
          handler: () => {
            if (jsonConfirm.ok) jsonConfirm.ok(false);
          }
        },
        {
          text: jsonConfirm.ok_text,//'Đồng ý',
          handler: () => {
            if (jsonConfirm.ok) jsonConfirm.ok(true);
          }
        }
      ]
    });
    alert.present();
  }

  presentAlert(jsonConfirm:{title:string,message:string,ok_text:string}) {
    let alert = this.alertCtrl.create({
      title: jsonConfirm.title, //'Xác nhận phát hành',
      message: jsonConfirm.message, //'Bạn muốn ',
      buttons: [
        {
          text: jsonConfirm.ok_text,//'Đồng ý',
          handler: () => {}
        }
      ]
    });
    alert.present();
  }

}
