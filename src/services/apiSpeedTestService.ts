
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


var speedtestServer = 'https://cuongdq-speedtest.herokuapp.com';

@Injectable()
export class ApiSpeedTestService {
    private worker;
    constructor(private httpClient: HttpClient) {        
    }
    //bien worker de truyen message giua cac thread voi nhau
    setWorker(worker){
        this.worker = worker;
    }
    
    //cac ham speedtest
    //1. Lay dia chi IP
    getISP(){
        return this.httpClient.get(speedtestServer+"/speedtest/get-ip")
               .toPromise()
               .then(data=>{
                if (this.worker){
                    this.worker.postMessage(JSON.stringify({
                        command:'report', //
                        work:'get-ip', //lay dia chi ip cho toi
                        data: data,
                        status: true,
                        message: 'Success'
                      }));
                }
                   return data;
               })
    }

    //2. Test dowload
    download(){
        return this.httpClient.get(speedtestServer+"/speedtest/download") //them tham so goi 
        .toPromise()
        .then(data=>{
            if (this.worker){
                this.worker.postMessage(JSON.stringify({
                    command:'report', //
                    work:'download', //lay dia chi ip cho toi
                    data: data,
                    status: true,
                    message: 'Success'
                  }));
            }
            return data;
        })
        .catch(err=>{
            console.log(err);
        })
    }

}