import { Component } from '@angular/core';
import { reorderArray, ModalController, Platform } from 'ionic-angular';

import { ApiGraphService } from '../../services/apiMeterGraphService'
import { ApiSpeedTestService } from '../../services/apiSpeedTestService'
import { ApiLocationService } from '../../services/apiLocationService'
import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';

var worker = null;

//khai bao thanh phan cua trang nay
@Component({
  selector: 'page-speed-test',
  templateUrl: 'speed-test.html'
})


//class dieu khien rieng cua no
export class SpeedTestPage {

  objMeter = {
    graphName: 'Speedtest',
    unit: 'Mbps/ms/km',
  }

  results = [];
  result: any;
  server: any;

  isRuning: boolean = false;
  idx = 0;
  serverList = [];

  dynamicList: any = {
     header: {
      title: "Thời gian"
      , strong: "ISP"
      , p: "Dowload"
      , span: "Upload"
      , label: "Ping"
      , note: "Jitter"
    }
  };

  constructor(private apiLocation: ApiLocationService,
    private apiGraph: ApiGraphService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private apiSpeedtest: ApiSpeedTestService) { }

  ngOnInit() {
    this.dynamicList.is_table = this.platform.platforms()[0] === 'core'

    this.dynamicList.items = this.results;
    this.resetContermet();
    this.apiSpeedtest.getSpeedtestServerList()
      .then(list => {
        this.serverList = list;
        this.server = this.serverList[0];
      })
      .catch(err => {
        console.log(err);
      })
  }

  resetContermet() {
    this.apiGraph.initUI();
    this.objMeter = {
      graphName: 'Speedtest',
      unit: 'Mbps/ms/km',
    }
    this.apiGraph.updateUI({ state: 0, contermet: '...', progress: 0 });
  }

  clearRuning() {
    //speedtest xong
    this.resetContermet();

    this.isRuning = false;
    //this.apiGraph.I("startStopBtn").className = "";
    worker = null;
    this.result = null;
  }

  startStop() {

    this.isRuning = !this.isRuning;
    if (!this.isRuning) {
      //this.apiGraph.I("startStopBtn").className = "";
      //dung test
    } else {
      //lay vi tri de ghi ket qua
      //this.apiGraph.I("startStopBtn").className = "running";
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
    if (!this.result) {
      this.result = {}; //khoi dau mot phien test moi
      this.result.id = ++this.idx; //id moi khoi tao
    } else {
      //da chay phien truoc co roi thi lay tu trong ra
      this.result = this.results.shift();
    }

    //co cong viec va ket qua hoan thanh
    if (work == 'ip') {
      //cong viec hoan thanh lay ip
      // console.log("device ***:", d.device);
      // console.log("server ***:", d.server);
      this.result.server = d.server;
      this.result.device = d.device;
      this.result.ip = d.device ? d.device.ip : undefined;
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
  runTestLoop(test_order: string) {
    const delay = 1000;
    var nextIndex = 0;

    var pos;

    this.apiLocation.getCurrentLocation()
      .then(pos => pos = pos)
      .catch(err => console.log(err))
      .then(data => {
        if (!this.result) this.result = {}; else this.result = this.results.shift();
        let dt = new Date();
        this.result.id = ++this.idx; //id moi khoi tao
        if (data) this.result.start_location = data;
        this.result.start_time = dt.getTime();
        this.result.start_local_time = new Date(dt.getTime() - dt.getTimezoneOffset() * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        this.result.time_zone_offset = dt.getTimezoneOffset() / 60;
        this.result.date = dt.toLocaleDateString();
        this.result.time = dt.toLocaleTimeString();
        this.results.unshift(this.result);
      });

    var runNextTest = function () {
      let command = test_order.charAt(nextIndex);

      switch (command) {
        case '_': { nextIndex++; setTimeout(runNextTest, delay); } break;
        case 'S': { nextIndex++; this.shareResult(); setTimeout(runNextTest, delay); } break;
        case 'I': {
          nextIndex++;
          if (!this.isRuning) {
            runNextTest();
            return;
          }
          this.apiSpeedtest.getISP()
            .then(data => {
              //console.log('your ip',data);
              runNextTest();
            })
            .catch(err => {
              console.log('err no get IP', err);
            });
        }
          break;
        case 'P': {
          nextIndex++;
          if (!this.isRuning) {
            runNextTest();
            return;
          }
          this.apiSpeedtest.ping()//.multiDownload()
            .then(result => {
              // console.log('Ping Data: ',result);
              runNextTest();
            })
            .catch(err => {
              // console.log('Ping Error: ',err);
              runNextTest();
            });
        }
          break;
        case 'D': {
          nextIndex++;
          if (!this.isRuning) {
            runNextTest();
            return;
          }

          this.apiSpeedtest.download()
            .then(result => {
              // console.log('Download Data: ',result);
              runNextTest();
            })
            .catch(err => {
              // console.log('Download Error: ',err);
              runNextTest();
            });
        }
          break;
        case 'U': {
          nextIndex++;
          if (!this.isRuning) {
            runNextTest();
            return;
          }
          this.apiSpeedtest.upload()
            .then(result => {
              // console.log ('Upload Data: ', result);
              runNextTest();
            })
            .catch(err => {
              // console.log('Upload Error: ',err);
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
  shareResult() {
    //lay vi tri ket thuc chu trinh de ghi lai vi tri ket thuc test
    this.apiLocation.getCurrentLocation()
      .then(pos => {
        if (this.result) {
          this.result = this.results.shift();
          this.result.end_location = pos;
          this.result.end_time = new Date().getTime();
          this.results.unshift(this.result);
        }
        //xem kq --send
        console.log(this.result);

      })
      .catch(err => {
        //console.log(err);
      });

  }

  toggleSwitch() {
  }

  toggleEdit() {

  }

  reorderData(indexes: any) {
    this.dynamicList.items = reorderArray(this.dynamicList.items, indexes);
  }

  onClickHeader(btn) {
    console.log(btn);
  }


  onClickItem(it, idx) {
    console.log(idx, it);
  }


  onClickSetting() {

    let selectOptions = [];

    this.serverList.forEach((el,idx)=>{
      selectOptions.push({name: idx+1 + ". " + el.name, value: idx})
    })

    let data = {
      title: "Thiết lập"
      , items: [
        { key: "server", name: "Lựa Chọn Máy chủ", hint:"Chọn ít nhất 1 cái nhé em", type: "select", value:0, options: selectOptions }
        , { key:"is_table", name: "Kết quả kiểu bảng?", icon: "grid", value: this.dynamicList.is_table, type: "toggle" }
        , {
          type: "button", options: [
            { name: "Chọn", next: "CALLBACK"}
          ]
        }
      ]
    };

    let settings = {
      parent: this, //bind this for call
      callback: this.callbackSettings,
      step: 'form-user-info',
      form: data
    }

    this.openModal(settings);
  }

/**
 * Cau truc cua ham callback phai chuan nhu nay
 */
  callbackSettings = function (that,res){
    //console.log(res);
    if (res.data) this.dynamicList.is_table = res.data.is_table;
    if (res.data&&res.data.server) this.server = this.serverList[res.data.server];
    return new Promise((resolve, reject)=>{
      resolve({next: "CLOSE"});
    })
  }.bind(this);


  openModal(data) {
    let modal = this.modalCtrl.create(DynamicFormWebPage, data);
    modal.present();
  }

}
