import { Component } from '@angular/core';
import { reorderArray, ModalController, Platform, NavController } from 'ionic-angular';

import { ApiGraphService } from '../../services/apiMeterGraphService'
import { ApiSpeedTestService } from '../../services/apiSpeedTestService'
import { ApiLocationService } from '../../services/apiLocationService'
import { ApiHttpPublicService } from '../../services/apiHttpPublicServices';
import { DynamicFormWebPage } from '../dynamic-form-web/dynamic-form-web';
import { ApiSqliteService } from '../../services/apiSqliteService';
import { ApiStorageService } from '../../services/apiStorageService';
import { ResultsPage } from '../results/results';
import { ApiAuthService } from '../../services/apiAuthService';

var worker = null;

//khai bao thanh phan cua trang nay
@Component({
  selector: 'page-speed-test',
  templateUrl: 'speed-test.html'
})


//class dieu khien rieng cua no
export class SpeedTestPage {

  app:any = {
    id: "SPEEDTEST",
    name: "Speedtest VN",
    image: "assets/imgs/logo.png"
  }

  objMeterOrigin = {
    graphName: 'Speed Test',
    unit: 'Mbps/ms',
  }

  objMeter = {};

  results = [];
  result: any;
  server: any;

  isRuning: boolean = false;
  idx = 0;
  serverList = [];

  dynamicList: any = {
     header: {
      title: "Time"
      , strong: "Server-ISP"
      , p: "Dowload"
      , span: "Upload"
      , label: "Ping"
      , note: "Jitter"
    }
  };


  shareUrl:any;

  constructor(
    private navCtrl: NavController,
    private apiLocation: ApiLocationService,
    private apiGraph: ApiGraphService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private apiSpeedtest: ApiSpeedTestService,
    private apiPublic: ApiHttpPublicService,
    private authService: ApiAuthService,
    private apiSqlite: ApiSqliteService,
    private apiStorage: ApiStorageService
    ) { }

  ngOnInit() {

    console.log('platform',this.platform.platforms());
    console.log('cordova',this.platform.is("cordova"));

    this.resetForm();  

    this.dynamicList.is_table = this.platform.platforms()[0] === 'core'

    this.apiSpeedtest.getSpeedtestServerList()
    .then(list => {
      this.serverList = list;
      this.server = this.serverList[0];
    })
    .catch(err => {
      console.log(err);
    })

  }
  
  resetForm(){
    if (this.platform.is("cordova")){
      //this.results = this.apiSqlite.getResults();
      let selectSql = {name:"SPEEDTEST"
                          , cols:[
                              { name:"time"}
                              ,{ name:"result"}
                          ]};
      this.apiSqlite.selectAll(selectSql)
          .then(data=>{
            console.log('Select', data);

          })
          .catch(err=>{
            console.log('err Select', err);
          })
    }else{
      this.results = this.apiStorage.getResults();
    }    
    
    //lay thong tin tu may chu
    //GET https://c3.mobifone.vn/api/ext-public/your-device?id=SPEEDTEST
    //return data.share_url for share post
    //duong dan gui ket qua {url:"https://c3.mobifone.vn/api/speedtest/post-result",method:"POST"}
    this.apiPublic.getMyDevice(this.app.id)
    .then(data=>{
      if (data) this.shareUrl = data.share_url; 
    })
    .catch(err=>{});
    
    this.resetContermet();
  }

  resetContermet() {
    if (this.isRuning){
      this.apiGraph.initUI();
      this.objMeter = this.objMeterOrigin;
      this.apiGraph.updateUI({ state: 0, contermet: '...', progress: 0 });
    }
  }

  clearRuning() {
    //speedtest finish
    //this.hideShowTab();

    console.log('Finish Run!');
    
    if (this.results.length>0){
      if (this.platform.is("cordova")){
        if (this.result){

          let insertSql = {name:"SPEEDTEST"
          , cols:[
            { name:"time", value: this.result.start_time}
            ,{ name:"result", value: this.result}
          ]};

          console.log('sql save',insertSql);

          this.apiSqlite.insert(insertSql)
          .then(data=>{

            console.log('Insert', data);

          })
          .catch(err=>{
            console.log('err Insert', err);
          })

        }
      }else{
        this.apiStorage.saveResults(this.results);
      }
    }

    this.resetContermet();
    this.isRuning = false;
    worker = null;

  }

  startStop() {
    //speedtest start

    this.isRuning = !this.isRuning;

    if (!this.isRuning) {
      //this.apiGraph.I("startStopBtn").className = "";
      //dung test
    } else {
      //lay vi tri de ghi ket qua
      //this.apiGraph.I("startStopBtn").className = "running";
      //bat dau chay
      this.result = null;
      this.hideShowTab();
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
      try{
        this.apiGraph.updateUI({ state: 1, contermet: objCommand.data.contermet, progress: objCommand.data.progress });
      }catch(e){}
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
    try{
      this.apiGraph.initUI({
        statusColor: formWork.statusColor,
        backgroundColor: formWork.backgroundColor,
        progressColor: formWork.progressColor
      });
    }catch(e){}
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
      if (d.device&&d.device.ip_info) try{ d.device.ip_info = JSON.parse(d.device.ip_info);}catch(e){}
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
    const delay = 500;
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

      console.log('step',command);
      if (!command) {
        console.log('stop');

        this.clearRuning();
      }

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
        //xem kq --send tu dong neu co url
        console.log('result share location:',this.shareUrl);
        if (this.shareUrl) this.sendResult(this.shareUrl);

      })
      .catch(err => {
        //console.log(err);
        //ket qua send tu dong
        console.log('result share no LOC:',this.shareUrl);
        if (this.shareUrl) this.sendResult(this.shareUrl);
      });

  }

  /**
   * 
   * @param shareUrl 
   * {url:"https://...", method:"POST", token:true|false}
   */
  sendResult(shareUrl){
    if (this.result&&shareUrl.url&&shareUrl.method) {
      if (shareUrl.method=="POST"){
        if (shareUrl.token){
          this.authService.postDynamicForm(shareUrl.url, this.result)
            .then(data => {
              console.log('save OK',data);
            })
            .catch(err => {
              console.log('save err', err);
            });
        }else{
          this.apiPublic.postDynamicForm(shareUrl.url, this.result)
            .then(data => {
              console.log('save OK',data);
            })
            .catch(err => {
              console.log('save err', err);
            });
        }
      }
    }
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

  viewResult(){
    this.navCtrl.push(ResultsPage,{form:this.dynamicList,results:this.results,callback:this.callBack});
  }

  callBack = function(reset?:boolean){
    if (reset) this.resetForm();
  }.bind(this);

  hideShowTab(){
    /* let elements = document.querySelectorAll(".tabbar");
    if (elements != null) {
        Object.keys(elements).map((key) => {
            elements[key].style.display = (elements[key].style.display=='none'?"block":"none");
        });
    } */
  }

}
