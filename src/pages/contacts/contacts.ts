import { Component } from '@angular/core';
import { LoadingController, ToastController, ItemSliding } from 'ionic-angular';

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
                            /* , {color:"primary", icon:"contacts", next:"FRIENDS" //doc danh ba chinh thuc
                                  , alerts:[
                                  "903500888"
                                  ]
                            } */
                            , {color:"primary", icon:"sync", next:"SYNC"}          //doc danh ba tu may, day len may chu
                          //, {color:"primary", icon:"cog", next:"SETTINGS"}        //Thiet lap thong so
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

  //phoneContactsOrigin: any = [];

  isSearch: boolean = false;
  searchString: string = '';

  prefix_change:any;

  userInfo:any;
  

  constructor(
    private apiAuth: ApiAuthService,
    private apiStorage: ApiStorageService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private contacts: Contacts) { }


  ngOnInit(){
    //doc tu bo nho ra danh ba cua ung dung
    //let ke danh ba 
    this.userInfo = this.apiAuth.getUserInfo();

    if (this.userInfo){
      this.refresh();
    }else{
      alert("Please login first!")
    }

  }

  
  async refresh(){

    try{
      this.prefix_change = await this.apiAuth.getDynamicUrl("https://c3.mobifone.vn/api/ext-public/vn-prefix-change");
    }catch(e){}

    this.listContacts();
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
      this.phoneContacts.splice(idx,1);
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
          await this.apiStorage.saveUserContacts(this.userInfo, this.phoneContacts);
          //await this.saveContacts2Server(this.phoneContacts); //sua server de lay session
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
    if (prefix){
      let found = prefix.find(x=>("+" + nation_callingcode + x.old_code)===phoneReturn.substring(0,("+" + nation_callingcode + x.old_code).length))
      if (found){
        phoneReturn = "+" + nation_callingcode + found.new_code + phoneReturn.substring(("+" + nation_callingcode + found.old_code).length)
      }else{
        found = prefix.find(x=>("0" + x.old_code)===phoneReturn.substring(0,("0" + x.old_code).length))
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


  listContactsFromServer(){
    let loading = this.loadingCtrl.create({
      content: 'Đọc danh bạ từ máy chủ...'
    });
    loading.present();

    this.apiAuth.getDynamicUrl(ApiStorageService.authenticationServer+"/get-your-contacts?user=903500888",true)
    .then(res=>{
      
      if (res.status===1&&res.result&&res.result.length>0){
        
        

        this.phoneContacts = this.processContacts(res.result);
        //danh ba moi se lay truc tiep khong xu ly nua
        //hoac chi xu ly tao ds rieng

      }
      
        loading.dismiss();
    })
    .catch(err=>{
      loading.dismiss();
    })
  }

  saveContacts2Server(contacts){
    //luu danh ba len may chu
    this.apiAuth.postDynamicForm(ApiStorageService.authenticationServer+"/save-your-contacts",contacts,true)
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

        this.listContactsFromServer();
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




