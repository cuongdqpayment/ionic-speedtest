import { Component, ViewChild } from '@angular/core';
import { NavController, Events, Slides, NavParams, ModalController, Content } from 'ionic-angular';
import { Socket, SocketIoConfig } from 'ng-socket-io';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-chatting',
  templateUrl: 'chatting.html'
})

export class ChattingPage {
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) contentMessages: Content;

  slideIndex = 0;
  token:any;
  userInfo:any;

  socket: Socket;
  configSocketIo: SocketIoConfig;

  room:any;
  callback:any;
  users = [];
  last_time:number = new Date().getTime();

  chatManager: any;

  isSearch: boolean = false;
  searchString: string = '';
  shouldShowCancel: boolean = false;

  message:string = '';
  messages = [];

  

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
     this.socket = this.navParams.get('socket'); 
     this.callback = this.navParams.get('callback'); 
     this.room = this.navParams.get('room'); 

     
     this.chatManager = {
      title: "Chating - Nhắn tin online"
      , search_bar: {hint: "Tìm cái gì đó"} 
      , buttons: [
          {color:"primary", icon:"add", next:"ADD"}
        ]
      , items: []
    }

     //console.log('gui alive room',this.room,this.socket);
     this.messages = this.room.messages;
     setTimeout(()=>{
        this.contentMessages.scrollToBottom();
      },200);

     this.events.subscribe('event-receiving-message', (room => {
           if (this.room.id = room.id){
             this.messages = room.messages;
            setTimeout(()=>{
              this.contentMessages.scrollToBottom();
            },200);
           }    

        })
     )

  }

  ionViewDidLoad() {
    
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

  
  onClickItem(room){
    
  }

  //onclick....
  onClickHeader(btn){
    //console.log(btn);
    if (btn.next==='ADD'){
    }
  }


  
  //emit....
  sendMessage() {
    if (this.message.length>0){
      this.socket.emit('client-send-message', 
        { 
          text: this.message,
          room: this.room,
          created: new Date().getTime()
       });
      this.message = '';
    }
  }
 

  //socket.on...

  openModal(form,data?:any) {
    this.modalCtrl.create(form, data).present();
  }


}