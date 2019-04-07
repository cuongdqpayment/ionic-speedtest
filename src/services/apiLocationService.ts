
/**
 * dich vu nay lay va kiem tra thiet bi cordova
 * gom:
 * network
 * device
 * sim
 * platform
 * toa do
 */

import { Geolocation } from '@ionic-native/geolocation';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { Network } from '@ionic-native/network';
import { Sim } from '@ionic-native/sim';

@Injectable()
export class ApiLocationService {

    locationTracking: any;
    currenLocation: any;

    constructor(
        private sim: Sim,
        private network: Network,
        private device: Device,
        private geoLocation: Geolocation,
        private platform: Platform
        ) { }



    getPlatform(){
        console.log('Platform', this.platform);
    }

    getDevice(){
        console.log('Device ', this.device);
    }

    getNetwork(){
        console.log('network', this.network);
    }

    getSim(){
        this.sim.getSimInfo()
        .then(data=>{
            console.log('sim',data);
        })
        .catch(err=>{
            console.log('sim',err);
        })
    }



        
    getCurrentLocation(){
        this.stopTracking();
        this.startTracking();
        return this.currenLocation;
    }

    initPosition() {
        return this.geoLocation.getCurrentPosition()
        .then(pos => {
                console.log('debug',pos);
                this.currenLocation = pos;
                return {lat:pos.coords.latitude,
                        lon:pos.coords.longitude,
                        timestamp:pos.timestamp,
                        time_tracking: new Date().getTime()
                        };
                    })
        .catch((err) => {
                console.log('error get current loc',err);
                throw err;
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
                this.currenLocation = { lat:pos.coords.latitude,
                                        lon:pos.coords.longitude,
                                        timestamp:pos.timestamp,
                                        time_tracking: new Date().getTime()
                                      }
                    
            },
                err => {
                    console.log('error get tracking loc',err);
                }
            )
    }
    stopTracking() {
        try { this.locationTracking.unsubscribe() } catch (e) { };
    }
}