import { LoadingController, ToastController, Events, AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';

import { Socket, SocketIoConfig } from 'ng-socket-io';

import { ApiStorageService } from './apiStorageService';
import { ApiAuthService } from './apiAuthService';
import { Observable } from 'rxjs/Observable';
import { ApiLocationService } from './apiLocationService';
import { ApiMapService } from './apiMapService';

@Injectable()
export class ApiChatService {

  userInfo: any;
  token: any;
  socket: Socket;

  configSocketIo: SocketIoConfig;


  mySocket: any;
  last_time: number = Date.now();

  users = []        //users online
  rooms = [];       //room online


  chatRooms:any; // ban dau la khong co room, neu login roi thi moi co room
  chatFriends:any;
  chatNewFriends:any;


  constructor(
    private apiAuth: ApiAuthService,
    private apiStorage: ApiStorageService,
    private events: Events,
    private apiLocation: ApiLocationService,
    private apiMap: ApiMapService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController

  ) { }


  getSocket(){
    return this.socket;
  }

  /**
   * Phuc vu kiem tra da login chua?
   * co ban moi khong?
   * co ban khong?
   */
  getRoomsFriends(){
    return {
              my_socket: this.mySocket,        
              rooms: this.chatRooms,
              friends: this.chatFriends, 
              new_friends: this.chatNewFriends
           };
  }

  chatInitSuccessfull(){
    //tu cac rooms da co, co danh sach ban be
    //neu co ban moi chua co room thi tra ve 
    //room, new friend (de co)
    this.events.publish('event-chat-init-room'
    , {
        my_socket: this.mySocket,
        rooms: this.chatRooms,
        friends: this.chatFriends, 
        new_friends: this.chatNewFriends
      }
    );

    //4. chat - join rooms
    //neu chua co room thi mat dinh co 1 room ca nhan
    //{roomid:{ai do}}
    this.socket.emit('client-join-rooms'
    , {
      rooms: this.chatRooms
    });
  }

  async initChatting(token, userInfo, friends) {

    //dich vu dinh vi lay toa do va dia chi khoi tao chat
    let location = await this.apiLocation.getCurrentLocation();
    let address = "unknow";
    if (location.error){
      alert("Bạn phải cho phép dịch vụ định vị để sử dụng hệ thống này!");
      //this.presentAlert("Bạn phải cho phép dịch vụ định vị để sử dụng hệ thống này!");
      //await this.apiLocation.delay(5000);
      location = await this.apiLocation.getCurrentLocation();
    }

    if (!location.error){
      address = await this.apiMap.getAddressFromLatlng(location.lat+","+location.lng)
    }
    
    this.token = token;
    this.userInfo = userInfo;

    this.configSocketIo = {
      url: ApiStorageService.chatServer 
      + '?token=' + this.token
      + (!location.error?('&latlng=' + location.lat+","+location.lng
      + '&accuracy=' + location.accuracy
      + '&timestamp=' + location.timestamp
      + '&address=' + address):"")
      , options: {
        path: '/media/socket.io'
        , pingInterval: 20000
        , timeout: 60000
        , reconnectionDelay: 30000
        , reconnectionDelayMax: 60000
      }
    };

    //-->1. chat - client -->open
    this.socket = new Socket(this.configSocketIo);
    //this.apiStorage.deleteUserRooms(this.userInfo)
    this.chatRooms = this.apiStorage.getUserRooms(this.userInfo);

    //danh sach duoc nguoi dung ket ban, tim kiem, chu dong, trong chuc nang friends
    this.chatFriends = this.apiStorage.getUserChatFriends(this.userInfo);

    //tao cac kenh lien lac default
    //va cac kenh lien lac theo ban be trong danh ba
    //console.log('contact friends:',friends);
    if (friends){
      //co ban be tim thay trong danh ba tu dong yeu cau ket ban
      friends.forEach(el => {
        let index = this.chatFriends?this.chatFriends.findIndex(x => x.username === el.username):-1;
        if (index>=0){
          this.chatFriends.splice(index, 1, el);
        }else{
          if (!this.chatNewFriends) this.chatNewFriends=[];
          if (this.userInfo.username !== el.username) this.chatNewFriends.push(el); 
          //them ban moi ket ban, minh phai xac nhan thi no moi ket ban
        }         
      });
    }else{
      //khong co danh sach ban be trong danh ba
    }
    
    //lang nghe vi tri thay doi de ghi nhan vi tri cua 
    //neu yeu cau tracking thi lang nghe su kien nay nhe
    /* 
    this.apiLocation.startTracking();
    this.events.subscribe("event-location-changed",(data)=>{
      //console.log('location change',data);
      //vi tri co thay doi, gui cho server biet vi tri thay doi nhe
    }) 
    */

   /* console.log('location:',{
                          lat: location.lat,
                          lng: location.lng,
                          accuracy: location.accuracy,
                          timestamp: location.timestamp,
                          address: address
                        }); */

    /* //gui vi tri thong bao cho sessions
    if (!location.error){
    this.socket.emit('client-send-location'
            , {
              lat: location.lat,
              lng: location.lng,
              accuracy: location.accuracy,
              timestamp: location.timestamp,
              address: address
            });
    } */

    /* 
    //room demo
    if (this.userInfo && this.chatRooms.length === 0 && this.userInfo.username === '903500888') {
      this.chatRooms = [
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
    
    */

    //-->1.chat - client received welcome
    this.getMessages()
      .subscribe(data => {
        let msg;
        msg = data;
        
        //** ****************** */
        //console.log('send, message', msg);
        
        if (msg.step == 'INIT') {
          //socketid,user,sockets
          this.mySocket = msg.your_socket;
          //send event INIT OK
          this.chatInitSuccessfull();
          
        }

        //danh sach user dang online
        //va socket cua no
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

          let chatRooms = []; //reset
          this.rooms.forEach(room => {
            let users = [];
            room.users.forEach(user => {
              for (let uname in user) {
                users.push(uname);
              }
            });

            if (room.id.indexOf('#') > 0) {
              chatRooms.push({
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
          this.apiStorage.saveUserRooms(this.userInfo, chatRooms);

          this.events.publish('event-main-received-rooms', this.rooms);
        }

        if (msg.step == 'ACCEPTED') {
          //5.1 + 6.2 accepted room

          //this.chatRooms
          let chatRooms = this.apiStorage.getUserRooms(this.userInfo);

          if (msg.room) {

            this.rooms.push(msg.room);

            let users = [];
            msg.room.users.forEach(user => {
              for (let uname in user) {
                users.push(uname);
              }
            });

            chatRooms.push({
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
          this.apiStorage.saveUserRooms(this.userInfo, chatRooms);

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
          this.mySocket.sockets.unshift(msg.socket_id);
          //them user
          this.mySocket.users.unshift(msg.user);

        } else if (msg.step === 'END') {
          //x.2 chat
          let index = this.mySocket.sockets.findIndex(x=>x===msg.socket_id);
          if (index>=0){
            this.mySocket.sockets.splice(index, 1);
            //xoa user
            this.mySocket.users.splice(index, 1);
          }

        }
        //bao hieu cho toi co so luong socket dang thay doi
        //console.log('private, mysocket',msg, this.mySocket);
      });

    //3.1 chat - client received new user
    this.getNewUser()
      .subscribe(data => {
        let msg;
        msg = data;
        console.log('new user receive', msg);
        //luu trong contact de tham chieu nhanh, khong load lai cua server
        if (!this.users.find(user => user.username === msg.username)) {
          this.users.push({
            username: msg.username,
            name: msg.data ? msg.data.fullname : "no name",
            nickname: msg.data ? msg.data.nickname : "no nickname"
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


    //7. new private message
    this.getPrivateMessagesEmit()
    .subscribe(data => {
      let msg;
      msg = data;
      console.log('7. new private message:', msg);
      //msg.user.image = this.contacts[msg.user.username].image;
      //this.events.publish('event-receiving-message', roomMsg);
    });
    
    //7.1 new message
    this.getMessagesEmit()
      .subscribe(data => {
        let msg;
        msg = data;
        console.log('7.1 new message:', msg, this.rooms);
        //msg.user.image = this.contacts[msg.user.username].image;

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


  //emit....
  jointRooms() {
    this.socket.emit('client-joint-room'
      , {
        rooms: this.chatRooms,
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

  getPrivateMessagesEmit() {
    return new Observable(observer => {
      this.socket.on("server-emit-priate-message", (data) => {
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

  presentAlert(message) {
    this.alertCtrl.create({
      title: 'Alert',
      subTitle: 'For Administrator',
      message: message,
      buttons: ['OK']
    }).present();
  }

}