import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;
let latLng;
let infoWindow;
let curCircle;
let curCircleIcon;

@Component({
  selector: 'page-google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapPage {
  @ViewChild('map') mapElement: ElementRef;

  map: any;
  isMapLoaded:boolean = false;
  isShowCenter: boolean = true;
  isLocOK: boolean = false;
  className = "icon-center icon-blue";
  
  isSearch: boolean = false;
  shouldShowCancel: boolean = false;

  locationTracking: any;
  

  header = {
    title:"Ban do"
    ,search_bar:{hint:"tim gi",search_string:""}
    ,buttons:[
      {color:"primary", icon:"add", next:"ADD"}
      , {color:"primary", icon:"contacts", next:"FRIENDS"}
      , {color:"primary", icon:"notifications", next:"NOTIFY"
        , alerts:[
            "cuong.dq"
            ]
        }
      , {color:"royal", icon:"cog", next:"SETTINGS"}
    ]


  }

  commands = {
    fix:{
      right:true        //left/center/right
      , bottom:true    //top/middle/bottom
      , mini:true
      , actions:[
        {color:"light", icon:"locate", next:"CENTER"}
      ]
    }
    ,
    dynamic:{
        left:true       //left/center/right
      , middle:true     //top/middle/bottom
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

  constructor(private navCtrl: NavController
              ,private loadingCtrl: LoadingController
              ,private geoLocation: Geolocation
              ,private toastCtrl: ToastController
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
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
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
  getLocation() {
    this.stopTracking();
    this.geoLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 7000
    }).then((pos) => {
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
    }).catch((err) => {
      this.isLocOK = false;
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
                
        },
        err => {
              this.isLocOK = false;
            }
        )
  }

  stopTracking() {
      try { this.locationTracking.unsubscribe() } catch (e) { };
  }

  showLocation(loc){
    let loclatLng = {lat:loc.lat,lng:loc.lng};
    latLng = new google.maps.LatLng(loc.lat, loc.lng);

    if (this.isMapLoaded){
      //curMarker.setPosition(loclatLng);
      curCircleIcon.setCenter(loclatLng);
      curCircle.setCenter(loclatLng);
      curCircle.setRadius(loc.accuracy);
      //dua ban do ve vi tri trung tam
      this.map.setCenter(latLng);
    }

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
    console.log(this.header.search_bar.search_string);
  }

  onClickAction(btn){
    //console.log('click:',btn);
    if (btn.next==="CENTER"){
      this.getLocation();
      this.map.setCenter(latLng);
    }
  }

}
