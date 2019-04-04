import { Component } from '@angular/core';
import { LoadingController, ToastController, ItemSliding, AlertController } from 'ionic-angular';

import { Contacts, Contact } from '@ionic-native/contacts';
import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {


  dynamicContacts:any ={};
  options: any = [];

  isLoaded:boolean = true;

  count_delete: any = 0;

  //tham so chi cho phep hien thi 20 bang ghi thoi
  contactViews: any = [];
  maxCountContact:number = 0;
  countView: number = 10;
  currentPage: number = 1;
  currentMax: number = 0;
  maxPage: number = 0;


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

  //phoneContactsOrigin: any = [];

  isSearch: boolean = false;
  searchString: string = '';

  prefix_change:any;

  userInfo:any;
  

  constructor(
    private apiAuth: ApiAuthService,
    private apiStorage: ApiStorageService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private contacts: Contacts) { }


  ngOnInit(){

    this.userInfo = this.apiAuth.getUserInfo();

    if (this.userInfo){
      this.refresh();
    }else{
      this.presentAlert("Please login first!");
    }

  }


  setViewConctactsPage(next:1|-1){
    let start = this.currentMax;
    let length = this.currentPage * this.countView;

    if (next===1){
      this.currentMax = length;
      this.currentPage++;
    }else{
      this.currentMax = start;
      this.currentPage--;
    }

    this.contactViews = this.phoneContacts.slice(start,length);
  }

  
  async refresh(){

    let loading = this.loadingCtrl.create({
      content: 'Đang đọc danh bạ đã xử lý...'
    });
    loading.present();

    this.dynamicContacts = {
      title: "Danh bạ"
      , search_bar: {hint: "Tìm tên hoặc số"} 
      , buttons: [
          {color:"primary", icon:"person-add", next:"ADD"}    //doc danh ba, pickup 1 so addfriend
          /* , {color:"primary", icon:"contacts", next:"FRIENDS" //doc danh ba chinh thuc
                , alerts:[
                "903500888"
                ]
          } */
          , {color:"primary", icon:"sync", next:"SYNC", alerts:[]}          //doc danh ba tu may, day len may chu
        //, {color:"primary", icon:"cog", next:"SETTINGS"}        //Thiet lap thong so
        ]
      }

    this. options = [
                  {color:"secondary",icon:"edit",name:"Sửa",next:"EDIT"}
                  ,{color:"danger",icon:"trash",name:"Xóa",next:"DELETE"}
                  ];

    try{
      this.prefix_change = await this.apiAuth.getDynamicUrl(ApiStorageService.authenticationServer+"/ext-public/vn-prefix-change");
    }catch(e){}

    //doc tu dia len, neu co thi liet ke ra luon
    let phoneContacts = this.apiStorage.getPhoneContacts(this.userInfo);
    if (phoneContacts){
      this.phoneContacts = this.processServerContacts(phoneContacts);
    }else{

      try{
        //truong hop chua co thi doc tu may chu
        phoneContacts = await this.listContactsFromServer();

        if (phoneContacts){
          this.phoneContacts = this.processServerContacts(phoneContacts);
        }else{
          this.listContacts();  
        }

      }catch(e){
        //doc tu may len
        //neu khong co tu may chu thi doc tu dien thoai ra
        this.listContacts();
      }
    }

    //hien thi chi 20 bang ghi thoi
    this.setViewConctactsPage(1);

    loading.dismiss();

  }

  closeSwipeOptions(slidingItem: ItemSliding){
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
  }

  onClickDetails(slidingItem: ItemSliding, btn: any, idx: any){
    this.closeSwipeOptions(slidingItem);
    if (btn.next==="DELETE"){

      let remove = this.phoneContacts.splice(idx,1);
      let btnHeader = this.dynamicContacts.buttons.find(x=>x.next==="SYNC");
      if (btnHeader&&btnHeader.alerts) btnHeader.alerts.push(remove);

    }

  }

  async onClickHeader(btn){
    if (btn.next==="ADD"){
      this.pickContacts();

    }

    if (btn.next==="SYNC"){
      let loading = this.loadingCtrl.create({
        content: 'Đồng bộ danh bạ đã tinh chỉnh...'
      });
      loading.present();

      //luu danh ba xuong dia
      //luu nguoc tro lai may chu
      if (this.phoneContacts.length>0&&this.userInfo){
        try{

          await this.apiStorage.savePhoneContacts(this.userInfo, this.phoneContacts);

          await this.saveContacts2Server(this.phoneContacts);
          //neu danh ba doc duoc tu may thi hoi yeu cau ghi de len danh ba cu???

          let btnHeader = this.dynamicContacts.buttons.find(x=>x.next==="SYNC");
          if (btnHeader&&btnHeader.alerts) btnHeader.alerts=[]; //reset ve 0

        }catch(e){}
      }
      
      loading.dismiss();
      //hoi xem co dong bo lai danh ba vao may khong?
      //neu co thi luu lai danh ba (xoa het danh ba va luu lai danh ba moi)

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


//chuyen doi phone duy nhat
  //neu so dau tien la + thi giu nguyen
  //neu so dau tien la 00 thi thay bang +
  //neu so dau tien la 0 thi thay bang +84 (ma quoc gia nuoc user)
  //doi so: +84121-->+8471...

  vnChangePrefix(phoneReturn, nation_callingcode, prefix){

    //if (phoneReturn.indexOf('051135015977')>=0) console.log(phoneReturn);

    if (prefix){
      let found = prefix.find(x=>("+" + nation_callingcode + x.old_code)===phoneReturn.substring(0,("+" + nation_callingcode + x.old_code).length))
      if (found){
        phoneReturn = "+" + nation_callingcode + found.new_code + phoneReturn.substring(("+" + nation_callingcode + found.old_code).length)
      }else{

        found = prefix.find(x=>("0" + x.old_code)===phoneReturn.substring(0,("0" + x.old_code).length))
        
        //if (phoneReturn.indexOf('0511')===0) console.log('found',found);

        if (found){
          phoneReturn = "0" + found.new_code + phoneReturn.substring(("0" + found.old_code).length)
        }
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
    }else if (phone.indexOf('0')===0){
      phoneReturn =  '+' + nation_callingcode + phone.substring(1);
    }

    return phoneReturn;
  }


  processContacts(data){
      
      let _phoneContacts = [];

      data.forEach(contact => {
        
        //console.log(contact);

        let nickname = contact._objectInstance&&contact._objectInstance.name&&contact._objectInstance.name.formatted?contact._objectInstance.name.formatted:contact._objectInstance.name.givenName;
        let fullname = contact._objectInstance.displayName?contact._objectInstance.displayName:nickname;
        let phones = [];
        let emails = [];
        let relationship = []; 
        //tu nguoi dung dinh nghia bang cach chon
        //: ['friend', 'closefriend', 'schoolmate', 'family', 'co-worker', 'partner', 'work', 'neigbor', 'doctor', 'teacher', 'vip', 'blacklist']
        
        //console.log(fullname);


        if (contact._objectInstance.phoneNumbers){
          contact._objectInstance.phoneNumbers.forEach(phone=>{
            
            let phonenumber = phone.value.replace(/[^0-9+]+/g, "");

            if (phonenumber&&phonenumber!==""){
              
              let intPhonenumber = this.internationalFormat(phonenumber,'84');
                 
              phonenumber = this.vnChangePrefix(phonenumber,'84',this.prefix_change);

              
              if (!this.uniquePhones[intPhonenumber]){
                Object.defineProperty(this.uniquePhones, intPhonenumber, {value: {fullname: fullname 
                                                                                  , nickname: nickname
                                                                                  , relationship: relationship}, writable: false, enumerable: true, configurable: false});
                   
                                                                                  
                phones.push({value: phonenumber, type: phone.type, int: intPhonenumber})
                
                this.uniquePhones[intPhonenumber].name = {};
                if (fullname){
                  Object.defineProperty(this.uniquePhones[intPhonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                }
              }else{
                
                if (fullname){
                  if (this.uniquePhones[intPhonenumber].name[fullname]){
                    this.uniquePhones[intPhonenumber].name[fullname] += 1;
                  }else{
                    Object.defineProperty(this.uniquePhones[intPhonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                  }
                }
                
              }

            }
          })
        }

        
        //console.log(fullname);

        if (contact._objectInstance.emails){

          
          contact._objectInstance.emails.forEach(email=>{
            
            //console.log(this.uniqueEmails[email.value]); 

            if (!this.uniqueEmails[email.value]){
              
              Object.defineProperty(this.uniqueEmails, email.value, {value: {fullname: fullname 
                                                                            , nickname: nickname
                                                                            , relationship: relationship}, writable: false, enumerable: true, configurable: false});
              emails.push({value: email.value, type: email.type});
              this.uniqueEmails[email.value].name = {};
              
              if (fullname){
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

          
          //let countPhone = 0;
          for (let phone in this.uniquePhones){
            //countPhone++;
            let countInContact = 0;
            for (let name in this.uniquePhones[phone].name){
              countInContact += this.uniquePhones[phone].name[name]
            }
            this.uniquePhones[phone].count = countInContact;
          }
          
          //let emailCount = 0;
          for (let email in this.uniqueEmails){
            //emailCount++;
            let countInContact = 0;
            for (let name in this.uniqueEmails[email].name){
              countInContact += this.uniqueEmails[email].name[name]
            }
            this.uniqueEmails[email].count = countInContact;
          }

          
          _phoneContacts.push({
                                fullname: fullname 
                                , nickname: nickname
                                , phones: phones
                                , emails: emails
                                , relationship: relationship
                              });

          //console.log(fullname,_phoneContacts);

        } 
        
      });

    

    return _phoneContacts;

  }

  processServerContacts(data){
      
      let _phoneContacts = [];

      data.forEach(contact => {

        let nickname = contact.nickname;
        let fullname = contact.fullname?contact.fullname:nickname;
        let phones = [];
        let emails = [];
        let relationship = []; 
        //tu nguoi dung dinh nghia bang cach chon
        //: ['friend', 'closefriend', 'schoolmate', 'family', 'co-worker', 'partner', 'work', 'neigbor', 'doctor', 'teacher', 'vip', 'blacklist']
        //if (fullname.indexOf('Loan comisa')>=0) console.log(fullname, contact);
        
        if (contact.phones){
          contact.phones.forEach(phone=>{
            
            let phonenumber = phone.value.replace(/[^0-9+]+/g, "");
            
            if (phonenumber&&phonenumber!==""){
              
              let intPhonenumber = this.internationalFormat(phonenumber,'84');
                 
              phonenumber = this.vnChangePrefix(phonenumber,'84',this.prefix_change);
              
              if (!this.uniquePhones[intPhonenumber]){
                Object.defineProperty(this.uniquePhones, intPhonenumber, {value: {fullname: fullname 
                                                                              , nickname: nickname
                                                                              , relationship: relationship}, writable: false, enumerable: true, configurable: false});
                
                if (fullname){
                  this.uniquePhones[intPhonenumber].name = {};
                  Object.defineProperty(this.uniquePhones[intPhonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                }

                phones.push({value: phonenumber, type: phone.type, int: intPhonenumber})
              }else{
                
                if (fullname){
                  if (this.uniquePhones[intPhonenumber].name[fullname]){
                    this.uniquePhones[intPhonenumber].name[fullname] += 1;
                  }else{
                    Object.defineProperty(this.uniquePhones[intPhonenumber].name, fullname, {value: 1, writable: true, enumerable: true, configurable: false});
                  }
                }
                
              }

            }
          })
        }

        if (contact.emails){
          contact.emails.forEach(email=>{
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

          //let countPhone = 0;
          for (let phone in this.uniquePhones){
            //countPhone++;
            let countInContact = 0;
            for (let name in this.uniquePhones[phone].name){
              countInContact += this.uniquePhones[phone].name[name]
            }
            this.uniquePhones[phone].count = countInContact;
          }
          
          //let emailCount = 0;
          for (let email in this.uniqueEmails){
            //emailCount++;
            let countInContact = 0;
            for (let name in this.uniqueEmails[email].name){
              countInContact += this.uniqueEmails[email].name[name]
            }
            this.uniqueEmails[email].count = countInContact;
          }

          
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


  listContactsFromServer(){
    return new Promise((resolve,reject)=>{
      let loading = this.loadingCtrl.create({
        content: 'Đọc danh bạ từ máy chủ...'
      });
      loading.present();
  
      this.apiAuth.getDynamicUrl(ApiStorageService.authenticationServer+"/ext-auth/get-your-contacts",true)
      .then(res=>{
        if (res.status===1&&res.result&&res.result.length>0){
          resolve(res.result);
        }else{
          reject("No data");
        }
        loading.dismiss();
      })
      .catch(err=>{
        loading.dismiss();
        reject(err);
      })

    })

  }

  saveContacts2Server(contacts){
    //luu danh ba len may chu
    this.apiAuth.postDynamicForm(ApiStorageService.authenticationServer+"/ext-auth/save-your-contacts",contacts,true)
    .then(res=>{
      
      this.toastCtrl.create({
        message: "Đã lưu lại thành công!",
        duration: 3000,
        position:'middle'
      }).present();

    })
    .catch(err_=>{
      
      this.toastCtrl.create({
        message: "res" + JSON.stringify(err_),
        duration: 10000,
        position:'bottom'
      }).present();

    })
  }

  /**
   * vao contact thi doc danh ba va load len ds sau khi tinh chinh
   * luu ds len may chu ngay sau khi doc (chi luu ds so goc duy nhat)
   * 1/mot nut luu lai danh ba sau khi da chinh sua
   * 2/truong hop web khong co danh ba cordova..
   * doc du lieu tu may chu (dong bo tu app)
   * truong hop chua dong bo thi danh ba trong
   * truong hop da dong bo thi doc ra ds va hien thi ra
   * cho phep chinh sua, xoa
   * luu lai len may chu va luu xuong session
   * tren mobile
   */
  listContacts() {

    let loading = this.loadingCtrl.create({
      content: 'Đợi lọc dữ liệu từ danh bạ'
    });
    loading.present();
    
    this.contacts
    //.find(['displayName', 'name', 'phoneNumbers', 'emails', 'photos', 'urls', 'organizations', 'addresses', 'birthday', 'ims']
    .find(['displayName', 'name', 'phoneNumbers', 'emails',]
                        , { filter: "", multiple: true })
      .then(data => {

        //this.phoneContactsOrigin = data;

        this.showToast(loading, 'Đã đọc xong danh bạ ' + data.length + ' số', 0, 1);
        
        this.phoneContacts = this.processContacts(data);

        this.saveContacts2Server(this.phoneContacts);

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


  async presentAlert(message) {
    const alert = await this.alertController.create({
      title: 'Alert',
      subTitle: 'For Administrator',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  doInfinite(infiniteScroll,direction) {
    if (direction==='UP'){
      //console.log('UP');
      this.setViewConctactsPage(-1);
      
      setTimeout(() => {
        this.isLoaded = !this.isLoaded;
        infiniteScroll.complete();
      }, 500);

    }else{
      //console.log('DOWN');
      this.setViewConctactsPage(1);

      setTimeout(() => {
        this.isLoaded = !this.isLoaded;
        infiniteScroll.complete();
      }, 500);

    }

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




