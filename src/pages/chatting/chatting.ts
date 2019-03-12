import { Component, ViewChild } from '@angular/core';
import { NavController, Events, Slides, NavParams, ModalController } from 'ionic-angular';
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
    title: "Chating - Nhắn tin online"
    , search_bar: {hint: "Tìm cái gì đó"} 
    , buttons: [
        {color:"primary", icon:"add", next:"ADD"}
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
      this.users = msg.users;

     })

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
     /*  this.socket.on("message", (data) => {
        observer.next(data);
      }); */
    })
  }

  getRoomChating() {
    return new Observable(observer => {
      /* this.socket.on('server-reply-room', (data) => {
        observer.next(data);
      }); */
    });
  }

  openModal(form,data?:any) {
    this.modalCtrl.create(form, data).present();
  }


}