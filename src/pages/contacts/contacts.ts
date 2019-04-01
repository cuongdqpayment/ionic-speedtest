import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';

import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {


  dynamicContacts:any ={
                        title: "Danh bạ"
                        , search_bar: {hint: "Tìm tên hoặc số"} 
                        , buttons: [
                            {color:"primary", icon:"person-add", next:"ADD"}    //doc danh ba, pickup 1 so addfriend
                            , {color:"primary", icon:"contacts", next:"FRIENDS" //doc danh ba chinh thuc
                                  , alerts:[
                                  "903500888"
                                  ]
                            }
                          , {color:"primary", icon:"sync", next:"SYNC"}          //doc danh ba tu may, day len may chu
                          ]
                        }

  phoneContacts: any = [];
  phoneContactsOrigin: any = [];
  isSearch: boolean = false;
  searchString: string = '';

  constructor(public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private contacts: Contacts) { }


  ngOnInit(){
    //doc tu bo nho ra danh ba cua ung dung
    //let ke danh ba 
  }


  onClickHeader(btn){
    if (btn.next==="ADD"){
      this.pickContacts();
    }
    if (btn.next==="SYNC"){
      this.listContacts();
    }
    if (btn.next==="FRIENDS"){
      //doc danh ba
    }

  }
  
  /** Goi menu he thong de mo danh ba ra
   * ket qua sau khi chon mot danh ba nao do thi se in ra
   */
  pickContacts() {
    let loading = this.loadingCtrl.create({
      content: 'Đợi load danh bạ từ máy để bạn chọn...'
    });
    loading.present();

    //Goi menu he thong
    this.contacts.pickContact()
      .then((oneContact: Contact) => {
        //ket qua chon duoc 1 danh ba trong danh sach

        this.showToast(loading, 'Bạn đã chọn được 1 danh bạ ' + (oneContact.displayName ? oneContact.displayName : oneContact.name.formatted ? oneContact.name.formatted : oneContact.name.familyName ? oneContact.name.familyName : 'Không biết tên'), 0, 1);

        console.log('id: ', oneContact.id, oneContact.rawId);
        console.log('Display name: ', oneContact.displayName ? oneContact.displayName : oneContact.name.formatted ? oneContact.name.formatted : oneContact.name.familyName ? oneContact.name.familyName : 'Không biết tên');

        if (oneContact.phoneNumbers) {
          oneContact.phoneNumbers.forEach((value, index) => {
            let obj;
            obj = value;
            //so dien thoai lien quan
            console.log('PhoneNumber : ', obj.id, obj.type, obj.value);
          })
        }
        if (oneContact.photos) {
          oneContact.photos.forEach((value, index) => {
            let obj;
            obj = value;
            //anh dai dien
            console.log('Photo: ', obj.id, obj.type, obj.value)
          });
        }

        if (oneContact.urls) {
          oneContact.urls.forEach((value, index) => {
            let obj;
            obj = value;
            //link nick google plus or facebook...
            console.log('Url: ', obj.id, obj.type, obj.value)
          });
        }

      })
      .catch(err => {
        this.showToast(loading, 'Lỗi đọc danh bạ: ' + JSON.stringify(err));
        //console.log('Khong chon danh ba nao ca');
      });
  }

  listContacts() {

    let loading = this.loadingCtrl.create({
      content: 'Đợi lọc dữ liệu từ danh bạ'
    });
    loading.present();
    
    this.contacts
    .find(['displayName', 'name', 'phoneNumbers', 'emails', 'photos', 'urls', 'organizations', 'addresses', 'birthday', 'ims']
                        , { filter: "", multiple: true })
      .then(data => {
        this.phoneContactsOrigin = data;
        this.phoneContacts = this.phoneContactsOrigin;
        this.showToast(loading, 'Đã đọc xong danh bạ ' + data.length + ' số', 0, 1);
      })
      .catch(err => {
        this.showToast(loading, 'Lỗi đọc danh bạ: ' + JSON.stringify(err));
      });
  }

  showToast(ld: any, msg: string, dur?: 0 | 1 | 2, pos?: 0 | 1 | 2) {
    if (ld) ld.dismiss();
    this.toastCtrl.create({
      message: msg,
      duration: dur == 0 ? 2000 : dur == 1 ? 3000 : 5000,
      position: pos == 0 ? 'top' : pos == 1 ? 'middle' : 'bottom'
    }).present();
  }

  goSearch() {
    this.isSearch = true;
  }

  onInput(e) {

  }

  searchEnter() {
    this.isSearch = false;
  }
}




