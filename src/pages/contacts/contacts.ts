import { Component } from '@angular/core';
import { LoadingController, ToastController, Platform, ItemSliding } from 'ionic-angular';

import { Contacts, Contact } from '@ionic-native/contacts';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';

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
                          , {color:"primary", icon:"cog", next:"SETTINGS"}        //Thiet lap thong so
                          ]
                        }

  options = [
    {color:"secondary",icon:"edit",name:"Sửa",next:"EDIT"}
    ,{color:"danger",icon:"trash",name:"Xóa",next:"DELETE"}
  ];

  phoneContacts: any = [];
  /** of fullname:
   * [
   * {
   *  fullname:
   * , nickname:
   * , image:
   * , phones: [{value:, type:}] 
   * , emails: [{value:, type:}]
   * , relationship: [friend, closefriend, schoolmate, family, co-worker, partner, work, neigbor]
   * }
   * ]
   */
  
   uniquePhones: any = {};
  /** of username: -- chuyen doi thanh +8490...
   * {"+84903500888": 
   * {
   *  fullname:
   * , nickname:
   * , image:
   * , relationship: [friend, closefriend, schoolmate, family, co-worker, partner, work, neigbor]
   * }
   */

  uniqueEmails: any = {};
  /** of email:
   * {"cuong.dq@mobifone.vn": 
   * {
   *  fullname:
   * , nickname:
   * , image:
   * , relationship: [friend, closefriend, schoolmate, family, co-worker, partner, work, neigbor]
   * }
   */

  phoneContactsOrigin: any = [];
  isSearch: boolean = false;
  searchString: string = '';

  prefix_change:any;
  

  constructor(
    private apiAuth: ApiAuthService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private contacts: Contacts) { }


  ngOnInit(){
    //doc tu bo nho ra danh ba cua ung dung
    //let ke danh ba 
    this.refresh();
  }

  //chuyen doi phone duy nhat
  //neu so dau tien la + thi giu nguyen
  //neu so dau tien la 00 thi thay bang +
  //neu so dau tien la 0 thi thay bang +84 (ma quoc gia nuoc user)
  //doi so: +84121-->+8471...

  vnChangePrefix(phoneReturn, nation_callingcode, prefix){
    if (prefix){
      let found = prefix.find(x=>("+" + nation_callingcode + x.old_code)===phoneReturn.substring(0,("+" + nation_callingcode + x.old_code).length))
      if (found){
        phoneReturn = "+" + nation_callingcode + found.new_code + phoneReturn.substring(("+" + nation_callingcode + found.old_code).length)
      }
    }
    return phoneReturn;
  }

  internationalFormat(phone, nation_callingcode){
    let phoneReturn = phone;

    if (phone.indexOf('+')===0){
      phoneReturn = phone;
    }

    if (phone.indexOf('00')===0){
      phoneReturn = '+'+phone.substring(2);
    }

    if (phone.indexOf('0')===0){
      phoneReturn =  '+' + nation_callingcode + phone.substring(1);
    }

    return phoneReturn;
  }

  async refresh(){

    let loading = this.loadingCtrl.create({
      content: 'Đợi đồng bộ danh bạ...'
    });
    loading.present();
    try{
      this.prefix_change = await this.apiAuth.getDynamicUrl("https://c3.mobifone.vn/api/ext-public/vn-prefix-change");
    }catch(e){}

    //console.log(prefix_change);

    this.apiAuth.getDynamicUrl(ApiStorageService.authenticationServer+"/get-your-contacts?user=702418821",true)
    .then(res=>{
      
      if (res.status===1&&res.result&&res.result.length>0){
          this.phoneContacts = this.processContacts(res.result);
      }
      
        loading.dismiss();
    })
    .catch(err=>{
      loading.dismiss();
    })
  }

  closeSwipeOptions(slidingItem: ItemSliding){
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
  }

  onClickDetails(slidingItem: ItemSliding, btn: any, contact: any){
    this.closeSwipeOptions(slidingItem);
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

    if (btn.next==="SETTING"){
      //Thiet lap thong so

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


  processContacts(data){

      data = JSON.parse(
        JSON.stringify(data
                , function (key, value) {return (value === undefined||value === null || value==="") ? undefined : value}
                )
      );
    
      let _phoneContacts = [];

      data.forEach(contact => {

        let nickname = contact._objectInstance&&contact._objectInstance.name&&contact._objectInstance.name.formatted?contact._objectInstance.name.formatted:contact._objectInstance.name.givenName;
        let fullname = contact._objectInstance.displayName?contact._objectInstance.displayName:nickname;
        let phones = [];
        let emails = [];
        let relationship = []; 
        //tu nguoi dung dinh nghia bang cach chon
        //: ['friend', 'closefriend', 'schoolmate', 'family', 'co-worker', 'partner', 'work', 'neigbor', 'doctor', 'teacher', 'vip', 'blacklist']
        
        if (contact._objectInstance.phoneNumbers){
          contact._objectInstance.phoneNumbers.forEach(phone=>{
            let phonenumber = phone.value.replace(/[^0-9+]+/g, "");

            if (phonenumber&&phonenumber!==""){
              
              phonenumber = this.internationalFormat(phonenumber,'84');
                  //dua vao uniquePhones
              phonenumber = this.vnChangePrefix(phonenumber,'84',this.prefix_change);
              
              if (!this.uniquePhones[phonenumber]){
                Object.defineProperty(this.uniquePhones, phonenumber, {value: {fullname: fullname 
                                                                              , nickname: nickname
                                                                              , relationship: relationship}, writable: false, enumerable: true, configurable: false});
                
                if (fullname){
                  this.uniquePhones[phonenumber].name = {};
                  Object.defineProperty(this.uniquePhones[phonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                }

                phones.push({value: phonenumber, type: phone.type, count: 1})
              }else{
                
                if (fullname){
                  if (this.uniquePhones[phonenumber].name[fullname]){
                    this.uniquePhones[phonenumber].name[fullname] += 1;
                  }else{
                    Object.defineProperty(this.uniquePhones[phonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                  }
                }
                
              }

            }
          })
        }

        if (contact._objectInstance.emails){
          contact._objectInstance.emails.forEach(email=>{
            if (!this.uniqueEmails[email.value]){
              Object.defineProperty(this.uniqueEmails, email.value, {value: {fullname: fullname 
                                                                            , nickname: nickname
                                                                            , relationship: relationship}, writable: false, enumerable: true, configurable: false});
              emails.push({value: email.value, type: email.type});

              if (fullname){
                this.uniqueEmails[email.value].name = {};
                Object.defineProperty(this.uniqueEmails[email.value].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
              }

            } else {
              
              if (fullname){
                if (this.uniqueEmails[email.value].name[fullname]){
                  this.uniqueEmails[email.value].name[fullname] +=1; 
                }else{
                  Object.defineProperty(this.uniqueEmails[email.value].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                }
              }     

            }
          })
        }

        if (fullname && (phones.length>0 || emails.length>0)){
          _phoneContacts.push({
                                  fullname: fullname 
                                  , nickname: nickname
                                  , phones: phones
                                  , emails: emails
                                  , relationship: relationship
                                });
        } 
        
      });

    return _phoneContacts;

  }

  listContacts() {

    let loading = this.loadingCtrl.create({
      content: 'Đợi lọc dữ liệu từ danh bạ'
    });
    loading.present();
    
    this.contacts
    //.find(['displayName', 'name', 'phoneNumbers', 'emails', 'photos', 'urls', 'organizations', 'addresses', 'birthday', 'ims']
    .find(['phoneNumbers']
                        , { filter: "", multiple: true })
      .then(data => {
        this.phoneContactsOrigin = data;
        this.showToast(loading, 'Đã đọc xong danh bạ ' + data.length + ' số', 0, 1);
        
        //xoa cac field ko co gia tri
        
        this.phoneContacts = this.processContacts(data);

        //luu danh ba len may chu
        this.apiAuth.postDynamicForm(ApiStorageService.authenticationServer+"/save-your-contacts",this.phoneContacts,true)
        .then(res=>{
          
          this.toastCtrl.create({
            message: "res" + JSON.stringify(res),
            duration: 10000,
            position:'middle'
          }).present();

        })
        .catch(err_=>{
          
          this.toastCtrl.create({
            message: "res" + JSON.stringify(err_),
            duration: 30000,
            position:'bottom'
          }).present();

        })

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




