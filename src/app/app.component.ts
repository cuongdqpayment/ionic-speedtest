import { Component, ViewChild, HostListener } from '@angular/core';
import { Platform, Nav, MenuController, ModalController, Events, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DynamicFormMobilePage } from '../pages/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicFormWebPage } from '../pages/dynamic-form-web/dynamic-form-web';
import { DynamicRangePage } from '../pages/dynamic-range/dynamic-range';
import { DynamicListPage } from '../pages/dynamic-list/dynamic-list';
import { DynamicListOrderPage } from '../pages/dynamic-list-order/dynamic-list-order';
import { DynamicTreePage } from '../pages/dynamic-tree/dynamic-tree';
import { DynamicMediasPage } from '../pages/dynamic-medias/dynamic-medias';
import { DynamicCardSocialPage } from '../pages/dynamic-card-social/dynamic-card-social';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { LoginPage } from '../pages/login/login';
import { HandDrawPage } from '../pages/hand-draw/hand-draw';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiAuthService } from '../services/apiAuthService';
import { HomeMenuPage } from '../pages/home-menu/home-menu';
import { HomeSpeedtestPage } from '../pages/home-speedtest/home-speedtest';
import { OwnerImagesPage } from '../pages/owner-images/owner-images';

import { Socket, SocketIoConfig } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { ApiImageService } from '../services/apiImageService';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { LinkPage } from '../pages/link/link';
import { QrBarScannerPage } from '../pages/qr-bar-scanner/qr-bar-scanner';
import { ContactsPage } from '../pages/contacts/contacts';
import { CordovaPage } from '../pages/cordova-info/cordova-info';


const createObjectKey = (obj, key, value) => {
  Object.defineProperty(obj, key, { value: value, writable: true, enumerable: true, configurable: false });
  return obj;
}


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  //ham nhan key press tren web
  keyCode: any;
  @HostListener('document:keyup', ['$event']) handleKeyboardEvent(event: KeyboardEvent) {
    this.keyCode = event.keyCode;
    //console.log('key',this.keyCode);
    //se cho tat ca cac hotkey go duoc
  }

  rootPage: any = HomeMenuPage;

  treeMenu: any;
  callbackTreeMenu: any;
  userInfo: any;
  token: any;

  mySocket: any;

  keyPair: any;
  friends: any; //danh sach ban be de lien ket
  follows: any; //danh sach follow de lay tin ()

  contacts: any = {}      //users with all info include image private
  //login vao thi lay user cua minh
  //lien lac voi chat thi lay user new online
  //doc danh ba tu dien thoai thi tao user offline
  //{username:{fullname,nickname,image,status:-1,0,1}} -1= from contact, 0 = owner, 1 online
  users = []        //users online
  rooms = [];       //room online
  originRooms = []; //luu goc
  socket: Socket;
  configSocketIo: SocketIoConfig;
  last_time: number = new Date().getTime();

  constructor(
    private menuCtrl: MenuController, //goi trong callback
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private apiStorageService: ApiStorageService,
    private apiImage: ApiImageService,
    private auth: ApiAuthService,
    private events: Events,
    private inAppBrowser: InAppBrowser, //goi trong callback
    private platform: Platform,
    private toastCtrl: ToastController,
    statusBar: StatusBar,
    splashScreen: SplashScreen
  ) {
    this.platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit() {

    this.callbackTreeMenu = this.callbackTree;

    this.ionViewDidLoad_main();

  }

  ionViewDidLoad_main() {

    this.checkTokenLogin();

    this.events.subscribe('user-log-in-ok', (() => {
      this.checkTokenLogin();
    }));

    this.events.subscribe('user-log-out-ok', (() => {
      this.checkTokenLogin();
    }));

  }

  /**
   * login ok get image and background
   * add to contacts
   */
  async userChangeImage() {
    //du lieu da duoc dang ky
    if (this.userInfo.data) {
      try {
        this.userInfo.data.image = await this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=avatar&token=" + this.apiStorageService.getToken(), 120)

        this.userInfo.data.background = await this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=background&token=" + this.apiStorageService.getToken(), 300)
      } catch (e) { }

      //this.contacts = this.apiStorageService.getUserContacts(this.userInfo);
      if (!this.contacts[this.userInfo.username]) {
        createObjectKey(this.contacts, this.userInfo.username, {
          fullname: this.userInfo.data.fullname
          , nickname: this.userInfo.data.nickname
          , image: this.userInfo.data.image
          , background: this.userInfo.data.background
          , status: 0
        })
        //this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
      } else {
        this.contacts[this.userInfo.username] = {
          fullname: this.userInfo.data.fullname
          , nickname: this.userInfo.data.nickname
          , image: this.userInfo.data.image
          , background: this.userInfo.data.background
          , status: 0 //owner user
        }
        //this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
      }
    } else {
      //du lieu chua dang ky user 
      //yeu cau dang ky user
      this.navCtrl.push(LoginPage);
    }

  }


  /**
   * thu tuc nay goi khi login thanh cong, co day du thong tin user
   * thuc hien doc tren local cac thong tin
   * friends, id, pass 
   * neu chua co 
   */
  async prepareFriends() {
    if (this.userInfo) {
      this.friends = this.apiStorageService.getUserFriends(this.userInfo);
      if (!this.friends) {
        //doc danh ba,
        let vn_prefix_code;
        let contactsProcessed;

        try {
          vn_prefix_code = await this.auth.getDynamicUrl(ApiStorageService.authenticationServer + "/ext-public/vn-net-code");
        } catch (e) { }

        //doc tu dia len, neu co thi liet ke ra luon
        let phoneContacts = this.apiStorageService.getPhoneContacts(this.userInfo);

        if (phoneContacts) {
          contactsProcessed = this.processContactsFromServer(phoneContacts, vn_prefix_code);
          //console.log('uniquePhones storage', contactsProcessed.uniquePhones);
        } else {

          try {
            //truong hop chua co thi doc tu may chu
            phoneContacts = await this.listContactsFromServer();

            if (phoneContacts) {
              contactsProcessed = this.processContactsFromServer(phoneContacts, vn_prefix_code);
              //console.log('uniquePhones server', contactsProcessed.uniquePhones);
            } else {
              //doc danh ba tu dien thoai
              phoneContacts = await this.listContactsFromSmartPhone();
              if (phoneContacts) {
                contactsProcessed = this.processContactsFromSmartPhone(phoneContacts, vn_prefix_code);
                //console.log('uniquePhones smartphone', contactsProcessed.uniquePhones);
              }
            }

          } catch (e) {
            //doc tu may len
            //neu khong co tu may chu thi doc tu dien thoai ra
            phoneContacts = await this.listContactsFromSmartPhone();
            if (phoneContacts) {
              contactsProcessed = this.processContactsFromSmartPhone(phoneContacts, vn_prefix_code);
              //console.log('uniquePhones smartphone', contactsProcessed.uniquePhones);
            }
          }
        }
        //doc ds tren server tu danh ba
        //neu co thi tu dong ket ban

        //chuyen doi contactsProcessed sang friend
        if (contactsProcessed && contactsProcessed.uniquePhones) {
          //da tim thay danh ba
          //loc lay du lieu tu server cac user da dang ky
          // dang username '90'
          //neu danh ba co luu thi tao thanh friends
          let friends;
          let count = 0;
          for (let key in contactsProcessed.uniquePhones) {
            //dang so dien thoai luu lai la +8490
            //nen cat di +84 de lay danh ba tu may chu
            //console.log(key.indexOf("+84"),contactsProcessed.uniquePhones[key].type);
            //la dien thoai di dong thi moi xem xet
            if (key.indexOf("+84") === 0
              && contactsProcessed.uniquePhones[key].type === "M"
            ) {
              friends = (friends ? friends + "," : "") + "'" + key.slice(3) + "'"
              if (++count >= 500) {
                let users = await this.listUserFromServer(friends);

                if (users) {
                  //console.log('lay user nay', users);
                  //lay danh sach user ket hop voi danh ba se ra duoc
                  //danh sach ban be ket noi nhau
                  //ghi nhan so dien thoai quoc te nhe
                  users.forEach(el => {
                    let existFriend = this.friends ? this.friends.find(x => x.username === el.username) : null;
                    if (existFriend) {
                      //doi ten ghi lai ten duoc doi tren server
                      //doi avatar??
                    } else {
                      if (!this.friends) this.friends = [];
                      this.friends.push(el);
                    }
                  });
                }
                //delay ???
                count = 0;
                friends = null;
              }
            }
          }

          if (count > 0 && friends) {
            let users = await this.listUserFromServer(friends);
            if (users) {
              users.forEach(el => {
                let existFriend = this.friends ? this.friends.find(x => x.username === el.username) : null;
                if (existFriend) {
                  //doi ten ghi lai ten duoc doi tren server
                  //doi avatar??
                } else {
                  if (!this.friends) this.friends = [];
                  this.friends.push(el);
                }
              });
            }
          }          
        }
      }
      

      console.log('friends', this.friends);
      //phan luu avatar ?? khi luu user tu dong luu avatar base64 co nho???

      this.keyPair = this.apiStorageService.getUserKey(this.userInfo);
      if (this.keyPair) {
        //nhap pass de giai ma private key

      } else {
        //lay pass tren server (hoac lay private key tren server)
        //tao pass, luu key
        //luu server 

      }
    }
  }

  prepareContactsNewUser(user) {

    if (user.username !== this.userInfo.username) {
      //luon lam moi thong tin cua user moi lan login
      new Promise((resolve, reject) => {
        this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=avatar&user=" + user.username + "&token=" + this.apiStorageService.getToken(), 64)
          .then(base64 => {
            user.image = base64;
            resolve()
          })
          .catch(err => reject(err));
      })
        .then(() => {
          if (!this.contacts[user.username]) {
            createObjectKey(this.contacts, user.username, {
              fullname: user.data.fullname
              , nickname: user.data.nickname
              , image: user.image
              , status: 1 //user online chat
            })
            //this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
          } else {
            this.contacts[user.username] = {
              fullname: user.data.fullname
              , nickname: user.data.nickname
              , image: user.image
              , status: 1 //user online chat
            }
            //this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
          }
        })
        .catch(err => { })
        .then(() => {
          console.log('xong prepare', this.contacts)
        })
    }

  }

  checkTokenLogin() {
    this.token = this.apiStorageService.getToken();
    if (this.token) {

      let loading = this.loadingCtrl.create({
        content: 'Đợi xác thực...'
      });
      loading.present();

      this.auth.authorize
        (this.token)
        .then(data => {

          this.auth.getServerPublicRSAKey()
            .then(pk => {

              this.userInfo = data.user_info;
              //Tiêm token cho các phiên làm việc lấy số liệu cần xác thực
              if (this.userInfo && this.userInfo.data) {

                this.auth.injectToken();

                this.initChatting();

                this.userChangeImage();

                //login ok ... contacts, friends, ids, pass
                this.prepareFriends();

              } else {

                this.navCtrl.push(LoginPage);

              }

              this.resetTreeMenu();

              //

              loading.dismiss();
            })
            .catch(err => {

              this.resetTreeMenu();
              //console.log('Error get Public key',err);
              loading.dismiss();

            });
        })
        .catch(err => {
          //this.auth.deleteToken();
          this.resetTreeMenu();
          loading.dismiss();
        });
    } else {
      this.userInfo = undefined;
      this.resetTreeMenu();
      //yc login??
    }

  }


  initChatting() {

    this.configSocketIo = {
      url: ApiStorageService.chatServer + '?token=' + this.token
      , options: {
        path: '/media/socket.io'
        , pingInterval: 20000
        , timeout: 60000
        , reconnectionDelay: 30000
        , reconnectionDelayMax: 60000
        , wsEngine: 'ws'
      }
    };

    //chat - client -->open
    this.socket = new Socket(this.configSocketIo);
    //this.apiStorageService.deleteUserRooms(this.userInfo)
    this.originRooms = this.apiStorageService.getUserRooms(this.userInfo);

    if (this.userInfo && this.originRooms.length === 0 && this.userInfo.username === '903500888') {
      this.originRooms = [
        {
          id: this.userInfo.username + '-0#xxxx',
          name: 'demo 1',
          users: ['903500888', '702418821'],
          created: new Date().getTime(),
          time: new Date().getTime(),
          messages: [{
            //romm_id: room_id,
            //user: this.userInfo,
            text: (this.userInfo.data ? this.userInfo.data.fullname : this.userInfo.username) + " Create group",
            created: new Date().getTime()
          }]
        }
        ,
        {
          id: this.userInfo.username + '-1#yyyy',
          name: 'demo 2',
          users: ['903500888', '702418821', '905300888'],
          created: new Date().getTime(),
          time: new Date().getTime(),
          messages: [{
            //romm_id: room_id,
            //user: this.userInfo,
            text: (this.userInfo.data ? this.userInfo.data.fullname : this.userInfo.username) + " Create group",
            created: new Date().getTime()
          }]
        }
      ]; //lay tu storage de join lai cac room
    }

    //1.chat - client received welcome
    this.getMessages()
      .subscribe(data => {
        let msg;
        msg = data;
        console.log('send, message', msg);
        if (msg.step == 'INIT') {
          //socketid,user,sockets
          this.mySocket = msg.your_socket;
          //4. chat - join rooms
          this.socket.emit('client-join-rooms'
            , {
              rooms: this.originRooms
            });
        }
        if (msg.step == 'USERS') {
          //msg.users = {username,{name:,nickname:,sockets:[socketid]},...}
          for (let username in msg.users) {
            if (!this.users.find(user => user.username === username)) {
              this.users.push({
                username: username,
                name: msg.users[username].name,
                nickname: msg.users[username].nickname
              })
            }

          }

        }
        if (msg.step == 'JOINED') {
          //4.2 rooms joined first
          this.rooms = msg.rooms;

          let originRooms = []; //reset
          this.rooms.forEach(room => {
            let users = [];
            room.users.forEach(user => {
              for (let uname in user) {
                users.push(uname);
              }
            });

            if (room.id.indexOf('#') > 0) {
              originRooms.push({
                id: room.id,
                name: room.name,
                created: room.created,
                time: room.time,
                image: room.image,
                admin: room.admin,
                users: users,
                messages: room.messages,
              })
            }
          })
          //luu room de load lan sau
          this.apiStorageService.saveUserRooms(this.userInfo, originRooms);

          this.events.publish('event-main-received-rooms', this.rooms);
        }

        if (msg.step == 'ACCEPTED') {
          //5.1 + 6.2 accepted room

          //this.originRooms
          let originRooms = this.apiStorageService.getUserRooms(this.userInfo);

          if (msg.room) {

            this.rooms.push(msg.room);

            let users = [];
            msg.room.users.forEach(user => {
              for (let uname in user) {
                users.push(uname);
              }
            });

            originRooms.push({
              id: msg.room.id,
              name: msg.room.name,
              created: msg.room.created,
              time: msg.room.time,
              image: msg.room.image,
              admin: msg.room.admin,
              users: users,
              messages: msg.room.messages
            })
          }
          //luu room de load lan sau
          this.apiStorageService.saveUserRooms(this.userInfo, originRooms);

          this.events.publish('event-main-received-rooms', this.rooms);
        }

      });

    //2.chat - client received new/disconnect socket the same user
    this.getPrivateMessages()
      .subscribe(data => {
        let msg;
        msg = data;
        if (msg.step === 'START') {
          //3.2 private old socket in username inform new socket
          this.mySocket.sockets.push(msg.socket_id);
        } else if (msg.step === 'END') {
          //x.2 chat
          this.mySocket.sockets.splice(this.mySocket.sockets.indexOf(msg.socket_id), 1);
        }
        //console.log('private, mysocket',this.mySocket);
      });

    //3.1 chat - client received new user
    this.getNewUser()
      .subscribe(data => {
        let msg;
        msg = data;
        console.log('new user receive', msg);
        //luu trong contact de tham chieu nhanh, khong load lai cua server
        this.prepareContactsNewUser(msg);

        if (!this.users.find(user => user.username === msg.username)) {
          this.users.push({
            username: msg.username,
            name: msg.data.fullname,
            nickname: msg.data.nickname
          });
          this.events.publish('event-main-received-users', this.users);
        }
      });

    //4.1 + 6.1 invite join this room
    this.getInvitedRoom()
      .subscribe(data => {
        let msg;
        msg = data;
        //{roomId:{name:,messages[],users:[{username:[socketonline,...]}]}}
        console.log('new room from other', msg);
        //join-new-room
        for (let key in msg) {
          msg[key].id = key;
          //5. accept room
          this.socket.emit('client-accept-room', msg[key]);
        }

      });


    //7. new message
    this.getMessagesEmit()
      .subscribe(data => {
        let msg;
        msg = data;
        console.log('7. new message:', msg, this.rooms);
        msg.user.image = this.contacts[msg.user.username].image;

        let roomMsg = this.rooms.find(room => room.id === msg.room_id);

        roomMsg.messages.push(msg);
        this.events.publish('event-receiving-message', roomMsg);
      });

    //x.1 chat - client user disconnect
    this.getEndUser()
      .subscribe(data => {
        let msg;
        msg = data;
        this.users = this.users.splice(this.users.indexOf(msg.username), 1);
        this.events.publish('event-main-received-users', this.users);
      });

  }

  resetTreeMenu() {
    //tuy thuoc vao tung user se co menu khac nhau
    if (this.userInfo
      && (this.userInfo.username === '903500888'
        || this.userInfo.username === '702418821'
        || this.userInfo.username === '905000551'
        || this.userInfo.username === '904901567'
        || this.userInfo.username === '906515458'
        || this.userInfo.username === '766777123'
      )) {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Các liên kết Nội bộ",
          size: "1.3em",
          subs: [
            {
              name: "2.1 Quản lý công việc - yêu cầu",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/qlhs/login",
              icon: "alarm"
            }
            ,
            {
              name: "2.2 Hỗ trợ điểm bán lẻ",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/dbl/login",
              icon: "people"
            }
            ,
            {
              name: "2.3 Chọn số Công ty 3",
              size: "1.3em",
              click: true,
              popup_iframe: LinkPage, //su dung link web ko file
              url: "https://chonsoc3.mobifone.vn/",
              icon: "keypad"
            }
            ,
            {
              name: "2.4 Nối mạng Công ty 3 SSL4",
              size: "1.3em",
              click: true,
              url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
              icon: "flash"
            }
          ]
        }
        ,
        {
          name: "3. Các mẫu reponsive",
          size: "1.3em",
          subs: [
            {
              name: "3.1 Các nhập liệu",
              size: "1.3em",
              subs: [
                {
                  name: "3.1.1 Mẫu nhập liệu toàn màn hình dành cho di động",
                  click: true,
                  next: DynamicFormMobilePage,
                  icon: "phone-portrait"
                }
                ,
                {
                  name: "3.1.2 Nhập liệu và hiển thị cho desktop & di động",
                  click: true,
                  next: DynamicFormWebPage,
                  icon: "desktop"
                }
                ,
                {
                  name: "3.1.3 Mẫu nhập chọn & kéo",
                  click: true,
                  next: DynamicRangePage,
                  icon: "radio-button-on"
                }
              ]
            }
            ,
            {
              name: "3.2 Các mẫu hiển thị danh sách",
              size: "1.3em",
              subs: [
                {
                  name: "3.2.1 Mẫu danh sách quẹt nút click",
                  click: true,
                  next: DynamicListPage,
                  icon: "paper"
                }
                ,
                {
                  name: "3.2.2 Mẫu danh sách bảng, liệt kê & sắp xếp lại",
                  click: true,
                  next: DynamicListOrderPage,
                  icon: "reorder"
                }
                ,
                {
                  name: "3.2.3 Mẫu danh sách theo cây FamilyTree",
                  click: true,
                  next: DynamicTreePage,
                  icon: "menu"
                }
              ]
            }
            ,
            {
              name: "3.3 Các mẫu xử lý hình ảnh và file",
              size: "1.3em",
              subs: [
                {
                  name: "3.3.1 Mẫu upload ảnh theo facebook",
                  click: true,
                  next: DynamicMediasPage,
                  icon: "images"
                }
                ,
                {
                  name: "3.3.2 Mẫu hiển thị ảnh và tương tác mạng xã hội",
                  click: true,
                  next: DynamicCardSocialPage,
                  icon: "logo-facebook"
                }
                ,
                {
                  name: "3.3.3 Mẫu vẽ tay lên màn hình trên nền di động",
                  click: true,
                  next: HandDrawPage,
                  icon: "create"
                }
              ]
            }
          ]
        }
        ,
        {
          name: "4. Các phôi pdf In",
          size: "1.3em",
          subs: [
            {
              name: "4.1 Mẫu ma trận điểm A4",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/qld/db/matrix-a4",
              icon: "list"
            }
            ,
            {
              name: "4.2 Mẫu ma trận điểm A5",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/qld/db/matrix-a5",
              icon: "list"
            }
            ,
            {
              name: "4.3 Mở kiểu Popup iframe",
              size: "1.3em",
              click: true,
              popup_iframe: LinkPage, //su dung link web ko file
              url: "https://dantri.com.vn/",
              icon: "list"
            }
            ,
            {
              name: "4.4 Mở kiểu InApp",
              size: "1.3em",
              click: true,
              in_app_browser: LinkPage, //Link page chi gia lap thoi
              url: "https://dantri.com.vn/",
              icon: "list"
            }
          ]
        }
        ,
        {
          name: "5. Speedtest",
          size: "1.3em",
          click: true,
          next: HomeSpeedtestPage,
          icon: "speedometer"
        }
        ,
        {
          name: "6. Bản đồ dẫn đường",
          size: "1.3em",
          click: true,
          next: GoogleMapPage,
          icon: "globe"
        }
        ,
        {
          name: "7. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "8. Contacts",
          size: "1.3em",
          click: true,
          next: ContactsPage,
          icon: "contacts"
        }
        ,
        {
          name: "9. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "10. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
    } else if (this.userInfo) {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Quản lý công việc - yêu cầu",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/qlhs/login",
          icon: "alarm"
        }
        ,
        {
          name: "3. Hỗ trợ điểm bán lẻ",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/dbl/login",
          icon: "people"
        }
        ,
        {
          name: "4. Chọn số Công ty 3",
          size: "1.3em",
          click: true,
          popup_iframe: LinkPage, //su dung link web ko file
          url: "https://chonsoc3.mobifone.vn/",
          icon: "keypad"
        }
        ,
        {
          name: "5. Nối mạng Công ty 3 SSL4",
          size: "1.3em",
          click: true,
          url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
          icon: "flash"
        }
        ,
        {
          name: "6. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "7. Contacts",
          size: "1.3em",
          click: true,
          next: ContactsPage,
          icon: "contacts"
        }
        ,
        {
          name: "8. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "9. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]

    } else {
      this.treeMenu = [
        {
          name: "1. Trang chủ",
          size: "1.3em",
          click: true,
          next: this.rootPage,
          icon: "home"
        }
        ,
        {
          name: "2. Quản lý công việc - yêu cầu",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/qlhs/login",
          icon: "alarm"
        }
        ,
        {
          name: "3. Hỗ trợ điểm bán lẻ",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://c3.mobifone.vn/dbl/login",
          icon: "people"
        }
        ,
        {
          name: "4. Chọn số Công ty 3",
          size: "1.3em",
          click: true,
          popup_iframe: LinkPage, //su dung link web ko file
          url: "https://chonsoc3.mobifone.vn/",
          icon: "keypad"
        }
        ,
        {
          name: "5. Nối mạng Công ty 3 SSL4",
          size: "1.3em",
          click: true,
          url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
          icon: "flash"
        }
        ,
        {
          name: "6. Qr Bar Scanner",
          size: "1.3em",
          click: true,
          next: QrBarScannerPage,
          icon: "qr-scanner"
        }
        ,
        {
          name: "7. Cordova",
          size: "1.3em",
          click: true,
          next: CordovaPage,
          icon: "heart"
        }
        ,
        {
          name: "8. Login",
          size: "1.3em",
          click: true,
          next: LoginPage,
          icon: "log-in"
        }
      ]
    }

    this.events.publish('event-main-login-checked', {
      token: this.token,
      user: this.userInfo,
      socket: this.socket
    });
  }


  callbackTree = function (item, idx, parent, isMore: boolean) {
    if (item.visible) {
      parent.forEach((el, i) => {
        if (idx !== i) this.expandCollapseAll(el, false)
      })
    }

    if (isMore) {
      if (item.next) {
        this.navCtrl.push(item.next);
        this.menuCtrl.close();
        if (item.next === HomeMenuPage) {

          setTimeout(() => {
            //console.log(item);
            this.events.publish('event-main-login-checked', {
              token: this.token,
              user: this.userInfo,
              socket: this.socket
            });

            this.events.publish('event-main-received-users', this.users);
            this.events.publish('event-main-received-rooms', this.rooms);
          }, 1000)

        }
      } else if (item.in_app_browser && item.url) {

        var target = "_blank"; //mo trong inappbrowser
        var options = "hidden=no,toolbar=yes,location=yes,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
        this.inAppBrowser.create(item.url, target, options);

      } else if (item.popup_iframe && item.url) {

        if (this.platform.is('ios')) {
          this.inAppBrowser.create(item.url, '_blank');
        } else {
          this.openModal(item.popup
            , {
              parent: this,
              link: item.url
            });
        }

      } else if (item.url) {
        //neu ios, browser, android??
        if (this.platform.is('ios')) {
          this.inAppBrowser.create(item.url);
        } else {
          window.open(item.url, '_system');
        }
      }
    }

  }.bind(this)



  onClickUser() {
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }


  callbackChangeImage = function (res: any) {
    return new Promise((resolve, reject) => {
      this.userChangeImage();
      resolve({ next: 'CLOSE' })
    })
  }.bind(this)

  onClickUserImage(func) {
    this.openModal(OwnerImagesPage,
      {
        parent: this
        , func: func
        , callback: this.callbackChangeImage
      });
  }

  onClickLogin() {
    this.navCtrl.push(LoginPage);
    this.menuCtrl.close();
  }

  onClickHeader(btn) {
    if (btn.next === "EXPAND") this.treeMenu.forEach(el => this.expandCollapseAll(el, true))
    if (btn.next === "COLLAPSE") this.treeMenu.forEach(el => this.expandCollapseAll(el, false))
  }

  expandCollapseAll(el, isExpand: boolean) {
    if (el.subs) {
      el.visible = isExpand;
      el.subs.forEach(el1 => {
        this.expandCollapseAll(el1, isExpand)
      })
    }
  }

  openModal(form, data?: any) {
    let modal = this.modalCtrl.create(form, data);
    modal.present();
  }

  //emit....
  jointRooms() {
    this.socket.emit('client-joint-room'
      , {
        rooms: this.originRooms,
        last_time: this.last_time
      });
  }

  //socket.on...
  getMessages() {
    return new Observable(observer => {
      this.socket.on("message", (data) => {
        observer.next(data);
      });
    })
  }

  getPrivateMessages() {
    return new Observable(observer => {
      this.socket.on("server-private-emit", (data) => {
        observer.next(data);
      });
    })
  }

  /**
   * new user connected
   */
  getNewUser() {
    return new Observable(observer => {
      this.socket.on("server-broadcast-new-user", (data) => {
        observer.next(data); //user
      });
    })
  }

  /**
   * 4.1 room other socket or user new invite
   */
  getInvitedRoom() {
    return new Observable(observer => {
      this.socket.on("server-private-join-room-invite", (data) => {
        observer.next(data); //user
      });
    })
  }

  /**
   * end user coonected
   */
  getEndUser() {
    return new Observable(observer => {
      this.socket.on("server-broadcast-end-user", (data) => {
        observer.next(data); //user
      });
    })
  }

  getMessagesEmit() {
    return new Observable(observer => {
      this.socket.on("server-emit-message", (data) => {
        observer.next(data);
      });
    })
  }


  /**
   * Process contacts
   * lay danh ba ve, chuyen doi mot danh ba so dien thoai
   * 
   */

  processContactsFromServer(data, vn_prefix_code) {

    let _phoneContacts = [];
    let _uniquePhones = {};
    let _uniqueEmails = {};

    if (data) {

      data.forEach(contact => {

        let nickname = contact.nickname;
        let fullname = contact.fullname ? contact.fullname : nickname;
        let phones = [];
        let emails = [];
        let relationship = [];
        //tu nguoi dung dinh nghia bang cach chon
        //: ['friend', 'closefriend', 'schoolmate', 'family', 'co-worker', 'partner', 'work', 'neigbor', 'doctor', 'teacher', 'vip', 'blacklist']
        //if (fullname.indexOf('Loan comisa')>=0) console.log(fullname, contact);

        if (contact.phones) {
          contact.phones.forEach(phone => {

            let phonenumber = phone.value.replace(/[^0-9+]+/g, "");

            if (phonenumber && phonenumber !== "") {

              let netCode = this.checkPhoneType(phonenumber, '84', vn_prefix_code);

              let intPhonenumber = this.internationalFormat(phonenumber, '84');

              if (!_uniquePhones[intPhonenumber]) {
                Object.defineProperty(_uniquePhones, intPhonenumber, {
                  value: {
                    fullname: fullname
                    , nickname: nickname
                    , type: netCode && netCode.f_or_m ? netCode.f_or_m : '#'
                    , relationship: relationship
                  }, writable: false, enumerable: true, configurable: false
                });

                if (fullname) {
                  _uniquePhones[intPhonenumber].name = {};
                  Object.defineProperty(_uniquePhones[intPhonenumber].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                }

                phones.push({ value: phonenumber, type: netCode && netCode.f_or_m ? netCode.f_or_m : '#', int: intPhonenumber, net: netCode && netCode.network ? netCode.network : '#' })
              } else {

                if (fullname) {
                  if (_uniquePhones[intPhonenumber].name[fullname]) {
                    _uniquePhones[intPhonenumber].name[fullname] += 1;
                  } else {
                    Object.defineProperty(_uniquePhones[intPhonenumber].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                  }
                }

              }

            }
          })
        }

        if (contact.emails) {
          contact.emails.forEach(email => {
            if (!_uniqueEmails[email.value]) {
              Object.defineProperty(_uniqueEmails, email.value, {
                value: {
                  fullname: fullname
                  , nickname: nickname
                  , relationship: relationship
                }, writable: false, enumerable: true, configurable: false
              });

              emails.push({ value: email.value, type: 'E' });

              if (fullname) {
                _uniqueEmails[email.value].name = {};
                Object.defineProperty(_uniqueEmails[email.value].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
              }

            } else {

              if (fullname) {
                if (_uniqueEmails[email.value].name[fullname]) {
                  _uniqueEmails[email.value].name[fullname] += 1;
                } else {
                  Object.defineProperty(_uniqueEmails[email.value].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                }
              }

            }
          })
        }

        if (fullname && (phones.length > 0 || emails.length > 0)) {

          //let countPhone = 0;
          for (let phone in _uniquePhones) {
            //countPhone++;
            let countInContact = 0;
            for (let name in _uniquePhones[phone].name) {
              countInContact += _uniquePhones[phone].name[name]
            }
            _uniquePhones[phone].count = countInContact;
          }

          //let emailCount = 0;
          for (let email in _uniqueEmails) {
            //emailCount++;
            let countInContact = 0;
            for (let name in _uniqueEmails[email].name) {
              countInContact += _uniqueEmails[email].name[name]
            }
            _uniqueEmails[email].count = countInContact;
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
    }
    return {
      contacts: _phoneContacts,
      uniquePhones: _uniquePhones,
      uniqueEmails: _uniqueEmails
    };

  }

  processContactsFromSmartPhone(data, vn_prefix_code) {

    let _phoneContacts = [];
    let _uniquePhones = {};
    let _uniqueEmails = {};


    if (data) {

      data.forEach(contact => {

        //console.log(contact);

        let nickname = contact._objectInstance && contact._objectInstance.name && contact._objectInstance.name.formatted ? contact._objectInstance.name.formatted : contact._objectInstance.name.givenName;
        let fullname = contact._objectInstance.displayName ? contact._objectInstance.displayName : nickname;
        let phones = [];
        let emails = [];
        let relationship = [];
        //tu nguoi dung dinh nghia bang cach chon
        //: ['friend', 'closefriend', 'schoolmate', 'family', 'co-worker', 'partner', 'work', 'neigbor', 'doctor', 'teacher', 'vip', 'blacklist']

        //console.log(fullname);


        if (contact._objectInstance.phoneNumbers) {
          contact._objectInstance.phoneNumbers.forEach(phone => {

            let phonenumber = phone.value.replace(/[^0-9+]+/g, "");

            if (phonenumber && phonenumber !== "") {

              let netCode = this.checkPhoneType(phonenumber, '84', vn_prefix_code);
              //console.log(netCode);

              let intPhonenumber = this.internationalFormat(phonenumber, '84');



              if (!_uniquePhones[intPhonenumber]) {
                Object.defineProperty(_uniquePhones, intPhonenumber, {
                  value: {
                    fullname: fullname
                    , nickname: nickname
                    , type: netCode && netCode.f_or_m ? netCode.f_or_m : '#'
                    , relationship: relationship
                  }, writable: false, enumerable: true, configurable: false
                });


                phones.push({ value: phonenumber, type: netCode && netCode.f_or_m ? netCode.f_or_m : '#', int: intPhonenumber, net: netCode && netCode.network ? netCode.network : '#' })

                _uniquePhones[intPhonenumber].name = {};
                if (fullname) {
                  Object.defineProperty(_uniquePhones[intPhonenumber].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                }
              } else {

                if (fullname) {
                  if (_uniquePhones[intPhonenumber].name[fullname]) {
                    _uniquePhones[intPhonenumber].name[fullname] += 1;
                  } else {
                    Object.defineProperty(_uniquePhones[intPhonenumber].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                  }
                }

              }

            }
          })
        }

        if (contact._objectInstance.emails) {

          contact._objectInstance.emails.forEach(email => {

            if (!_uniqueEmails[email.value]) {

              Object.defineProperty(_uniqueEmails, email.value, {
                value: {
                  fullname: fullname
                  , nickname: nickname
                  , relationship: relationship
                }, writable: false, enumerable: true, configurable: false
              });
              emails.push({ value: email.value, type: 'E' });
              _uniqueEmails[email.value].name = {};

              if (fullname) {
                Object.defineProperty(_uniqueEmails[email.value].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
              }

            } else {

              if (fullname) {
                if (_uniqueEmails[email.value].name[fullname]) {
                  _uniqueEmails[email.value].name[fullname] += 1;
                } else {
                  Object.defineProperty(_uniqueEmails[email.value].name, fullname, { value: 1, writable: true, enumerable: true, configurable: false });
                }
              }

            }
          })
        }

        if (fullname && (phones.length > 0 || emails.length > 0)) {

          //let countPhone = 0;
          for (let phone in _uniquePhones) {
            //countPhone++;
            let countInContact = 0;
            for (let name in _uniquePhones[phone].name) {
              countInContact += _uniquePhones[phone].name[name]
            }
            _uniquePhones[phone].count = countInContact;
          }

          //let emailCount = 0;
          for (let email in _uniqueEmails) {
            //emailCount++;
            let countInContact = 0;
            for (let name in _uniqueEmails[email].name) {
              countInContact += _uniqueEmails[email].name[name]
            }
            _uniqueEmails[email].count = countInContact;
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

    }

    return {
      contacts: _phoneContacts,
      uniquePhones: _uniquePhones,
      uniqueEmails: _uniqueEmails
    };

  }

  /**
   * Chuyen doi so dien thoai sang kieu quoc te de luu tru duy nhat
   * @param phone 
   * @param nation_callingcode 
   */
  internationalFormat(phone, nation_callingcode) {
    let phoneReturn = phone;

    if (phone.indexOf('+') === 0) {
      phoneReturn = phone;
    }

    if (phone.indexOf('00') === 0) {
      phoneReturn = '+' + phone.substring(2);
    } else if (phone.indexOf('0') === 0) {
      phoneReturn = '+' + nation_callingcode + phone.substring(1);
    }

    return phoneReturn;
  }

  /**
   * lay ma mang dien thoai (co dinh, di dong)
   * Cac dau so luu trong danh ba kieu + hoac 0
   */
  checkPhoneType(phone, nation_callingcode, net_code) {
    if (net_code) {
      let found = net_code.find(x => ("+" + nation_callingcode + x.code) === phone.substring(0, ("+" + nation_callingcode + x.code).length))
      if (found) {
        return found
      } else {
        found = net_code.find(x => ("0" + x.code) === phone.substring(0, ("0" + x.code).length))
        if (found) {
          return found
        }
      }
    }
    return null;
  }

  /**
   * Doc danh ba tu may chu
   */
  listContactsFromServer() {

    return new Promise((resolve, reject) => {

      //console.log('doc tu may chu day');
      let loading = this.loadingCtrl.create({
        content: 'Đọc danh bạ từ máy chủ...'
      });
      loading.present();

      this.auth.getDynamicUrl(ApiStorageService.authenticationServer + "/ext-auth/get-your-contacts", true)
        .then(res => {
          //console.log('ket qua res', res);
          if (res.status === 1 && res.result && res.result.length > 0) {
            resolve(res.result);
          } else {
            resolve();
          }
          loading.dismiss();
        })
        .catch(err => {
          console.log('loi may chu', err);
          loading.dismiss();
          resolve()
        })

    })

  }

  listContactsFromSmartPhone() {

    return new Promise((resolve, reject) => {
      let loading = this.loadingCtrl.create({
        content: 'Đợi lọc dữ liệu từ danh bạ'
      });
      loading.present();

      this.contacts
        //.find(['displayName', 'name', 'phoneNumbers', 'emails', 'photos', 'urls', 'organizations', 'addresses', 'birthday', 'ims']
        .find(['displayName', 'name', 'phoneNumbers', 'emails',]
          , { filter: "", multiple: true })
        .then(data => {

          loading.dismiss()

          this.toastCtrl.create({
            message: 'Đã đọc xong danh bạ ' + data.length + ' số',
            duration: 5000,
            position: 'middle'
          }).present();

          resolve(data);

        })
        .catch(err => {
          loading.dismiss()

          this.toastCtrl.create({
            message: 'Lỗi đọc danh bạ: ' + JSON.stringify(err),
            duration: 5000,
            position: 'bottom'
          }).present();

          resolve();

        });
    })

  }


  listUserFromServer(friends) {

    return new Promise<any>((resolve, reject) => {

      //console.log('doc tu may chu day');
      let loading = this.loadingCtrl.create({
        content: 'Tìm bạn bè từ máy chủ...'
      });
      loading.present();

      this.auth.getDynamicUrl(ApiStorageService.authenticationServer + "/ext-auth/get-users-info?users=" + friends, true)
        .then(res => {
          //console.log('ket qua get-users-info?users', res);
          if (res.status === 1 && res.users && res.users.length > 0) {
            resolve(res.users);
          } else {
            resolve();
          }
          loading.dismiss();
        })
        .catch(err => {
          //console.log('loi may chu', err);
          loading.dismiss();
          resolve()
        })

    })

  }

}

