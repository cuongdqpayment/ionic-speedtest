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

//khai bao thanh phan cua trang nay
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

//class dieu khien rieng cua no
export class HomePage {

  public objISP:any;

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

      //gui lenh len httpClient gui len
      worker.postMessage(JSON.stringify({
        command:'start', //bao cho Worker bat dau lam
        work:'dowload_test', //lay dia chi ip cho toi
        message:'Hello Worker message! '
      }));
      
      //thuc thi goi lenh download nhe
      this.apiHttp.getISP()
      .then(data=>{
        this.objISP = data;
        console.log(data);
        if (this.objISP
            &&this.objISP.processedString
            &&this.objISP.rawIspInfo
            &&this.objISP.server.distance
            ){
            //ghi ket qua len form   
            this.objISP.server.distance = '('+ this.objISP.server.distance + "km)"
        }  
      })
      .catch(err=>{
        console.log(err);
      });

      worker.onmessage = (e)=>{
        let workerReplyData = JSON.parse(e.data);
        if (workerReplyData
          &&workerReplyData.command==='status'
          &&workerReplyData.results){
          //lay ket qua nhan duoc tu worker
          data = workerReplyData.results;
          /**
           * {
                testState: 1,
                dlStatus: i * 1000 * Math.random(),
                dlProgress: i++,
              }
           */
          //console.log(data);
          //console.log(data.dlProgress);
          if (data.dlProgress >= 1 ){
            //tien trinh da xong 100% thi dung lai
            this.clearRuning();
            //this.startStop(); //dao vi tri lai thoi
          }
          this.apiGraph.updateUI(data, meterBk, dlColor, progColor);
        }
      }
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



}
