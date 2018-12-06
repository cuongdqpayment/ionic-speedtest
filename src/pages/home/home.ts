//vung import ts
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ApiGraphService } from '../../services/apiMeterGraphService'
import { ApiSpeedTestService } from '../../services/apiSpeedTestService'

//khai bao bien toan cuc cua javascript
var meterBk = "#E0E0E0";
var dlColor = "#6060AA",
  ulColor = "#309030",
  pingColor = "#AA6060",
  jitColor = "#AA6060";
var progColor = "#EEEEEE";

var worker = null;
var data = null;
var interval = null;
var isRuning:boolean = false;
var idx = 0;

//khai bao thanh phan cua trang nay
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

//class dieu khien rieng cua no
export class HomePage {

  public objISP:any;
  public objMeter={
    graphName:'Download',
    unit:'Mbps',
  }
  public objResult={
    id: 1,
    time:'20181204 11:34:44',
    ip:'10.141..2-ss',
    server:'10.1.1.1 -- unkwow',
    jitter:'0.09',
    ping:'123',
    download:'64.11',
    upload:'76.3',
  }

  public results=[];

  constructor(public navCtrl: NavController,
              private apiGraph: ApiGraphService,
              private apiHttp: ApiSpeedTestService) {

  }

  ngOnInit() {
    this.apiGraph.initUI(meterBk, dlColor, progColor);
  }

  clearRuning(){
    isRuning = false;
    this.apiGraph.I("startStopBtn").className = "";
    clearInterval(interval);
    worker = null;
    data = null;
  }

  startStop(){
    isRuning = !isRuning; 
    if (!isRuning) {
      this.apiGraph.I("startStopBtn").className = "";
      //dung test
    } else {
      this.apiGraph.I("startStopBtn").className = "running";
      //bat dau chay
      worker = new Worker('worker-message.js');
      this.apiHttp.setWorker(worker);
      //tao canvas đồng hồ html5
      this.apiGraph.initUI(meterBk, dlColor, progColor);
      //thuc thi goi lenh download nhe
      this.apiHttp.getISP()
      .then(data=>{
        this.objISP = data;
        //console.log(data);
        if (this.objISP
            &&this.objISP.processedString
            &&this.objISP.rawIspInfo
            &&this.objISP.server.distance
            ){
            //ghi ket qua len form   
            this.objISP.server.distance = '('+ this.objISP.server.distance + "km)"
            
        }  
        if (this.objISP&&this.objISP.server){
          //neu server tim thay thi test nhe
          this.apiHttp.multiDownload()
          .then(result=>{
            console.log(result);

          })
          .catch(err=>{
            console.log(err);
          })
        }
      })
      .catch(err=>{
        console.log(err);
      });

      worker.onmessage = (e)=>{this.onMessageProcess(e)} 
        
      //cu 200ms gui kiem tra ket qua 1 lan
      interval = setInterval(function () {
        if (!isRuning){
          //console.log('clear');
          clearInterval(interval);
        }
        if (worker) worker.postMessage(JSON.stringify({command:'status'}));
      }, 200);

    }
  }

  onMessageProcess(e){
    let workerReplyData = JSON.parse(e.data);
    
    //cap nhap nhan
    if ( workerReplyData
      && workerReplyData.command==='report'
      && !workerReplyData.status //trang thai
      ){
       this.initUI(workerReplyData.work);
    }
    
    //cap nhap tien trinh 
    if (workerReplyData
      &&workerReplyData.command==='status'
      &&workerReplyData.results){
      data = workerReplyData.results;
      /**
       * {
            testState: 1,
            dlStatus: i * 1000 * Math.random(),
            dlProgress: i++,
          }
       */
      if (data.dlProgress >= 1 ){
        this.clearRuning();
      }
      this.apiGraph.updateUI(data, meterBk, dlColor, progColor);
    }

    //cap nhap ket qua
    if ( workerReplyData
      && workerReplyData.command==='report'
      && workerReplyData.work //co cong viec gi
      && workerReplyData.status //hoan thanh
      && workerReplyData.data //du lieu
      ){
       this.updateUI(workerReplyData.work,workerReplyData.data);
    }

  }

  initUI(work){
    if (work==='get-ip'){
      this.objMeter={
        graphName:'Checking your IP',
        unit:'ms',
      }
      this.apiGraph.initUI(progColor, pingColor,progColor);
    }
    else if (work==='download'){
      this.objMeter={
        graphName:'Download',
        unit:'Mbps',
      }
      this.apiGraph.initUI(progColor, dlColor,progColor);
    }
    else if (work==='upload'){
      this.objMeter={
        graphName:'Upload',
        unit:'Mbps',
      }
      this.apiGraph.initUI(progColor, ulColor,progColor);
    }
    else if (work==='Ping'){
      this.objMeter={
        graphName:'Ping',
        unit:'ms',
      }
      this.apiGraph.initUI(progColor, pingColor,progColor);
    }
    else if (work==='jitter'){
      this.objMeter={
        graphName:'Jitter',
        unit:'ms',
      }
      this.apiGraph.initUI(progColor, jitColor,progColor);
    }
  }


  updateUI(work,d){
    //co cong viec va ket qua
    if (work==='get-ip'){
      this.objResult.id = ++idx;
      this.objResult.ip = d.processedString + ' - ' + d.rawIspInfo.org
                          + d.rawIspInfo.city + d.rawIspInfo.region
                          + d.rawIspInfo.country;
      this.objResult.server = d.server.ip + ' - ' + d.server.org
                          + d.server.city + d.server.region
                          + d.server.country;
                          
      this.results.push(this.objResult);
    }
  }
}
