import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';

import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts';

import { MyApp } from '../../app/app.component';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {

  phoneContacts: any = [];
  phoneContactsOrigin: any = [];
  isSearch: boolean = false;
  searchString: string = '';

  constructor(public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private contacts: Contacts) { }


  ngOnInit(){
    //lay danh ba tong hop
    this.listContacts();
  }

  createContact() {

    let loading = this.loadingCtrl.create({
      content: 'Đợi lưu vào danh bạ'
    });
    loading.present();

    let contact: Contact = this.contacts.create();

    /* if (!MyApp.isWeb) { //chi su dung cho device moi them duoc

      contact.name = new ContactName(null, 'Doan', 'Quoc Cuong');

      console.log('Contact name:', contact);

      contact.phoneNumbers = [new ContactField('mobile', '0903500888')];
      contact.save().then(
        () => {
          console.log('Contact saved!', contact);
          Log.put('Contact saved!', contact);
          this.showToast(loading, 'Danh bạ đã được lưu trữ thành công!', 0, 1);
        },
        (error: any) => {
          console.error('Error saving contact.', error);
          Log.put('Error saving contact.', error);
          this.showToast(loading, 'Lỗi lưu trữ danh bạ!');
        }
      );
    } else {
      this.showToast(loading, 'Lỗi không được phép tạo danh bạ');
    } */


  }

  /** Goi menu he thong de mo danh ba ra
   * ket qua sau khi chon mot danh ba nao do thi se in ra
   */
  pickContacts() {
    let loading = this.loadingCtrl.create({
      content: 'Đợi load danh bạ từ máy để bạn chọn...'
    });
    loading.present();

    this.contacts.pickContact()
      .then((oneContact: Contact) => {

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
    // console.log('this.contacts: ',this.contacts);
    // Log.put('this.contacts: ',this.contacts);      
    //Lay toan bo danh ba trong may
    this.contacts.find(['displayName', 'name', 'phoneNumbers', 'emails', 'photos', 'urls', 'organizations', 'addresses', 'birthday', 'ims'], { filter: "", multiple: true })
      .then(data => {
        //loading.dismiss();
        this.showToast(loading, 'Đã đọc xong danh bạ ' + data.length + ' số', 0, 1);

        this.phoneContactsOrigin = data;
        this.phoneContacts = this.phoneContactsOrigin;
        //console.log('this.contacts: ', data);
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
    //chi loc trong mang da doc du lieu ra 
    this.isSearch = true;
  }

  onInput(e) {

    this.phoneContacts = this.phoneContactsOrigin.filter(x=>(
      (x.displayName ? x.displayName : '').toLowerCase().indexOf(this.searchString.toLowerCase())>=0
      ||
      (x.name.formatted ? x.name.formatted : '').toLowerCase().indexOf(this.searchString.toLowerCase())>=0
      ||
      (x.name.familyName ? x.name.familyName : '').toLowerCase().indexOf(this.searchString.toLowerCase())>=0
      ||
      (x.name.givenName ? x.name.givenName : '').toLowerCase().indexOf(this.searchString.toLowerCase())>=0
      ||
      (x.phoneNumbers&&x.phoneNumbers.find(y=>y.value.indexOf(this.searchString)>=0))
      ))
  }

  sendContacts(){
    
  }

  searchEnter() {
    this.isSearch = false;
  }
}




