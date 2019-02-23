import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ToastController, ModalController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';
import { ApiMapService } from '../../services/apiMapService';
import { ApiStorageService } from '../../services/apiStorageService';

declare var google;
let latLng;
let infoWindow;
let curCircle;
let curCircleIcon;

var interval;

@Component({
  selector: 'page-google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapPage {
  @ViewChild('map') mapElement: ElementRef;

  map: any;
  isMapLoaded:boolean = false;
  isShowCenter: boolean = false;
  isLocOK: boolean = false;
  className = "icon-center size-md icon-blue";
  classFloatInfo = "text-center size-sm icon-green text-blur";
  
  isSearch: boolean = false;
  shouldShowCancel: boolean = false;

  locationTracking: any;

  //run auto tracking
  isRuningInterval:boolean = false;
  
  view:any = {
    header: {
      title:"Map"
      ,search_bar:{hint:"Tìm địa chỉ hoặc tọa độ", search_string:"", search_result:{}}
      ,buttons:[
         {color:"primary", icon:"notifications", next:"NOTIFY"
          , alerts:[
              "cuong.dq"
              ]
          }
        , {color:"bg-blue", icon:"cog", next:"SETTINGS"}
      ]
    }
    ,
    fix:{
      right:true        //left/center/right
      , bottom:true    //top/middle/bottom
      , mini:true
      , actions:[
        {color:"primary", icon:"navigate", next:"CENTER"}
        ,{color:"light", icon:"locate", next:"LOCATE"}
      ]
    }
    ,
    dynamic:{
        left:true       //left/center/right
      , bottom:true     //top/middle/bottom
      , mini:undefined  //true/undefined
      //icon:"md-share"//"arrow-dropright"//"arrow-dropdown"//"arrow-dropup"//"arrow-dropleft"
      , controler:{color:"danger", icon:"md-share"}   
      , directions: [
        {
          side:"top",
          actions: [
            {color:"bg-blue", icon:"cog", next:"SEARCH"}  
            //icon/name
            ,{color:"light", icon:"globe", next:"SEARCH"}
            ,{color:"secondary", name:"Trên", next:"SEARCH"}
          ]
        }
        ,
        {
          side:"bottom",
          actions: [
            {color:"bg-blue", icon:"cog", next:"SEARCH"}
            ,{color:"light", icon:"globe", next:"SEARCH"}
            ,{color:"danger", icon:"contacts", next:"SEARCH"}
            ,{color:"dark", name:"Dưới", next:"SEARCH"}
          ]
        }
        ,
        {
          side:"left",
          actions: [
            {color:"bg-blue", icon:"cog", next:"SEARCH"}
            ,{color:"dark", name:"Trái", next:"SEARCH"}
          ]
        }
        ,
        {
          side:"right",
          actions: [
            {color:"light", icon:"globe", next:"SEARCH"}
            ,{color:"danger", name:"Phải", next:"SEARCH"}
          ]
        }
      ]
    }
  }


  mapSettings = {
    zoom: 15
    ,type: google.maps.MapTypeId.ROADMAP
    ,auto_tracking:false
  }

  constructor(private navCtrl: NavController
              , private modalCtrl: ModalController
              , private loadingCtrl: LoadingController
              , private geoLocation: Geolocation
              , private apiMap: ApiMapService
              , private toastCtrl: ToastController
    ) {}

  ngOnInit() {
    //lay vi tri tracking
    this.getLocation();
  }

  ionViewDidLoad() {
    this.resetMap();
  }

  resetMap() {
    this.loadMap();
  }

  //load bảng đồ google map như web đã làm
  loadMap() {
    let loading = this.loadingCtrl.create({
      content: 'Loading Map...'
    });
    loading.present();

    let mapStyles = [{
      featureType: "poi",
      elementType: "labels",
      stylers: [{
        visibility: "off"
      }]
    }, {
      featureType: "transit",
      elementType: "labels",
      stylers: [{
        visibility: "off"
      }]
    }];

    latLng = new google.maps.LatLng(16.05, 108.2);

    let mapOptions = {
      center: latLng,
      zoom: this.mapSettings.zoom,
      mapTypeId: this.mapSettings.type,
      disableDefaultUI: true,
      styles: mapStyles
    };

    //lenh nay se load map lan dau tien luon nhe
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    
    curCircleIcon = new google.maps.Circle({
      strokeColor: '#ff0000',
      strokeOpacity: 3,
      strokeWeight: 5,
      fillColor: '#296ce8',
      fillOpacity: 1,
      map: this.map,
      center: latLng,
      radius: 20
    });


    //danh dau vung hien tai sai so
    curCircle = new google.maps.Circle({
      strokeColor: '#caeaf9',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#caeaf9',
      fillOpacity: 0.35,
      map: this.map,
      center: latLng,
      radius: 50
    });

    this.isMapLoaded = true;

    loading.dismiss();
  }

  //lấy vị trí hiện tại và theo dõi vị trí nếu có thay đổi
  getLocation(isCenter?:boolean) {
    this.stopTracking();
    this.geoLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 7000
    }).then((pos) => {
      if (pos.coords) {
        this.isLocOK = true;
        this.showLocation({ lat:pos.coords.latitude,
          lng:pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          heading: pos.coords.heading,
          timestamp:pos.timestamp,
          time_tracking: new Date().getTime()
        }, isCenter);
      } else {
        this.isLocOK = true;
      }
    }).catch((err) => {
      this.isLocOK = false;
      
      this.toastCtrl.create({
        message: "getCurrentPosition() err: " + err.code + " - " + err.message,
        duration: 5000
      }).present();

    });
    this.startTracking();
  }

  //Theo dõi thay đổi vị trí
  startTracking() {
    this.locationTracking = this.geoLocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 3000
      }
    )
        .subscribe((pos) => {
          if (pos.coords) {
            this.isLocOK = true;
            this.showLocation({ lat:pos.coords.latitude,
                                lng:pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                                speed: pos.coords.speed,
                                altitude: pos.coords.altitude,
                                altitudeAccuracy: pos.coords.altitudeAccuracy,
                                heading: pos.coords.heading,
                                timestamp:pos.timestamp,
                                time_tracking: new Date().getTime()
                              });
          } else {
            this.isLocOK = true;
          }
                
        },
        err => {
              this.isLocOK = false;
              this.toastCtrl.create({
                message: "watchPosition() err: " + err.code + " - " + err.message,
                duration: 5000
              }).present();
            }
        )
  }

  stopTracking() {
      try { this.locationTracking.unsubscribe() } catch (e) { };
  }

  showLocation(loc:any,isCenter?:boolean){
    let loclatLng = {lat:loc.lat,lng:loc.lng};
    latLng = new google.maps.LatLng(loc.lat, loc.lng);

    //neu KC oldLocation va newLocation >=100m 
    //ma tu dong tim dia chi thi - tim dia chi va view dia chi cho nguoi dung

    if (this.isMapLoaded){
      //curMarker.setPosition(loclatLng);
      curCircleIcon.setCenter(loclatLng);
      curCircle.setCenter(loclatLng);
      curCircle.setRadius(loc.accuracy);
      //dua ban do ve vi tri trung tam
      if (this.mapSettings.auto_tracking || isCenter) {
        
        this.map.setCenter(latLng);
      }
    }

  }

  //Su dung search
  //---------------------
  goSearch(){
    this.isSearch = true;
  }

  searchEnter(){
    this.apiMap.getLatlngFromAddress(this.view.header.search_bar.search_string)
    .then(data=>{
      //share ? popup temporary, ???
      if (data.status === 'OK' && data.results && data.results.length>0){
        let addresses = []
        data.results.forEach(el => {
          addresses.push({address: el.formatted_address, lat: el.geometry.location.lat, lng: el.geometry.location.lng})
        });
        //console.log('data',addresses);
        if (addresses.length>=1){
          this.view.header.search_bar
          .search_result = {
                          lat: addresses[0].lat,
                          lng: addresses[0].lng,
                          address: addresses[0].address
                        }
          this.map.setCenter(new google.maps.LatLng(addresses[0].lat, addresses[0].lng));
          
          this.showCenterMode();

        }
      }
    })
    .catch(err=>{
      console.log('err',err);

    });

    this.view.header.search_bar.search_string = '';
    this.isSearch = false;
  }

  searchEnterEsc(){
    this.isSearch = false;
  }

  onInput(e){
    //xu ly filter
    //console.log(this.view.header.search_bar.search_string);
  }

  //thoi gian interval
  startStopInterval() {
    this.isRuningInterval = !this.isRuningInterval;
    this.mapSettings.auto_tracking = this.isRuningInterval;

    this.view.fix.actions.find(x=>x.next==="LOCATE").color=this.isRuningInterval?"danger":"light";
    if (this.isRuningInterval){
        this.autoGetLocation();
    }else{
      clearInterval(interval);
    }
  }

  autoGetLocation(){
    interval = setInterval(function () {
      this.getLocation() //
    }.bind(this), 3000);   //cu 3000ms thi lay vi tri mot lan
  }


  ///////////////////////////////////
  //drag & drop

  startStopShowCenter(){
    this.isShowCenter = !this.isShowCenter;
    this.view.fix.actions.find(x=>x.next==="CENTER").color = this.isShowCenter?"danger":"primary";
    if (this.isShowCenter){
      this.showCenterMode();
    } else{
      this.clearDrag();
    }
  }

  /**
   * 
   * @param isEnd 
   * diem cuoi hay diem dau
   */
  showCenterMode(isEnd?:boolean) {
    
    google.maps.event.addListener(this.map, 'dragend', () => this.mapDragend());
  
    if (!isEnd) {
      this.className = "icon-center size-md icon-blue";
      this.classFloatInfo = "text-center size-sm icon-green text-blur";
    } else {
      this.className = "icon-center size-md icon-red";
      this.classFloatInfo = "text-center size-sm icon-red text-blur";
    }

    //thay doi nut hanh dong
    this.view.dynamic.directions = [
                {
                  side:"right",
                  actions: [
                    {color:"secondary", icon:"share-alt", url: ApiStorageService.mapServer + "/share-point", next:"SHARE"}
                    ,{color:"danger", icon:"send", url: ApiStorageService.mapServer + "/live-user", next:"LIVE"}
                    ,{color:"light", icon:"archive", next:"SAVE"}
                  ]
                }
              ];
  }

  mapDragend() {
    if (this.map.getCenter()) {
      this.view.header.search_bar.search_result = {
        lat: this.map.getCenter().lat(),
        lng: this.map.getCenter().lng(),
        address: "searching..."
      }

      this.apiMap.getAddressFromLatlng(this.view.header.search_bar.search_result.lat + "," + this.view.header.search_bar.search_result.lng)
        .then(data => {
          if (data.status === 'OK' && data.results && data.results.length>0){
            this.view.header.search_bar.search_result.address = data.results[0].formatted_address;
          }
        })
        .catch(err => {
          this.toastCtrl.create({
            message: "Err getAddressFromLatlng: " + JSON.stringify(err),
            duration: 5000,
            position: 'bottom'
          }).present();
        })
        ;
    }
  }

  clearDrag() {
      google.maps.event.clearListeners(this.map, 'dragend');
  }
  // end drag
  ///////////////////////////////////


  callbackFunction = function(res){
    return new Promise((resolve, reject) => {
      
      this.mapSettings.type = res.data.type;
      this.mapSettings.zoom = res.data.zoom;
      this.mapSettings.auto_tracking = res.data.auto_tracking;

      this.map.setMapTypeId(this.mapSettings.type);
      this.map.setZoom(this.mapSettings.zoom);
      if (this.mapSettings.auto_tracking){
        if (!this.isRuningInterval){
          this.isRuningInterval = true;
          this.view.fix.actions.find(x=>x.next==="LOCATE").color="danger";
          this.autoGetLocation();
        }
      }else{
        if (this.isRuningInterval){
          this.isRuningInterval = false;
          this.view.fix.actions.find(x=>x.next==="LOCATE").color="light";
          clearInterval(interval);
        }
      }
      resolve({next:"CLOSE"});
    })
  }.bind(this);

  openModal(data) {
    let modal = this.modalCtrl.create(DynamicFormWebPage, data);
    modal.present();
  }

  /////////////////////////////
  //thuc hien cac nut lenh theo khau lenh
  onClickAction(btn){
    //console.log('click:',btn);
    if (btn.next==="CENTER"){
      this.startStopShowCenter();
    }
    
    if (btn.next==="TRACKING"){
      this.startStopInterval();
    }
    
    if (btn.next==="LOCATE"){
      this.getLocation(true);
    }
    

    if (btn.next ==="SETTINGS"){

      let formSetting = {
        title: "Settings"
        , items: [
          {  name: "Lựa chọn kiểu hiển thị", color:"primary", type: "title"}
    
          , { key: "type", name: "Kiểu bản đồ", color:"primary", type: "select", value: this.mapSettings.type, options: [
                { name: "Hành chính", value: google.maps.MapTypeId.ROADMAP }
                , { name: "Địa hình", value: google.maps.MapTypeId.TERRAIN }
                , { name: "Vệ tinh", value: google.maps.MapTypeId.HYBRID }
              ] 
            }
          , { key: "zoom", name: "Mức hiển thị", color:"primary", type: "range", icon: "globe", value: this.mapSettings.zoom, min: 1, max: 20 }
          , { key: "auto_tracking", name: "Tự động tracking?", color:"danger", value: this.mapSettings.auto_tracking, icon: "locate", type: "toggle" }
          , 
          { 
              type: "button"
            ,  color:"primary"
            , options: [
              { name: "Bỏ qua", next: "CLOSE" }
              , { name: "Chọn", next: "CALLBACK"}
            ]
          }]
      }


      let form = {
        callback: this.callbackFunction,
        step: 'map-settings',
        form: formSetting
      };
      this.openModal(form);
    }

  }
}
