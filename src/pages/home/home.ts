import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { ApiGraphService } from '../../services/apiMeterGraphService'
import { ApiSpeedTestService } from '../../services/apiSpeedTestService'
import { ApiAuthService } from '../../services/apiAuthService'
import { ApiLocationService } from '../../services/apiLocationService'

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
    graphName: 'Speedtest',
    unit: 'Mbps/ms/km',
  }

  public results = [];
  public result;
  public server = 
 //may speedtest server cua cac nha mang
 //nay vao web speedtest vao phan debug network, ws 
 //lay cac link vi du cua mobifone la:
 // neu go duong dan + http://st1.mobifone.vn.prod.hosts.ooklaserver.net:8080/latency.txt
 // ma no tra ve test=test thi server da co
  { SERVER_URL: "http://st1.mobifone.vn.prod.hosts.ooklaserver.net:8080", 
  NAME: "Mobifone Ha noi", 
  GET_IP: "/get-ip.jsp", 
  PING: "", 
  UPLOAD: "/upload.php", //jsp, asp, aspx, php
  DOWNLOAD: "/random1000x1000.jpg", 
  DESCRITPTION: "Máy chủ speedtest của kola tại Mobifone Ha noi", 
  LOCATION: "16.00,108.00" }

    /* {
    NAME: "amazone-heroku-usa"
    ,SERVER_URL: "https://cuongdq-speedtest.herokuapp.com"
    ,DOWNLOAD: "/speedtest/download"
    ,GET_IP: "/speedtest/get-ip"
    ,PING: "/speedtest/empty"
    ,UPLOAD: "/speedtest/empty"
    ,LOCATION: "30.0866,-94.1274"
    ,DESCRITPTION: " Máy chủ test internet Tại Mỹ, herokuapp.com"
  }; */

  public serverList = [this.server];

  public selectOptions = {
    title: 'SERVER LIST',
    subTitle: 'Select a server',
    mode: 'md'
  };

  constructor(private apiLocation: ApiLocationService,
              private apiGraph: ApiGraphService,
              private alertCtrl: AlertController,
              private apiSpeedtest: ApiSpeedTestService) { }

  ngOnInit() { 

    this.resetContermet(); 
    this.server = this.serverList[0];
    this.apiSpeedtest.getSpeedtestServerList()
    .then(list=>{
        try{
          if (list) this.serverList = this.serverList.concat(list);
          this.server = this.serverList[0];
        }catch(e){}
    })
    .catch(err=>{
      console.log(err); //loi khong lay duoc danh sach server
    })
  }

  resetContermet(){
    this.apiGraph.initUI();
    this.objMeter = {
      graphName: 'Speedtest',
      unit: 'Mbps/ms/km',
    }
    this.apiGraph.updateUI({ state: 0, contermet: '...', progress: 0 });
  }
  clearRuning() {
    //speedtest xong
    this.alertCtrl.create({
      title: 'Speedtest finish',
      subTitle: 'Thank you for your test with us! See the result and share...',
      buttons: ['OK']
    }).present();

    this.resetContermet();

    isRuning = false;
    this.apiGraph.I("startStopBtn").className = "";
    worker = null;
    this.result = null;
  }

  startStop() {
    isRuning = !isRuning;
    if (!isRuning) {
      this.apiGraph.I("startStopBtn").className = "";
      //dung test
    } else {
      //lay vi tri de ghi ket qua
      this.apiGraph.I("startStopBtn").className = "running";
      //bat dau chay
      worker = new Worker('worker-message.js');
      this.apiSpeedtest.setWorker(worker);
      this.apiSpeedtest.setServer(this.server);

      //Thuc hien chu trinh speedTest: getIP, delay, ping, delay, dowload, delay, upload
      this.runTestLoop('_I_P_D_U_S_'); //Get IP, Ping, Download, Upload, Share server, 
        
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
   *  
   */
  updateResults(work, d) {
    //kiem tra phien dau tien cua no
    if (!this.result){
      this.result={}; //khoi dau mot phien test moi
      this.result.id = ++idx; //id moi khoi tao
    }else{
      //da chay phien truoc co roi thi lay tu trong ra
      this.result = this.results.shift();
    }

    //co cong viec va ket qua hoan thanh
    if (work == 'ip') {
      //cong viec hoan thanh lay ip
      this.result.ip = d.ip;
      this.result.server = (d.server?d.server:this.server.SERVER_URL?this.server.SERVER_URL.substring(this.server.SERVER_URL.indexOf('//')+2):'Unk');
      this.results.unshift(this.result);
    } else if (work == 'download') {
      this.result.download = d.speed;
      this.results.unshift(this.result);
    } else if (work == 'upload') {
      this.result.upload = d.speed;
      this.results.unshift(this.result);
    } else if (work == 'ping') {
      this.result.ping = d.ping;
      this.result.jitter = d.jitter;
      this.results.unshift(this.result);
    }
  }


  /**
   * '_I_U' | '_I_P_D_U'
   * @param test_order 
   */
  runTestLoop(test_order: string){
    const delay = 1000;
    var nextIndex = 0;

    var pos;

    this.apiLocation.getCurrentLocation()
    .then(pos=> pos = pos)
    .catch(err=> console.log(err))
    .then(data=>{
      if (!this.result) this.result={}; else this.result = this.results.shift();     
      let dt = new Date();
      this.result.id = ++idx; //id moi khoi tao
      if (data) this.result.start_location = data;
      this.result.start_time = dt.getTime();
      this.result.date = dt.toLocaleDateString();
      this.result.time = dt.toLocaleTimeString();
      this.result.time_iso = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '');
      this.result.time_zone_offset = dt.getTimezoneOffset() / 60;
      this.results.unshift(this.result);
    });

    var runNextTest = function () {
      let command = test_order.charAt(nextIndex);
      
      switch (command) {
        case '_': { nextIndex++; setTimeout(runNextTest, delay); } break;
        case 'S': { nextIndex++; this.shareResult(); setTimeout(runNextTest, delay); } break;
        case 'I': { 
                    nextIndex++; 
                    if (!isRuning) { 
                        runNextTest(); 
                        return; 
                    }
                    this.apiSpeedtest.getISP()
                        .then(data => {
                          this.objISP = data; //ghi ket qua duoi dong ho do
                          runNextTest();
                          })
                          .catch(err => {
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
                    this.apiSpeedtest.ping()//.multiDownload()
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
                    
                    this.apiSpeedtest.download()
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
                    this.apiSpeedtest.upload()
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

      if (!command) this.clearRuning();

    }.bind(this) //thuc hien gan this nay vao moi goi lenh duoc

    runNextTest();
  }

  //gui ket qua cho may chu
  shareResult(){
    //lay vi tri ket thuc chu trinh de ghi lai vi tri ket thuc test
    this.apiLocation.getCurrentLocation()
    .then(pos=>{
      if (this.result){
        this.result = this.results.shift();
        this.result.end_location = pos;
        this.result.end_time = new Date().getTime();
        this.results.unshift(this.result);
      }
      //xem kq --send
      console.log(this.result);

    })
    .catch(err=>{
      //console.log(err);
    });

  }

  //gui ket qua cho nguoi dung
  shareResults(){
    
  }
}
