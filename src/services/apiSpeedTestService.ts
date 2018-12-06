
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';


var speedtestServer = 'https://cuongdq-speedtest.herokuapp.com';
var xhr = []; //tao da luong de truy cap server
var http;
var totLoaded;

@Injectable()
export class ApiSpeedTestService {
    private worker;
    constructor(private httpClient: HttpClient) {        
        http = httpClient;
    }
    //bien worker de truyen message giua cac thread voi nhau
    setWorker(worker){
        this.worker = worker;
    }
    
    //cac ham speedtest
    //1. Lay dia chi IP
    getISP(){
        this.postMessage({
            command:'report', //
            work:'get-ip', //lay dia chi ip cho toi
            status: false, //start
            startTime: new Date().getTime(),
            message: 'start'
          });
        return this.httpClient.get(speedtestServer+"/speedtest/get-ip")
               .toPromise()
               .then(data=>{
                this.postMessage({
                        command:'report', //
                        work:'get-ip', //lay dia chi ip cho toi
                        data: data, //da chuyen doi json roi nhe
                        status: true, //finish
                        endTime: new Date().getTime(),
                        message: 'success' //
                      });
                return data;
               })
    }

    //2. Test dowload
    download(){

        totLoaded = 0.0; // total number of loaded bytes
        let startT = new Date().getTime(); // timestamp when test was started
        let graceTimeDone = false; //set to true after the grace time is past
        let failed = false; // set to true if a stream fails
        let dlMultistream = 10; //so luong lay du lieu 
        let multistreamDelay =  300; //delay lay du lieu theo luong

        this.postMessage({
            command:'report', //
            work:'download', //lay dia chi ip cho toi
            status: false,
            startTime: startT,
            message: 'start'
          });

        for (let i = 0; i < dlMultistream; i++) {
            this.testStream(i, multistreamDelay * i)
        }  
        
        return this.httpClient.get(speedtestServer+"/speedtest/download") //them tham so goi 
        .toPromise()
        .then(data=>{
         this.postMessage({
            command:'report', //
            work:'download', //lay dia chi ip cho toi
            data: data,
            status: true, //finish
            startTime: startT,
            endTime: new Date().getTime(),
            message: 'success'
            });
            return data;
        })


    }


    testStream(i, delay){

        setTimeout(function(){
            console.log('vao vong lap thoi gian:')
            //tlog('dl test stream started ' + i + ' ' + delay)
            var prevLoaded = 0 // number of bytes loaded last time onprogress was called
            var req = new HttpRequest('GET', speedtestServer+"/speedtest/download",
                {reportProgress: true,
                 responseType:'arraybuffer'}); // 'arraybuffer' | 'blob' | 'json' | 'text'
            xhr[i] = req;
            
            http.request(req)
                .subscribe((event: HttpEvent<any>) => {
                switch (event.type) {
                  case HttpEventType.Sent:
                    console.log('Request sent!');
                    //this.getHttpEvent().next(event);
                    break;
                  case HttpEventType.ResponseHeader:
                    console.log('Response header received!');
                    //this.getHttpEvent().next(event);
                    break;
                  case HttpEventType.UploadProgress:
                    console.log('HttpEventType.UploadProgress!')
                    //this.getHttpEvent().next(event);
                    //const percentDone = Math.round(100 * event.loaded / event.total);
                    /* console.log(`Posting in progress! ${percentDone}% \n
                    Bytes being upload: ${event.loaded} \n
                    Total no. of bytes to upload: ${event.total}`); */
                    break;
                  case HttpEventType.DownloadProgress:
                    console.log('HttpEventType.DownloadProgress!')
                    //tlog('dl stream progress event ' + i + ' ' + event.loaded)
                    // progress event, add number of new loaded bytes to totLoaded
                    var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                    if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                        console.log('Loi so lieu???')
                        return;
                    }
                    totLoaded += loadDiff;
                    prevLoaded = event.loaded;
                    console.log(totLoaded);
                    break;
                    
                  case HttpEventType.Response:
                    console.log('HttpEventType.Response')
                    console.log('finish!', event.body);
                    /* this.getHttpEvent().next(event);
                    resolve(event); */
                    /* tlog('dl stream finished ' + i)
                    try { xhr[i].abort() } catch (e) { } // reset the stream data to empty ram
                    testStream(i, 0) */
                    break;
                }
              }, err => {
                console.log(err);
              });

          }.bind(this), 1 + delay);
    }

    postMessage(object){
        if (this.worker){
            this.worker.postMessage(JSON.stringify(object));
        }
    }
}