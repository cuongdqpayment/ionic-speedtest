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
  public server = {
    NAME: "amazone-heroku-usa"
    ,SERVER_URL: "https://cuongdq-speedtest.herokuapp.com"
    ,DOWNLOAD: "/speedtest/download"
    ,GET_IP: "/speedtest/get-ip"
    ,PING: "/speedtest/empty"
    ,UPLOAD: "/speedtest/empty"
    ,LOCATION: "30.0866,-94.1274"
    ,DESCRITPTION: " Máy chủ test internet Tại Mỹ, herokuapp.com"
  };
  public serverList = [this.server];

  public selectOptions = {
    title: 'SERVER LIST',
    subTitle: 'Select a server',
    mode: 'md'
  };

  constructor(public navCtrl: NavController,
    private apiLocation: ApiLocationService,
    private apiGraph: ApiGraphService,
    private apiAuth: ApiAuthService,
    private alertCtrl: AlertController,
    private apiHttp: ApiSpeedTestService) { }

  ngOnInit() { 

    this.resetContermet(); 
    this.server = this.serverList[0];
    this.apiAuth.getSpeedtestServerList()
    .then(data=>{
      let list;
        list = data;
        try{
          if (list) this.serverList = list;
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
      this.apiHttp.setWorker(worker);
      this.apiHttp.setServer(this.server);

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
      this.result = this.results.pop();
    }

    //co cong viec va ket qua hoan thanh
    if (work == 'ip') {
      //cong viec hoan thanh lay ip
      let dt = new Date();
      let time = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '')
                + " GMT"
                + dt.getTimezoneOffset() / 60
                + " Local: "
                + dt.toLocaleTimeString();
      this.result.ip = d.ip;
      this.result.time = time;
      this.result.server = (d.server?d.server:this.server.SERVER_URL);
      this.results.push(this.result);
    } else if (work == 'download') {
      this.result.download = d.speed;
      this.results.push(this.result);
    } else if (work == 'upload') {
      this.result.upload = d.speed;
      this.results.push(this.result);
    } else if (work == 'ping') {
      this.result.ping = d.ping;
      this.result.jitter = d.jitter;
      this.results.push(this.result);
    }
  }


  /**
   * '_I_U' | '_I_P_D_U'
   * @param test_order 
   */
  runTestLoop(test_order: string){
    const delay = 1000;
    var nextIndex = 0;

    this.apiLocation.getCurrentLocation()
    .then(pos=>{
      if (!this.result){
        this.result={}; //khoi dau mot phien test moi
        this.result.id = ++idx; //id moi khoi tao
        this.result.start_location = pos;
        this.result.start_time = new Date().getTime();
        this.results.push(this.result);
      }
    })
    .catch(err=>{ });

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
                    this.apiHttp.getISP()
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
                    
                    this.apiHttp.download()
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
                    this.apiHttp.upload()
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
        this.result = this.results.pop();
        this.result.end_location = pos;
        this.result.end_time = new Date().getTime();
        this.results.push(this.result);
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
