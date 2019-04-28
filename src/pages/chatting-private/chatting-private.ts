import { Component, ViewChild } from '@angular/core';
import { NavController, Events, NavParams, ModalController, Content } from 'ionic-angular';

import { ApiAuthService } from '../../services/apiAuthService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-chatting-private',
  templateUrl: 'chatting-private.html'
})

export class ChattingPrivatePage {

  @ViewChild(Content) contentMessages: Content;

  parent: any;
  socketId: any;

  contacts: any;
  mySocket: any;

  socket: any;

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
     
     this.parent = this.navParams.get('parent'); //lay phien rieng
     this.socketId = this.navParams.get('socket_id'); //lay phien rieng
     this.mySocket = this.navParams.get('my_socket'); //lay phien rieng
     this.contacts = this.navParams.get('contacts');  //lay avatar, name
     this.socket = this.navParams.get('socket'); 
     
     let index = this.mySocket.sockets.findIndex(x=>x==this.socketId);
     let ip = this.mySocket.users[index]?this.mySocket.users[index].ip:this.socketId;
     
     this.chatManager = {
      title: "Kênh riêng " + ip
      //+ (this.mySocket&&this.mySocket.user?this.mySocket.user.nickname:this.mySocket.user)
      , search_bar: {hint: "Tìm trong nội dung trong nhóm"}
      , buttons: [
          {color:"primary", icon:"person-add", next:"ADD"}
        ]
      , items: []
    }

      
     setTimeout(()=>{
       try{
         this.contentMessages.scrollToBottom();
       }catch(e){}
      },200);

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


  onKeydown(event){
    if (event.key === "Enter") {
        this.sendMessage()
    }
    /* else{
      this.message = event.target.value;
    } */
  }
  onKeyup(event){
    if (event.key === "Enter") {
      this.message = '';
    }
  }
  
  //emit.... socket_id
  sendMessage() {

    if (this.message.length>0){
      this.socket.emit('client-send-private-message', 
        { socket_id: this.socketId, //chi gui den socketId nay thoi
          text: this.message,
          created: new Date().getTime()
       });
    }
    
    this.message = '';
  }
 

  //socket.on...

  openModal(form,data?:any) {
    this.modalCtrl.create(form, data).present();
  }


}