import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, MenuController, ModalController, Events, LoadingController } from 'ionic-angular';
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
import { SignaturePage } from '../pages/signature/signature';
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

const createObjectKey = (obj, key, value) => {
  Object.defineProperty(obj, key, { value: value, writable: false, enumerable: true, configurable: false });
  return obj;
}


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) navCtrl: Nav;

  rootPage: any = HomeMenuPage;

  treeMenu: any;
  callbackTreeMenu: any;
  userInfo: any;
  token: any;

  mySocket: any;
  contacts = {}      //users with all info include image private
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
    private inAppBrowser: InAppBrowser,
    private platform: Platform,
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
  userChangeImage() {
    let count_process = 0;
    new Promise((resolve, reject) => {
      this.apiImage
        .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=avatar&token=" + this.apiStorageService.getToken(), 120)
        .then(base64 => {
          this.userInfo.data.image = base64;
          if (++count_process >= 2) resolve()
        })
        .catch(err => reject(err))
        ;

      this.apiImage
        .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=background&token=" + this.apiStorageService.getToken(), 300)
        .then(base64 => {
          this.userInfo.data.background = base64;
          if (++count_process >= 2) resolve()
        })
        .catch(err => reject(err))
        ;
    })
      .then(() => {
        this.contacts = this.apiStorageService.getUserContacts(this.userInfo);
        if (!this.contacts[this.userInfo.username]) {
          createObjectKey(this.contacts, this.userInfo.username, {
            fullname: this.userInfo.data.fullname
            , nickname: this.userInfo.data.nickname
            , image: this.userInfo.data.image
            , background: this.userInfo.data.background
            , status: 0
          })
          this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
        } else {
          this.contacts[this.userInfo.username] = {
            fullname: this.userInfo.data.fullname
            , nickname: this.userInfo.data.nickname
            , image: this.userInfo.data.image
            , background: this.userInfo.data.background
            , status: 0 //owner user
          }
          this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
        }
      })
      .catch(err => { })
    /* .then(()=>{
      console.log('xong user owner',this.contacts)
    }) */
  }

  prepareContactsNewUser(user) {

    if (user.username !== this.userInfo.username) {
      //luon lam moi thong tin cua user moi lan login
      new Promise((resolve, reject) => {
        this.apiImage
          .createBase64Image(ApiStorageService.mediaServer + "/db/get-private?func=avatar&user=" + user.username + "&token=" + this.apiStorageService.getToken(), 60)
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
            this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
          } else {
            this.contacts[user.username] = {
              fullname: user.data.fullname
              , nickname: user.data.nickname
              , image: user.image
              , status: 1 //user online chat
            }
            this.apiStorageService.saveUserContacts(this.userInfo, this.contacts);
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
              if (this.userInfo) this.auth.injectToken();
              this.initChatting();
              this.userChangeImage();
              this.resetTreeMenu();

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
    if (this.userInfo && (this.userInfo.username === '903500888' || this.userInfo.username === '702418821')) {
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
              popup: LinkPage, //su dung link web ko file
              url: "https://chonsoc3.mobifone.vn/",
              icon: "keypad"
            }
            ,
            {
              name: "2.4 Nối mạng Công ty 3 SSL4",
              size: "1.3em",
              click: true,
              popup: LinkPage, //su dung link web ko file
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
                  next: SignaturePage,
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
              icon: "people"
            }
            ,
            {
              name: "4.2 Mẫu ma trận điểm A5",
              size: "1.3em",
              click: true,
              url: "https://c3.mobifone.vn/qld/db/matrix-a5",
              icon: "people"
            }
            ,
            {
              name: "4.3 Mở kiểu Popup iframe",
              size: "1.3em",
              click: true,
              popup_iframe: LinkPage, //su dung link web ko file
              url: "https://dantri.com.vn/",
              icon: "people"
            }
            ,
            {
              name: "4.4 Mở kiểu InAppBrowser",
              size: "1.3em",
              click: true,
              in_app_browser: LinkPage, //Link page chi gia lap thoi
              url: "https://dantri.com.vn/",
              icon: "people"
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
          name: "7. Login",
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
          //popup: LinkPage, //su dung link web ko file
          url: "https://chonsoc3.mobifone.vn/",
          icon: "keypad"
        }
        ,
        {
          name: "5. Nối mạng Công ty 3 SSL4",
          size: "1.3em",
          click: true,
          //popup: LinkPage, //su dung link web ko file
          url: "https://ssl4.c3.mobifone.vn/dana-na/auth/url_default/welcome.cgi",
          icon: "flash"
        }
        ,
        {
          name: "6. Login",
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
      } else if (item.in_app_browser&&item.url) {
        
          var target = "_blank"; //mo trong inappbrowser
          var options = "hidden=no,toolbar=no,location=no,presentationstyle=fullscreen,clearcache=yes,clearsessioncache=yes";
          this.inAppBrowser.create(item.url,target,options);
        
      } else if (item.popup_iframe&&item.url) {
        
        if (this.platform.is('ios')) {
          this.inAppBrowser.create(item.url,'_blank');
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

}

