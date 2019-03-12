import { Component, ViewChild } from '@angular/core';
import { NavController, Events, Slides, NavParams, ModalController } from 'ionic-angular';
import { Socket, SocketIoConfig } from 'ng-socket-io';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';
import { Observable } from 'rxjs/Observable';
import { DynamicRangePage } from '../dynamic-range/dynamic-range';
import { ChattingPage } from '../chatting/chatting';

@Component({
  selector: 'page-home-chat',
  templateUrl: 'home-chat.html'
})

export class HomeChatPage {
  @ViewChild(Slides) slides: Slides;
  slideIndex = 0;
  token:any;
  userInfo:any;

  socket: Socket;
  configSocketIo: SocketIoConfig;

  roomType = '$R#';
  rooms = [];
  userType = '$U#';
  users = [];
  last_time:number = new Date().getTime();

  chatManager: any = {
    title: "Chats - Nhắn tin online"
    , search_bar: {hint: "Tìm cái gì đó"} 
    , buttons: [
        {color:"primary", icon:"add", next:"ADD"}
        , {color:"primary", icon:"contacts", next:"FRIENDS"}
        , {color:"primary", icon:"notifications", next:"NOTIFY"
          , alerts:[
              "cuong.dq"
              ]
          }
        , {color:"royal", icon:"cog", next:"SETTINGS"}
      ]
    , items: []
  }

  isSearch: boolean = false;
  searchString: string = '';
  shouldShowCancel: boolean = false;

  constructor(private navParams: NavParams, 
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private apiAuth: ApiAuthService,
              private events: Events,
              private apiStorage: ApiStorageService) {}

  ngOnInit() {
     //this.slides.lockSwipes(true);
     this.userInfo = this.navParams.get('user'); 
     this.token = this.navParams.get('token'); 
     
     this.configSocketIo = { url: ApiStorageService.chatServer+'?token='+this.token
                            , options: {  path:'/media/socket.io'
                                        //,transports: ['websocket']
                                        , pingInterval: 10000
                                        , wsEngine: 'ws'
                            } };
     this.socket = new Socket(this.configSocketIo); 
     //this.socket.connect();
     //this.socket.emit('authenticate',{token:this.token});
     this.getMessages()
     .subscribe(data=>{
       let msg;
       msg = data;
       //console.log(msg);
       if (msg.step=='INIT'){
          //console.log('client-joint-room'); 
          this.jointRooms();
       }
     });

     this.getMessagesEmit()
     .subscribe(data=>{
       let msg;
       msg = data;
       //console.log('server send - client receive',msg);
       msg.user.image = ApiStorageService.mediaServer + "/db/get-private?func=avatar&user="+msg.user.username+"&token="+this.token;
       let roomMsg = this.rooms.find(x=>x.id ===msg.room_id);
       roomMsg.messages.push(msg);
       this.events.publish('event-receiving-message',roomMsg);
     });
 

     this.getRoomChating()
     .subscribe(data=>{
      let msg;
      msg = data;
      console.log(msg);
      this.users = msg.users;

     })

  }

  ionViewDidLoad() {
    console.log('Form load home-chats')
  }


  ionViewWillLeave() {
    console.log('Form Leave home-chats')
    //this.socket.disconnect();
  }

  //Su dung search
  //---------------------
  goSearch(){
    this.isSearch = true;
  }

  searchEnter(){
    this.isSearch = false;
  }

  onInput(e){
    console.log(this.searchString);
  }

  callbackAddRoom = function(res){
    return new Promise((resolve,reject)=>{
      let users = [];
      res.data.forEach(el=>{
        for (let key in el.details){
          if (el.details[key]){
            users.push(key)
          }
        }
      })

      //console.log(this.userInfo);
      
      if (users.length>0){
        this.rooms.push(
          {
            id: this.roomType + this.userInfo.username + "#" + new Date().getTime(),
            name: this.roomType + 'New Group',
            group_users: users,
            image: ApiStorageService.mediaServer + "/db/get-private?func=avatar&token="+this.token,
            messages:[{
              text: (this.userInfo.data?this.userInfo.data.fullname:this.userInfo.username) + " Create group",
              created: new Date().getTime()
            }]
          }
        )
      }

      console.log('results ROOMS:',this.rooms);

      this.jointRooms()

      resolve({next:'CLOSE'});
    })
  }.bind(this);

  
  callbackChatRoom = function(res){
    return new Promise((resolve,reject)=>{
      resolve();
    })
  }.bind(this);

  onClickItem(room){
    console.log('goto room',room);
    this.navCtrl.push(ChattingPage, {
                        parent:this,
                        socket: this.socket,
                        user: this.userInfo,
                        token: this.token,
                        callback: this.callbackChatRoom,
                        room: room
                      })
  }

  //onclick....
  onClickHeader(btn){
    //console.log(btn);
    if (btn.next==='ADD'){

      let details = [];
      this.users.forEach(el=>{
        details.push({key:el.username,name:el.username.slice(3),color:"secondary",value:0})
      })

      let formData={
        parent: this,
        callback: this.callbackAddRoom
        ,form: {title: "Chọn user để liên lạc"
        , items: [
          { type: "check", key:"danh_sach", name: "Danh bạ online",
          details:details
            }
            , { 
              type: "button"
              , options: [
                 { name: "Bỏ qua", next: "CLOSE" }
                , { name: "Chọn", next: "CALLBACK"}
              ]
            }
          ]
        }
      }
      this.openModal(DynamicRangePage,formData);
    }
  }


  
  //emit....
  jointRooms(){
    this.socket.emit('client-joint-room'
                    ,{ rooms: this.rooms,
                      last_time: this.last_time
                    });
  }

  //socket.on...
  getMessages() {
    return new Observable(observer => {
      //default when server: socket.send('message data'/{})
      this.socket.on("message", (data) => {
        observer.next(data);
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

  getRoomChating() {
    return new Observable(observer => {
      this.socket.on('server-reply-room', (data) => {
        observer.next(data);
      });
    });
  }

  openModal(form,data?:any) {
    this.modalCtrl.create(form, data).present();
  }


}