import { Component } from '@angular/core';
import { NavController, Events, NavParams, ModalController, ItemSliding, Item } from 'ionic-angular';

import { ApiStorageService } from '../../services/apiStorageService';
import { DynamicRangePage } from '../dynamic-range/dynamic-range';
import { ChattingPage } from '../chatting/chatting';
import { ChattingPrivatePage } from '../chatting-private/chatting-private';
import { ApiChatService } from '../../services/apiChatService';

@Component({
  selector: 'page-home-chat',
  templateUrl: 'home-chat.html'
})

export class HomeChatPage {

  chatManager:any ={};
  
  parent: any;

  mySocket: any;
  token:any;
  userInfo:any;

  socket: any;
  
  contacts: any = {};
  friends: any = [];
  rooms:any = [];
  chatNewMessages: any = [];

  isSearch: boolean = false;
  searchString: string = '';
  shouldShowCancel: boolean = false;

  constructor(private navParams: NavParams, 
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private apiChat: ApiChatService,
              private events: Events,
              private apiStorage: ApiStorageService) {}
              
  ngOnInit() {
      
      this.socket = this.apiChat.getSocket(); //object lien lac socket
                
      this.parent = this.navParams.get('parent');  //goi tu form cha
      this.mySocket = this.navParams.get('my_socket'); //thong tin cua owner
      
      this.token = this.navParams.get('token');  //thong tin owner
      this.userInfo = this.navParams.get('user');  //thong tin owner

      
      this.contacts = this.navParams.get('contacts'); //unique user hien thi name, nickname, avatar
      this.friends = this.navParams.get('friends'); //ban be da ket noi
      this.chatNewMessages = this.navParams.get('new_messages'); //tin tuc moi
      this.rooms = this.navParams.get('rooms');      //danh sach rooms lien lac
      //[{roomid:{name:'',...adding+...,users:[{username:[socketonline]}]}}]
      
      console.log('rooms',this.rooms); //doi tuong lay bat cau tu service

     this.chatManager = {
      title: "Chatting Rooms of " + (this.userInfo&&this.userInfo.data?this.userInfo.data.nickname:this.userInfo.username)
      , search_bar: {hint: "Tìm số điện thoại hoặc tên nhóm"} 
      , buttons: [
          {color:"secondary", icon:"link", next:"ADD"}
        ]
      , items: []
    };

  }

  ionViewDidLoad() {
    //console.log('Form load home-chats')
  }

  ionViewDidLeave() {
    
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
      let groupName;
      res.data.forEach(el=>{
        //el.room_name???
        groupName = el.title?el.title:'new Group';
        for (let key in el.details){
          if (el.details[key]){
            users.push(key)
          }
        }
      })

      //console.log('users new room:',users);
      
      if (users.length>0){
        let room_id = this.userInfo.username + "#" + new Date().getTime();
        let roomNew = 
          {
            id: room_id,
            name: groupName,
            image: ApiStorageService.mediaServer + "/db/get-private?func=avatar&token="+this.token,
            admins:[this.userInfo.username],
            users: users,
            created: new Date().getTime(),
            time:  new Date().getTime(),
            messages:[{
              text: (this.userInfo.data?this.userInfo.data.fullname:this.userInfo.username) + " Create group",
              created: new Date().getTime()
            }]
          }
          //6. user create newroom
          this.socket.emit('client-create-new-room',roomNew);  
      }

      resolve({next:'CLOSE'});
    })
  }.bind(this);

  
  callbackChatRoom = function(res){
    return new Promise((resolve,reject)=>{
      resolve();
    })
  }.bind(this);


  onClickItem(room){
    //console.log('goto room',room);
    this.navCtrl.push(ChattingPage, {
                        parent:this,
                        socket: this.socket,
                        user: this.userInfo,
                        token: this.token,
                        callback: this.callbackChatRoom,
                        room: room
                      })
  }


  onClickItemPrivate(socketId){
    this.navCtrl.push(ChattingPrivatePage, {
      parent:this,
      socket: this.socket,
      contacts: this.contacts,
      socket_id: socketId,
      my_socket: this.mySocket
    })
  }

  //onclick....
  onClickHeader(btn){
    if (btn.next==='ADD'){
      
    }
  }

  // Su dung slide Pages
  //--------------------------
  /**
   * Thay đổi kiểu bấm nút mở lệnh trên item sliding
   * @param slidingItem 
   * @param item 
   */
  openSwipeOptions(slidingItem: ItemSliding, item: Item, room:any ){
    room.visible = !room.visible;
    if (room.visible){
      let _offset =  "translate3d(-168px, 0px, 0px)"
      slidingItem.setElementClass("active-sliding", true);
      slidingItem.setElementClass("active-slide", true);
      slidingItem.setElementClass("active-options-right", true);
      item.setElementStyle("transform",_offset); 
    }else{
      this.closeSwipeOptions(slidingItem);
    }
  }

  /**
   * Thay đổi cách bấm nút đóng lệnh bằng nút trên item sliding
   * @param slidingItem 
   */
  closeSwipeOptions(slidingItem: ItemSliding){
    slidingItem.close();
    slidingItem.setElementClass("active-sliding", false);
    slidingItem.setElementClass("active-slide", false);
    slidingItem.setElementClass("active-options-right", false);
  }

  onClickDetails(slidingItem: ItemSliding, room: any, func: number){
    this.closeSwipeOptions(slidingItem);

  }
  //----------- end of sliding

  openModal(form,data?:any) {
    this.modalCtrl.create(form, data).present();
  }


}