import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';

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
  className = "icon-center icon-blue";

  commands = {

    fix:{
      top:true        //left/center/right
      , right:true    //top/middle/bottom
      , mini:true
      , actions:[
        {color:"dark", icon:"add", next:"ADD"}
        ,{color:"danger", icon:"cog", next:"SETTINGS"}
        ,{color:"secondary", name:"Tìm", next:"SEARCH"}
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
              ,private toastCtrl: ToastController
    ) {}

  ngOnInit() {
    
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

    //lay vi tri tracking


    loading.dismiss();
  }


  onClickAction(btn){
    console.log('click:',btn);
  }




}
