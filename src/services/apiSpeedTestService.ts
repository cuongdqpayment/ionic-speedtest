
import { HttpClient, HttpRequest, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';


var speedtestServer = 'https://cuongdq-speedtest.herokuapp.com';
var metter;
var xhr = null; //tao da luong de truy cap server
var interval = null;
var totLoaded = 0.0;
var progress = 0.0;
var garbagePhp_chunkSize = 20;
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

    //ham trao doi du lieu voi worker 
    postMessage(object){
        if (this.worker){
            this.worker.postMessage(JSON.stringify(object));
        }
    }
    
    //tham tham so cho url ? hoac & theo bien
    //url_sep (url) { return url.match(/\?/) ? '&' : '?'; }

    //clear Request khi test vuot qua thoi gian 
    clearRequests() {
        //tlog('stopping pending XHRs')
        //console.log('xoa request di:');
        if (xhr) {
          for (var i = 0; i < xhr.length; i++) {
            try { xhr[i].onprogress = null; xhr[i].onload = null; xhr[i].onerror = null } catch (e) {}
            try { xhr[i].upload.onprogress = null; xhr[i].upload.onload = null; xhr[i].upload.onerror = null } catch (e) {}
            try { xhr[i].abort() } catch (e) { }
            try { xhr[i].cancel() } catch (e) { }
            try { xhr[i].unsubscribe()} catch (e) {}
            try { delete (xhr[i]) } catch (e) {}
          }
          xhr = null;
        }
        clearInterval(interval); //xoa luong thoi gian de chay cua no
      }
    ///////

    //cac ham speedtest
    //1. Lay dia chi IP
    getISP(){

        progress = 0;
        metter = '...';
        var startT = new Date().getTime(); // timestamp when test was started
        var durationGetIpInSecond = 10;
        
        this.postMessage({
            command:'report', //
            work:'get-ip', //lay dia chi ip cho toi
            status: false, //start
            startTime: new Date().getTime(),
            message: 'start'
          });

        interval = setInterval(function(){
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            progress = passTime / (durationGetIpInSecond * 1000);
            
            this.postMessage({
                command:'progress', //
                work:'download', //
                data: {
                    dlProgress :  progress, //Tien trinh chay
                    dlStatus : metter
                }, //chuoi tien do  dd
                status: false, //finish
                startTime: startT,
                reportTime: new Date().getTime(),
                message: 'continue' //tiep tuc cho toi
                });
        
            
            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this),200); //cu 200ms thi thong bao ket qua cho metter

        return this.httpClient.get(
                speedtestServer+"/speedtest/get-ip"
                )
               .toPromise()
               .then(data=>{
                
                clearInterval(interval);//reset interval

                let result;
                result = data;
                result.dlProgress = 1;
                result.dlStatus = progress * 100;

                this.postMessage({
                        command:'report', //
                        work:'get-ip', //lay dia chi ip cho toi
                        data: result, //da chuyen doi json roi nhe
                        status: true, //finish
                        endTime: new Date().getTime(),
                        message: 'success' //
                      });

                return data;
               })
    }

    //2. Test dowload
    /**
     * 10 thread x 20 step
     */
    multiDownload(){
        totLoaded = 0.0;
        progress = 0;
        metter = '...';
        xhr = []; //bat dau tao multithread
        var maxThread = 10; //so luong chay 10 thread
        var maxStep = 20; //moi luong chay qua 20 step
        var durationTestInSecond = 15 //so giay chay test thu
        var maxTime_ms = (durationTestInSecond/2) * 1000; //thoi gian thu 10 s hoac 20 buoc

        var delayThread = 300;
        //var oneThreadFuntion = this.downloadOne; //gan ham de chay download

        var overheadCompensationFactor = 1.06; //can be changed to compensatie for transport overhead. (see doc.md for some other values)
        var useMebibits: false;

        var graceTimeDone =false ; //bo thoi gian parse TCP de tinh toc do cho chinh xac 
        var time_dlGraceTime = 1.5 //time to wait in seconds before actually measuring dl speed (wait for TCP window to increase)
        var startT = new Date().getTime(); // timestamp when test was started
        

        this.postMessage({
            command:'report', //
            work:'download', //lay dia chi ip cho toi
            status: false,
            startTime: startT,
            message: 'start'
          });

        interval = setInterval(function(){
            
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            if (graceTimeDone) progress = passTime / (durationTestInSecond * 1000);
            //reset thoi gian bat dau tinh toan toc doc
            if (!graceTimeDone) {
                if (passTime > 1000 * time_dlGraceTime) {
                  if (totLoaded > 0) { // if the connection is so slow that we didn't get a single chunk yet, do not reset
                    startT = new Date().getTime(); //bat dau tinh thoi gian download
                    totLoaded = 0.0;               //reset bien lai
                  }
                  graceTimeDone = true;
                }
            } else {
                var speed = totLoaded / (passTime / 1000.0)
                metter = ((speed * 8 * overheadCompensationFactor) / (useMebibits ? 1048576 : 1000000)).toFixed(2) // speed is multiplied by 8 to go from bytes to bits, overhead compensation is applied, then everything is divided by 1048576 or 1000000 to go to megabits/mebibits
                //neu qua thoi gian thi reset cai interval nay di
                
                //muon reset tien trinh dang dowload ve thi sao????
                //lay totloaded thoi gian troi qua de tinh toan
                //dua ve qua trinh
                this.postMessage({
                    command:'progress', //
                    work:'download', //
                    data: {
                        dlProgress :  progress, //Tien trinh chay
                        dlStatus : metter
                    }, //chuoi tien do  dd
                    status: false, //finish
                    startTime: startT,
                    reportTime: new Date().getTime(),
                    message: 'continue' //tiep tuc cho toi
                    });
            
                if (progress>=1){
                    //truong hop vuot qua thoi gian cho phep roi ma van chua ket thuc
                    //bao ket thuc roi reset connection
                    console.log('SLOW NETWORK');
                    //send interupt
                     //xem lai cac ham xoa request trong angular
                    this.clearRequests();
                }
            }

            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this),200); //cu 200ms thi thong bao ket qua cho metter

        return new Promise((resolve,reject)=>{

            startT = new Date().getTime(); // timestamp when test was started
        
            var testStream = function (i, delay, step , doneThread) {
                //chay 1 lan delay
                setTimeout(function () {
                    let timeout = new Date().getTime()-startT;
                    
                    //console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);
                    
                    this.downloadOne(i,step) //tien trinh nay chay rat cham neu mang cham
                    .then(total=>{
                        /* console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        console.log(total); */
                        if (timeout<maxTime_ms&&step<maxStep) { //dieu kien nao den truoc 
                            //console.log("progress " + step);
                            //resolve('progress ' + i);
                            try { xhr[i].unsubcriber() } catch (e) { } // reset the stream data to empty ram
                            testStream(i, 0, step + 1, doneThread ); //goi tiep bien a
                        } else {
                            //console.log("finish IN thread: " + i);
                            //console.log(doneThread);
                            if (doneThread) doneThread(i) //bao xong thread so i
                            //resolve(total); //ket thuc thread voi n step mang tong so tra ve
                        }
                    })
                    .catch(err=>{
                        //truong hop da reset ket qua gui ve sau thi
                        //console.log(err);
                        if (doneThread) doneThread(i)
                    }); //goi ham dowload thread i va step 

                }.bind(this), 1 + delay)
            }.bind(this);
            
            var countThreadDone = 0;
            var callBackThread = function(threadId){
                                        //console.log("finish thread CALLBACK: " + threadId);
                                        countThreadDone++;
                                        if (countThreadDone==maxThread){
                                            console.log('XONG ROI NHE:' + countThreadDone);
                                            resolve(totLoaded); //tra ve tong so luong bit nhan duoc
                                        }
                                    }
        
            for (var j=0;j<maxThread;j++){
                //console.log("Thread " + j);
                testStream(j, j * delayThread, 1, callBackThread); //chay tu step 1
            }  
        })
        .then(data=>{
                //reset interval clear no di
                clearInterval(interval);
                //Tra ve chu XONG!
                this.postMessage({
                    command:'progress', //
                    work:'download', //
                    data: {
                        dlProgress :  1, //Tien trinh chay
                        dlStatus : metter
                    }, //chuoi tien do  dd
                    status: false, //finish
                    startTime: startT,
                    reportTime: new Date().getTime(),
                    message: 'finish' //tiep tuc cho toi
                    });

                //thong bao xu ly xong
                this.postMessage({
                    command:'report', //
                    work:'download', //
                    data: {
                        dlProgress :  1, //Tien trinh chay xong
                        dlStatus : metter,
                        totLoaded: data
                    },
                    status: true, //finish
                    startTime: startT,
                    endTime: new Date().getTime(),
                    message: 'success'
                    });

                return 'DOWNLOAD STOP!'; //tra ve cho phien goi no
        });

    }

    downloadOne(i,step){
        return new Promise((resolve,reject)=>{
            var prevLoaded = 0 // number of bytes loaded last time onprogress was called

            var req = new HttpRequest('GET', 
                speedtestServer+"/speedtest/download?" + 'r=' + Math.random(),
                //neu lay server khac phai khai bao cors control 
                //"http://10.151.54.84:9235/garbage.php?" + 'r=' + Math.random() + '&ckSize=' + garbagePhp_chunkSize,
                { 
                    reportProgress: true,
                    responseType:'arraybuffer'}); // 'arraybuffer' | 'blob' | 'json' | 'text'

            
            xhr[i] = http.request(req)
                         .subscribe((event: HttpEvent<any>) => {
                            switch (event.type) {
                                case HttpEventType.Sent:
                                    break;
                                case HttpEventType.ResponseHeader:
                                    break;
                                case HttpEventType.UploadProgress:
                                    //truong hop download nen khong co cai nay
                                    //console.log('HttpEventType.UploadProgress!')
                                    //console.log(event);
                                    //this.getHttpEvent().next(event);
                                    //const percentDone = Math.round(100 * event.loaded / event.total);
                                    /* console.log(`Posting in progress! ${percentDone}% \n
                                    Bytes being upload: ${event.loaded} \n
                                    Total no. of bytes to upload: ${event.total}`); */
                                    break;
                                case HttpEventType.DownloadProgress:
                                    var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                                    if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                                        reject({
                                            code:403,
                                            message:'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'});
                                    }
                                    totLoaded += loadDiff;
                                    prevLoaded = event.loaded;
                                    break;
                                    
                                case HttpEventType.Response:
                                        resolve(totLoaded); //da xong mot step tren mot thread tra ve so luong dowload
                                        break;
                                default:
                                        console.log(event); //tra ve {type:0}
                                        break;
                            }
                            }, err => {
                                console.log(err);
                                reject(err);
                            });

        xhr[i].cancel = function(){
            reject({code:403,message:'Too Slow network!'})
        }

        })
    }

    uploadOne(i,step){
        return new Promise((resolve,reject)=>{
            var prevLoaded = 0 // number of bytes loaded last time onprogress was called

            var req = new HttpRequest('POST', 
                speedtestServer+"/speedtest/empty?" + 'r=' + Math.random(), //them chuoi random de khong bi cache
                //neu lay server khac phai khai bao cors control 
                //"http://10.151.54.84:9235/garbage.php?" + 'r=' + Math.random() + '&ckSize=' + garbagePhp_chunkSize,
                { 
                    reportProgress: true,
                    responseType:'arraybuffer'}); // 'arraybuffer' | 'blob' | 'json' | 'text'

            
            xhr[i] = http.request(req)
                         .subscribe((event: HttpEvent<any>) => {
                            switch (event.type) {
                                case HttpEventType.Sent:
                                    break;
                                case HttpEventType.ResponseHeader:
                                    break;
                                case HttpEventType.UploadProgress:
                                    //truong hop download nen khong co cai nay
                                    //console.log('HttpEventType.UploadProgress!')
                                    //console.log(event);
                                    //this.getHttpEvent().next(event);
                                    //const percentDone = Math.round(100 * event.loaded / event.total);
                                    /* console.log(`Posting in progress! ${percentDone}% \n
                                    Bytes being upload: ${event.loaded} \n
                                    Total no. of bytes to upload: ${event.total}`); */
                                    break;
                                case HttpEventType.DownloadProgress:
                                    var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                                    if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                                        reject({
                                            code:403,
                                            message:'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'});
                                    }
                                    totLoaded += loadDiff;
                                    prevLoaded = event.loaded;
                                    break;
                                    
                                case HttpEventType.Response:
                                        resolve(totLoaded); //da xong mot step tren mot thread tra ve so luong dowload
                                        break;
                                default:
                                        console.log(event); //tra ve {type:0}
                                        break;
                            }
                            }, err => {
                                console.log(err);
                                reject(err);
                            });

        xhr[i].cancel = function(){
            reject({code:403,message:'Too Slow network!'})
        }

        })
    }



    //3. test upload
    multiUpload(){
        totLoaded = 0.0;
        progress = 0;
        metter = '...';
        xhr = []; //bat dau tao multithread
        var maxThread = 10; //so luong chay 10 thread
        var maxStep = 20; //moi luong chay qua 20 step
        var durationTestInSecond = 15 //so giay chay test thu
        var maxTime_ms = (durationTestInSecond/2) * 1000; //thoi gian thu 10 s hoac 20 buoc

        var delayThread = 300;

        var overheadCompensationFactor = 1.06; //can be changed to compensatie for transport overhead. (see doc.md for some other values)
        var useMebibits: false;

        var graceTimeDone =false ; //bo thoi gian parse TCP de tinh toc do cho chinh xac 
        var time_dlGraceTime = 1.5 //time to wait in seconds before actually measuring dl speed (wait for TCP window to increase)
        var startT = new Date().getTime(); // timestamp when test was started
        

        this.postMessage({
            command:'report', //
            work:'upload', //lay dia chi ip cho toi
            status: false,
            startTime: startT,
            message: 'start'
          });

        interval = setInterval(function(){
            
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            if (graceTimeDone) progress = passTime / (durationTestInSecond * 1000);
            //reset thoi gian bat dau tinh toan toc doc
            if (!graceTimeDone) {
                if (passTime > 1000 * time_dlGraceTime) {
                  if (totLoaded > 0) { // if the connection is so slow that we didn't get a single chunk yet, do not reset
                    startT = new Date().getTime(); //bat dau tinh thoi gian download
                    totLoaded = 0.0;               //reset bien lai
                  }
                  graceTimeDone = true;
                }
            } else {
                var speed = totLoaded / (passTime / 1000.0)
                metter = ((speed * 8 * overheadCompensationFactor) / (useMebibits ? 1048576 : 1000000)).toFixed(2) // speed is multiplied by 8 to go from bytes to bits, overhead compensation is applied, then everything is divided by 1048576 or 1000000 to go to megabits/mebibits
                //neu qua thoi gian thi reset cai interval nay di
                
                //muon reset tien trinh dang dowload ve thi sao????
                //lay totloaded thoi gian troi qua de tinh toan
                //dua ve qua trinh
                this.postMessage({
                    command:'progress', //
                    work:'upload', //
                    data: {
                        dlProgress :  progress, //Tien trinh chay
                        dlStatus : metter
                    }, //chuoi tien do  dd
                    status: false, //finish
                    startTime: startT,
                    reportTime: new Date().getTime(),
                    message: 'continue' //tiep tuc cho toi
                    });
            
                if (progress>=1){
                    //truong hop vuot qua thoi gian cho phep roi ma van chua ket thuc
                    //bao ket thuc roi reset connection
                    console.log('SLOW NETWORK');
                    //send interupt
                     //xem lai cac ham xoa request trong angular
                    this.clearRequests();
                }
            }

            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this),200); //cu 200ms thi thong bao ket qua cho metter

        return new Promise((resolve,reject)=>{

            startT = new Date().getTime(); // timestamp when test was started
        
            var testStream = function (i, delay, step , doneThread) {
                //chay 1 lan delay
                setTimeout(function () {
                    let timeout = new Date().getTime()-startT;
                    
                    //console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);
                    
                    this.uploadOne(i,step) //tien trinh nay chay rat cham neu mang cham
                    .then(total=>{
                        /* console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        console.log(total); */
                        if (timeout<maxTime_ms&&step<maxStep) { //dieu kien nao den truoc 
                            //console.log("progress " + step);
                            //resolve('progress ' + i);
                            try { xhr[i].unsubcriber() } catch (e) { } // reset the stream data to empty ram
                            testStream(i, 0, step + 1, doneThread ); //goi tiep bien a
                        } else {
                            //console.log("finish IN thread: " + i);
                            //console.log(doneThread);
                            if (doneThread) doneThread(i) //bao xong thread so i
                            //resolve(total); //ket thuc thread voi n step mang tong so tra ve
                        }
                    })
                    .catch(err=>{
                        //truong hop da reset ket qua gui ve sau thi
                        //console.log(err);
                        if (doneThread) doneThread(i)
                    }); //goi ham dowload thread i va step 

                }.bind(this), 1 + delay)
            }.bind(this);
            
            var countThreadDone = 0;
            var callBackThread = function(threadId){
                                        //console.log("finish thread CALLBACK: " + threadId);
                                        countThreadDone++;
                                        if (countThreadDone==maxThread){
                                            console.log('XONG ROI NHE:' + countThreadDone);
                                            resolve(totLoaded); //tra ve tong so luong bit nhan duoc
                                        }
                                    }
        
            for (var j=0;j<maxThread;j++){
                //console.log("Thread " + j);
                testStream(j, j * delayThread, 1, callBackThread); //chay tu step 1
            }  
        })
        .then(data=>{
                //reset interval clear no di
                clearInterval(interval);
                //Tra ve chu XONG!
                this.postMessage({
                    command:'progress', //
                    work:'upload', //
                    data: {
                        dlProgress :  1, //Tien trinh chay
                        dlStatus : metter
                    }, //chuoi tien do  dd
                    status: false, //finish
                    startTime: startT,
                    reportTime: new Date().getTime(),
                    message: 'finish' //tiep tuc cho toi
                    });

                //thong bao xu ly xong
                this.postMessage({
                    command:'report', //
                    work:'upload', //
                    data: {
                        dlProgress :  1, //Tien trinh chay xong
                        dlStatus : metter,
                        totLoaded: data
                    },
                    status: true, //finish
                    startTime: startT,
                    endTime: new Date().getTime(),
                    message: 'success'
                    });

                return 'UPLOAD STOP!'; //tra ve cho phien goi no
        });
    }

    
}