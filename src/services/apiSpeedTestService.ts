
import { HttpClient, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';


var speedtestServer = 'https://cuongdq-speedtest.herokuapp.com';
var xhr = []; //tao da luong de truy cap server
var totLoaded = 0.0;
var http;

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

        //totLoaded = 0.0; // total number of loaded bytes
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

    
    postMessage(object){
        if (this.worker){
            this.worker.postMessage(JSON.stringify(object));
        }
    }


    downloadOne(i,step){
        return new Promise((resolve,reject)=>{
            var prevLoaded = 0 // number of bytes loaded last time onprogress was called
            var req = new HttpRequest('GET', speedtestServer+"/speedtest/download",
                {reportProgress: true,
                    responseType:'arraybuffer'}); // 'arraybuffer' | 'blob' | 'json' | 'text'
            xhr[i] = req; //thread i
            http.request(req)
                .subscribe((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.Sent:
                        console.log('1. Request sent!');
                        //1. console.log(event); //tra ve {type:0}
                        //this.getHttpEvent().next(event);
                        break;
                    case HttpEventType.ResponseHeader:
                        console.log('2. Response header received!');
                        //console.log(event); // tra ve thong tin cua header
                        //this.getHttpEvent().next(event);
                        break;
                    case HttpEventType.UploadProgress:
                        //truong hop download nen khong co cai nay
                        console.log('HttpEventType.UploadProgress!')
                        console.log(event);
                        //this.getHttpEvent().next(event);
                        //const percentDone = Math.round(100 * event.loaded / event.total);
                        /* console.log(`Posting in progress! ${percentDone}% \n
                        Bytes being upload: ${event.loaded} \n
                        Total no. of bytes to upload: ${event.total}`); */
                        break;
                    case HttpEventType.DownloadProgress:
                        //lay tong so byte nhan duoc
                        //console.log('3. HttpEventType.DownloadProgress!');
                        //console.log(event); // event.type va event.loaded (so byte loaded)
                        var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                        if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                            reject({
                                code:403,
                                message:'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'});
                        }
                        totLoaded += loadDiff;
                        prevLoaded = event.loaded;
                        //console.log(totLoaded);
                        break;
                        
                    case HttpEventType.Response:
                            console.log('4. HttpEventType.Response')
                            //console.log(event); //HttpResponse co body, header ...
                            //console.log('finish!', event.body); //toan du lieu nhan duoc
                            /* this.getHttpEvent().next(event);
                            /* tlog('dl stream finished ' + i)
                            try { xhr[i].abort() } catch (e) { } // reset the stream data to empty ram
                            testStream(i, 0) */
                            resolve(totLoaded); //da xong mot step tren mot thread tra ve so luong dowload
                            break;
                }
                }, err => {
                    console.log(err);
                    reject(err);
                });

        })
    }

    multiDownload(){
        totLoaded = 0.0;
        var maxStep = 1; //moi luong chay qua 5 buoc thi dung lai
        var maxTime = 100; //5s //qua thoi gian thi dung lai

        var maxThread = 1; //so luong chay 10
        var delayThread = 300;
        var oneThreadFuntion = this.downloadOne;


        let startT = new Date().getTime(); // timestamp when test was started
        /* let graceTimeDone = false; //set to true after the grace time is past
        let failed = false; // set to true if a stream fails
        let dlMultistream = 10; //so luong lay du lieu 
        let multistreamDelay =  300; //delay lay du lieu theo luong */

        this.postMessage({
            command:'report', //
            work:'download', //lay dia chi ip cho toi
            status: false,
            startTime: startT,
            message: 'start'
          });

        return new Promise((resolve,reject)=>{

            var startT = new Date().getTime(); // timestamp when test was started
        
            var testStream = function (i, delay, step , doneThread) {
                setTimeout(function () {
                    let timeout = new Date().getTime()-startT;
        
                    console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);

                    oneThreadFuntion(i,step)
                    .then(total=>{
                        console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        console.log(total);
                        if (timeout<maxTime&&step<maxStep) { //dieu kien nao den truoc 
                            console.log("progress " + step);
                            //resolve('progress ' + i);
                            testStream(i, 0, step + 1, doneThread ); //goi tiep bien a
                        } else {
                            console.log("finish IN thread: " + i);
                            //console.log(doneThread);
                            if (doneThread) doneThread(i) //bao xong thread so i
                            //resolve(total); //ket thuc thread voi n step mang tong so tra ve
                        }
                    }); //goi ham dowload thread i va step 

                }.bind(this), 1 + delay)
            }.bind(this);
            
            
            
            var countThreadDone = 0;
            var callBackThread = function(threadId){
                                        console.log("finish thread CALLBACK: " + threadId);
                                        countThreadDone++;
                                        if (countThreadDone==maxThread){
                                            console.log('XONG ROI NHE:' + countThreadDone);
                                            resolve('XONG!');
                                        }
                                    }
        
            for (var j=0;j<maxThread;j++){
                console.log("Thread " + j);
                testStream(j, j * delayThread, 1, callBackThread); //chay tu step 1
            }  
        })
        .then(data=>{
            //Tra ve chu XONG!
        //thong bao xu ly xong
        this.postMessage({
            command:'report', //
            work:'download', //
            data: data,
            status: true, //finish
            startTime: startT,
            endTime: new Date().getTime(),
            message: 'success'
            });
            return data; //tra ve phien sau 
        });
    }
}