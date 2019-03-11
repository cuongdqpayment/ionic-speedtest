import { Component, ViewChild } from '@angular/core';
import { NavController, Events, Slides, NavParams, ModalController } from 'ionic-angular';
import { Socket, SocketIoConfig } from 'ng-socket-io';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';
import { Observable } from 'rxjs/Observable';
import { DynamicRangePage } from '../dynamic-range/dynamic-range';

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

  rooms = [];
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
              private apiService: ApiAuthService,
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


     this.getRoomChating()
     .subscribe(data=>{
      let msg;
      msg = data;
      console.log(msg);


     })

  }

  ionViewDidLoad() {
    
  }


  ionViewWillLeave() {
    this.socket.disconnect();
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

  callbackAdd = function(res){
    return new Promise((resolve,reject)=>{
      console.log(res);
      resolve({next:'CLOSE'});
    })
  }.bind(this);

  //onclick....
  onClickHeader(btn){
    console.log(btn);
    if (btn.next==='ADD'){
      let formData={
        parent: this,
        callback: this.callbackAdd
        ,form: {title: "Chọn user để liên lạc"
        , items: [
          { type: "check", key:"danh_sach", name: "Danh bạ online",
          details:[
                {
                key:"U$903500888",
                name: "903500888",
                color:"secondary",
                value: 0}
                ,
                {
                key:"U$702418821",
                name: "702418821",
                value: 0
                }
              ]
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