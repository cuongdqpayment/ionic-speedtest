
import { Geolocation } from '@ionic-native/geolocation';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiLocationService {

    public locationTracking;
    public currenLocation;

    constructor(private geoLocation: Geolocation) { }

    getCurrentLocation(){
        //chuyen doi vi tri tra ve vi tri hien tai theo thuat toan
        if (this.currenLocation){
            return new Promise((resolve,reject)=>{
                resolve(this.currenLocation)
            })
        }else{
            return this.init();
        }
    }

    init() {
        return new Promise((resolve,reject)=>{
            this.stopTracking();
            this.geoLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 7000
            }).then((pos) => {
                //console.log('current get ok');
                this.currenLocation = pos;
                this.currenLocation.timereturn = new Date().getTime(); 
                this.startTracking();
                resolve(this.currenLocation);
            }).catch((err) => {
                console.log('error get current',err);
                this.startTracking();
                reject(err);
            });       
        })

    }
    //Theo dõi thay đổi vị trí
    startTracking() {
        this.locationTracking = this.geoLocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 3000
        })
            .subscribe((pos) => {

                //console.log('tracking get Ok');
                this.currenLocation = pos;
                this.currenLocation.timereturn = new Date().getTime(); //thoi gian tinh ms hien tai
            },
                err => {
                    // console.log('error get tracking');
                    console.log(err);
                }
            )
    }

    stopTracking() {
        try { this.locationTracking.unsubscribe() } catch (e) { };
    }
}