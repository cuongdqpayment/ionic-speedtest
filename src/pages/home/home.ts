import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ApiGraphService } from '../../services/apiMeterGraphService'
import { ApiSpeedTestService } from '../../services/apiSpeedTestService'

var worker = null;
var isRuning: boolean = false;
var idx = 0;

//khai bao thanh phan cua trang nay
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

//class dieu khien rieng cua no
export class HomePage {

  public objISP: any;

  public objMeter = {
    graphName: 'Download',
    unit: 'Mbps',
  }

  public results = [];

  constructor(public navCtrl: NavController,
    private apiGraph: ApiGraphService,
    private apiHttp: ApiSpeedTestService) { }

  ngOnInit() { this.apiGraph.initUI(); }

  clearRuning() {
    isRuning = false;
    this.apiGraph.I("startStopBtn").className = "";
    worker = null;
  }

  startStop() {
    isRuning = !isRuning;
    if (!isRuning) {
      this.apiGraph.I("startStopBtn").className = "";
      //dung test
    } else {
      this.apiGraph.I("startStopBtn").className = "running";
      //bat dau chay
      worker = new Worker('worker-message.js');
      this.apiHttp.setWorker(worker);

      //Thuc hien chu trinh speedTest: getIP, delay, ping, delay, dowload, delay, upload
      this.runTestLoop("_I_P_D_U"); //Get IP, Ping, Download, Upload, Share server, 
        
      worker.onmessage = (e) => { this.onMessageProcess(e) }
        
    }
  }

  /**
   *   
   * @param e 
   */
  onMessageProcess(e) {
    //doi tuong khong phai chuoi nen khong can phai parse
    let objCommand = e.data;
    //cap nhap nhan
    if (objCommand.command === 'init') {
      this.initUI(objCommand.data);
    } else if (objCommand.command === 'progress') {
      this.apiGraph.updateUI({ state: 1, contermet: objCommand.data.contermet, progress: objCommand.data.progress });
    } else if (objCommand.command === 'finish') {
      this.updateResults(objCommand.work, objCommand.data);
    }
  }

  initUI(formWork) {
    //gan ten cho thang do
    this.objMeter = {
      graphName: formWork.graphName,
      unit: formWork.unit,
    }
    //gan mau cho thang do
    this.apiGraph.initUI({
      statusColor: formWork.statusColor,
      backgroundColor: formWork.backgroundColor,
      progressColor: formWork.progressColor
    });
  }


  /**
   * 
   * @param work 
   * @param d 
   *            | {ip: string, server: string, duration: number} //for work ip 
                | {ping: number, jitter: number} //for work ping
                | {speed: number} //for work dowload|upload
   */
  updateResults(work, d) {
    //co cong viec va ket qua hoan thanh
    if (work === 'ip') {
      let result;
      result = {};
      //cong viec hoan thanh lay ip
      let dt = new Date();
      result.id = ++idx;
      result.time = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '')
        + " GMT"
        + dt.getTimezoneOffset() / 60
        + " Local: "
        + dt.toLocaleTimeString();
      result.ip = d.ip;
      result.server = d.server;
      this.results.push(result);
    } else if (work == 'download') {
      let result = this.results.pop();
      result.download = d.speed;
      this.results.push(result);
    } else if (work == 'upload') {
      let result = this.results.pop();
      result.upload = d.speed;
      this.results.push(result);
    } else if (work == 'ping') {
      let result = this.results.pop();
      result.ping = d.ping;
      result.jitter = d.jitter;
      this.results.push(result);
    }
  }


  /**
   * 
   * @param test_order 
   */
  runTestLoop(test_order:'_I_P_D_U'){
    const delay = 1000;
    var nextIndex = 0;
    var runNextTest = function () {
      let command = test_order.charAt(nextIndex);
      
      if (!command) this.clearRuning(); //khong co lenh nao nua thi thoat

      switch (command) {
        case '_': { nextIndex++; setTimeout(runNextTest, delay); } break;
        case 'I': { 
                    nextIndex++; 
                    if (!isRuning) { 
                        runNextTest(); 
                        return; 
                    }
                    this.apiHttp.getISP()
                        .then(data => {
                          this.objISP = data;
                          // console.log('get IP data: ');
                          // console.log(data);
                          if (this.objISP
                            && this.objISP.processedString
                            && this.objISP.rawIspInfo
                            && this.objISP.server.distance
                            ) {
                              //ghi ket qua len form   
                              this.objISP.server.distance = '(' + this.objISP.server.distance + "km)"
                              runNextTest();
                            }

                          })
                          .catch(err => {
                            // console.log('Get IP error: ');
                            // console.log(err);
                            runNextTest();
                          });
                  } 
            break;
        case 'P': { 
                    nextIndex++; 
                    if (!isRuning) { 
                        runNextTest(); 
                        return; 
                    }
                    this.apiHttp.ping()//.multiDownload()
                      .then(result => {
                        // console.log('Ping Data: ');
                        // console.log(result);
                        runNextTest();
                      })
                      .catch(err => {
                        // console.log('Ping Error: ');
                        // console.log(err);
                        runNextTest();
                      });
                  } 
            break;
        case 'D': { 
                    nextIndex++; 
                    if (!isRuning) { 
                        runNextTest(); 
                        return; 
                    }
                    
                    this.apiHttp.multiDownload()
                      .then(result => {
                        // console.log('Download Data: ');
                        // console.log(result);
                        runNextTest();
                      })
                      .catch(err => {
                        // console.log('Download Error: ');
                        // console.log(err);
                        runNextTest();
                      });
                  } 
            break;
        case 'U': { 
                    nextIndex++; 
                    if (!isRuning) { 
                        runNextTest(); 
                        return; 
                    }
                    this.apiHttp.multiUpload()
                      .then(result => {
                        // console.log('Upload Data: ');
                        // console.log(result);
                        runNextTest();
                      })
                      .catch(err => {
                        // console.log('Upload Error: ');
                        // console.log(err);
                        runNextTest();
                      });
                  } 
            break;
        default: nextIndex++;
      }
    }.bind(this) //thuc hien gan this nay vao moi goi lenh duoc

    runNextTest();
  }
}
