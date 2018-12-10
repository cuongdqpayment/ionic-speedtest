webpackJsonp([0],{

/***/ 160:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 160;

/***/ }),

/***/ 201:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 201;

/***/ }),

/***/ 245:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_apiMeterGraphService__ = __webpack_require__(246);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_apiSpeedTestService__ = __webpack_require__(247);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_apiAuthService__ = __webpack_require__(248);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_apiLocationService__ = __webpack_require__(294);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var worker = null;
var isRuning = false;
var idx = 0;
//khai bao thanh phan cua trang nay
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, apiLocation, apiGraph, apiAuth, alertCtrl, apiHttp) {
        this.navCtrl = navCtrl;
        this.apiLocation = apiLocation;
        this.apiGraph = apiGraph;
        this.apiAuth = apiAuth;
        this.alertCtrl = alertCtrl;
        this.apiHttp = apiHttp;
        this.objMeter = {
            graphName: 'Speedtest',
            unit: 'Mbps/ms/km',
        };
        this.results = [];
        this.server = {
            NAME: "amazone-heroku-usa",
            SERVER_URL: "https://cuongdq-speedtest.herokuapp.com",
            DOWNLOAD: "/speedtest/download",
            GET_IP: "/speedtest/get-ip",
            PING: "/speedtest/empty",
            UPLOAD: "/speedtest/empty",
            LOCATION: "30.0866,-94.1274",
            DESCRITPTION: " Máy chủ test internet Tại Mỹ, herokuapp.com"
        };
        this.serverList = [this.server];
        this.selectOptions = {
            title: 'SERVER LIST',
            subTitle: 'Select a server',
            mode: 'md'
        };
    }
    HomePage.prototype.ngOnInit = function () {
        var _this = this;
        this.resetContermet();
        this.server = this.serverList[0];
        this.apiAuth.getSpeedtestServerList()
            .then(function (data) {
            var list;
            list = data;
            try {
                if (list)
                    _this.serverList = list;
                _this.server = _this.serverList[0];
            }
            catch (e) { }
        })
            .catch(function (err) {
            console.log(err); //loi khong lay duoc danh sach server
        });
    };
    HomePage.prototype.resetContermet = function () {
        this.apiGraph.initUI();
        this.objMeter = {
            graphName: 'Speedtest',
            unit: 'Mbps/ms/km',
        };
        this.apiGraph.updateUI({ state: 0, contermet: '...', progress: 0 });
    };
    HomePage.prototype.clearRuning = function () {
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
    };
    HomePage.prototype.startStop = function () {
        var _this = this;
        isRuning = !isRuning;
        if (!isRuning) {
            this.apiGraph.I("startStopBtn").className = "";
            //dung test
        }
        else {
            //lay vi tri de ghi ket qua
            this.apiGraph.I("startStopBtn").className = "running";
            //bat dau chay
            worker = new Worker('worker-message.js');
            this.apiHttp.setWorker(worker);
            this.apiHttp.setServer(this.server);
            //Thuc hien chu trinh speedTest: getIP, delay, ping, delay, dowload, delay, upload
            this.runTestLoop('_I_P_D_U_S_'); //Get IP, Ping, Download, Upload, Share server, 
            worker.onmessage = function (e) { _this.onMessageProcess(e); };
        }
    };
    /**
     *
     * @param e
     */
    HomePage.prototype.onMessageProcess = function (e) {
        //doi tuong khong phai chuoi nen khong can phai parse
        var objCommand = e.data;
        //cap nhap nhan
        if (objCommand.command === 'init') {
            this.initUI(objCommand.data);
        }
        else if (objCommand.command === 'progress') {
            this.apiGraph.updateUI({ state: 1, contermet: objCommand.data.contermet, progress: objCommand.data.progress });
        }
        else if (objCommand.command === 'finish') {
            this.updateResults(objCommand.work, objCommand.data);
        }
    };
    HomePage.prototype.initUI = function (formWork) {
        //gan ten cho thang do
        this.objMeter = {
            graphName: formWork.graphName,
            unit: formWork.unit,
        };
        //gan mau cho thang do
        this.apiGraph.initUI({
            statusColor: formWork.statusColor,
            backgroundColor: formWork.backgroundColor,
            progressColor: formWork.progressColor
        });
    };
    /**
     *
     * @param work
     * @param d
     *
     */
    HomePage.prototype.updateResults = function (work, d) {
        //kiem tra phien dau tien cua no
        if (!this.result) {
            this.result = {}; //khoi dau mot phien test moi
            this.result.id = ++idx; //id moi khoi tao
        }
        else {
            //da chay phien truoc co roi thi lay tu trong ra
            this.result = this.results.pop();
        }
        //co cong viec va ket qua hoan thanh
        if (work == 'ip') {
            //cong viec hoan thanh lay ip
            var dt = new Date();
            var time = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '')
                + " GMT"
                + dt.getTimezoneOffset() / 60
                + " Local: "
                + dt.toLocaleTimeString();
            this.result.ip = d.ip;
            this.result.time = time;
            this.result.server = (d.server ? d.server : this.server.SERVER_URL);
            this.results.push(this.result);
        }
        else if (work == 'download') {
            this.result.download = d.speed;
            this.results.push(this.result);
        }
        else if (work == 'upload') {
            this.result.upload = d.speed;
            this.results.push(this.result);
        }
        else if (work == 'ping') {
            this.result.ping = d.ping;
            this.result.jitter = d.jitter;
            this.results.push(this.result);
        }
    };
    /**
     * '_I_U' | '_I_P_D_U'
     * @param test_order
     */
    HomePage.prototype.runTestLoop = function (test_order) {
        var _this = this;
        var delay = 1000;
        var nextIndex = 0;
        this.apiLocation.getCurrentLocation()
            .then(function (pos) {
            if (!_this.result) {
                _this.result = {}; //khoi dau mot phien test moi
                _this.result.id = ++idx; //id moi khoi tao
                _this.result.start_location = pos;
                _this.result.start_time = new Date().getTime();
                _this.results.push(_this.result);
            }
        })
            .catch(function (err) { });
        var runNextTest = function () {
            var _this = this;
            var command = test_order.charAt(nextIndex);
            switch (command) {
                case '_':
                    {
                        nextIndex++;
                        setTimeout(runNextTest, delay);
                    }
                    break;
                case 'S':
                    {
                        nextIndex++;
                        this.shareResult();
                        setTimeout(runNextTest, delay);
                    }
                    break;
                case 'I':
                    {
                        nextIndex++;
                        if (!isRuning) {
                            runNextTest();
                            return;
                        }
                        this.apiHttp.getISP()
                            .then(function (data) {
                            _this.objISP = data; //ghi ket qua duoi dong ho do
                            runNextTest();
                        })
                            .catch(function (err) {
                            runNextTest();
                        });
                    }
                    break;
                case 'P':
                    {
                        nextIndex++;
                        if (!isRuning) {
                            runNextTest();
                            return;
                        }
                        this.apiHttp.ping() //.multiDownload()
                            .then(function (result) {
                            // console.log('Ping Data: ');
                            // console.log(result);
                            runNextTest();
                        })
                            .catch(function (err) {
                            // console.log('Ping Error: ');
                            // console.log(err);
                            runNextTest();
                        });
                    }
                    break;
                case 'D':
                    {
                        nextIndex++;
                        if (!isRuning) {
                            runNextTest();
                            return;
                        }
                        this.apiHttp.download()
                            .then(function (result) {
                            // console.log('Download Data: ');
                            // console.log(result);
                            runNextTest();
                        })
                            .catch(function (err) {
                            // console.log('Download Error: ');
                            // console.log(err);
                            runNextTest();
                        });
                    }
                    break;
                case 'U':
                    {
                        nextIndex++;
                        if (!isRuning) {
                            runNextTest();
                            return;
                        }
                        this.apiHttp.upload()
                            .then(function (result) {
                            // console.log('Upload Data: ');
                            // console.log(result);
                            runNextTest();
                        })
                            .catch(function (err) {
                            // console.log('Upload Error: ');
                            // console.log(err);
                            runNextTest();
                        });
                    }
                    break;
                default: nextIndex++;
            }
            if (!command)
                this.clearRuning();
        }.bind(this); //thuc hien gan this nay vao moi goi lenh duoc
        runNextTest();
    };
    //gui ket qua cho may chu
    HomePage.prototype.shareResult = function () {
        var _this = this;
        //lay vi tri ket thuc chu trinh de ghi lai vi tri ket thuc test
        this.apiLocation.getCurrentLocation()
            .then(function (pos) {
            if (_this.result) {
                _this.result = _this.results.pop();
                _this.result.end_location = pos;
                _this.result.end_time = new Date().getTime();
                _this.results.push(_this.result);
            }
            //xem kq --send
            console.log(_this.result);
        })
            .catch(function (err) {
            //console.log(err);
        });
    };
    //gui ket qua cho nguoi dung
    HomePage.prototype.shareResults = function () {
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"D:\IONIC\ionic-speedtest-client\src\pages\home\home.html"*/'<ion-header>\n\n  <ion-navbar>\n\n    <ion-title>\n\n      SPEED TEST\n\n    </ion-title>\n\n  </ion-navbar>\n\n</ion-header>\n\n\n\n<ion-content padding>\n\n  <ion-grid>\n\n    <ion-row>\n\n      <ion-col col-24 col-xl-6 col-lg-6 col-md-12 col-sm-12>\n\n        <ion-card class="card-meter">\n\n          <div class="graphArea">\n\n            <div class="graphName">{{objMeter?.graphName}}</div>\n\n            <canvas class="meter" id="dlMeter"></canvas>\n\n            <div class="meterText" id="dlText"></div>\n\n            <div class="unit">{{objMeter?.unit}}</div>\n\n          </div>\n\n          <ion-item>\n\n            <ion-label>Server: </ion-label>\n\n            <ion-select [(ngModel)]="server" okText="OK" cancelText="Cancel" [selectOptions]="selectOptions">\n\n              <ion-option *ngFor="let server of serverList" [value]="server">{{server?.NAME}}</ion-option>\n\n            </ion-select>\n\n          </ion-item>\n\n          <p>Your IP: {{objISP?.processedString}}</p>\n\n          <div id="startStopBtn" (click)="startStop()"></div>\n\n        </ion-card>\n\n      </ion-col>\n\n      <ion-col col-24 col-xl-18 col-lg-18 *ngIf="results.length > 0">\n\n        <ion-card class="card-meter" >\n\n          <div id="resultBtn" (click) = "shareResults()"></div>\n\n          <ion-grid>\n\n            <ion-row>\n\n              <ion-col col-1>\n\n                Id\n\n              </ion-col>\n\n              <ion-col col-3>\n\n                Time\n\n              </ion-col>\n\n              <ion-col col-4>\n\n                IP\n\n              </ion-col>\n\n              <ion-col col-4>\n\n                Server\n\n              </ion-col>\n\n              <ion-col col-3>\n\n                Jitter\n\n              </ion-col>\n\n              <ion-col col-3>\n\n                Ping\n\n              </ion-col>\n\n              <ion-col col-3>\n\n                DL\n\n              </ion-col>\n\n              <ion-col col-3>\n\n                UL\n\n              </ion-col>\n\n            </ion-row>\n\n      \n\n            <ion-row *ngFor="let result of results">\n\n                <ion-col col-1>\n\n                  {{result?.id}}\n\n                </ion-col>\n\n                <ion-col col-3>\n\n                    {{result?.time}}\n\n                </ion-col>\n\n                <ion-col col-4>\n\n                    {{result?.ip}}\n\n                </ion-col>\n\n                <ion-col col-4>\n\n                    {{result?.server}}\n\n                </ion-col>\n\n                <ion-col col-3>\n\n                    {{result?.jitter}}\n\n                </ion-col>\n\n                <ion-col col-3>\n\n                    {{result?.ping}}\n\n                </ion-col>\n\n                <ion-col col-3>\n\n                    {{result?.download}}\n\n                </ion-col>\n\n                <ion-col col-3>\n\n                    {{result?.upload}}\n\n                </ion-col>\n\n              </ion-row>\n\n          </ion-grid>\n\n        </ion-card>\n\n      </ion-col>\n\n    </ion-row>\n\n  </ion-grid>\n\n</ion-content>'/*ion-inline-end:"D:\IONIC\ionic-speedtest-client\src\pages\home\home.html"*/
        })
        //class dieu khien rieng cua no
        ,
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* NavController */],
            __WEBPACK_IMPORTED_MODULE_5__services_apiLocationService__["a" /* ApiLocationService */],
            __WEBPACK_IMPORTED_MODULE_2__services_apiMeterGraphService__["a" /* ApiGraphService */],
            __WEBPACK_IMPORTED_MODULE_4__services_apiAuthService__["a" /* ApiAuthService */],
            __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* AlertController */],
            __WEBPACK_IMPORTED_MODULE_3__services_apiSpeedTestService__["a" /* ApiSpeedTestService */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 246:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiGraphService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ApiGraphService = /** @class */ (function () {
    function ApiGraphService() {
        this.graphColor = {
            statusColor: "#309030",
            backgroundColor: "#E0E0E0",
            progressColor: "#EEEEEE"
        };
    }
    ApiGraphService.prototype.initUI = function (colors) {
        if (colors)
            this.graphColor = colors; //doi mau default
        this.drawMeter(this.I("dlMeter"), 0, 0);
        this.I("dlText").textContent = "";
    };
    ApiGraphService.prototype.I = function (id) { return document.getElementById(id); };
    ApiGraphService.prototype.drawMeter = function (c, amount, progress, colors) {
        var myColors = (colors) ? colors : this.graphColor;
        var ctx = c.getContext("2d");
        var dp = window.devicePixelRatio || 1;
        var cw = c.clientWidth * dp, ch = c.clientHeight * dp;
        var sizScale = ch * 0.0055;
        if (c.width == cw && c.height == ch) {
            ctx.clearRect(0, 0, cw, ch);
        }
        else {
            c.width = cw;
            c.height = ch;
        }
        ctx.beginPath();
        ctx.strokeStyle = myColors.backgroundColor;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, Math.PI * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = myColors.statusColor;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, amount * Math.PI * 1.2 - Math.PI * 1.1);
        ctx.stroke();
        if (typeof progress !== "undefined") {
            ctx.fillStyle = myColors.progressColor;
            ctx.fillRect(c.width * 0.3, c.height - 16 * sizScale, c.width * 0.4 * progress, 4 * sizScale);
        }
    };
    ApiGraphService.prototype.mbpsToAmount = function (s) {
        return 1 - (1 / (Math.pow(1.3, Math.sqrt(s))));
    };
    ApiGraphService.prototype.msToAmount = function (s) {
        return 1 - (1 / (Math.pow(1.08, Math.sqrt(s))));
    };
    ApiGraphService.prototype.updateUI = function (data) {
        this.I("dlText").textContent = (data.state == 1 && data.contermet == '0') ? "..." : data.contermet;
        this.drawMeter(this.I("dlMeter"), this.mbpsToAmount(Number(Number(data.contermet) * (data.state == 1 ? this.oscillate() : 1))), Number(data.progress));
    };
    ApiGraphService.prototype.oscillate = function () {
        return 1 + 0.02 * Math.sin(Date.now() / 100);
    };
    ApiGraphService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], ApiGraphService);
    return ApiGraphService;
}());

//# sourceMappingURL=apiMeterGraphService.js.map

/***/ }),

/***/ 247:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiSpeedTestService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


//ung dung cuongdq-upload post any
var speedtestServer = {
    NAME: "amazone-heroku-usa",
    SERVER_URL: "https://cuongdq-speedtest.herokuapp.com",
    DOWNLOAD: "/speedtest/download",
    GET_IP: "/speedtest/get-ip",
    PING: "/speedtest/empty",
    UPLOAD: "/speedtest/empty",
    LOCATION: "30.0866,-94.1274",
    DESCRITPTION: " Máy chủ test internet Tại Mỹ, herokuapp.com"
};
var contermet;
var xhr = null; //tao da luong de truy cap server
var interval = null;
var totLoaded = 0.0;
var progress = 0.0;
var ApiSpeedTestService = /** @class */ (function () {
    function ApiSpeedTestService(httpClient) {
        this.httpClient = httpClient;
    }
    //bien worker de truyen message giua cac thread voi nhau
    ApiSpeedTestService.prototype.setWorker = function (worker) {
        this.worker = worker;
    };
    ApiSpeedTestService.prototype.setServer = function (server) {
        //console.log(server);
        speedtestServer = server;
    };
    //tham tham so cho url ? hoac & theo bien
    ApiSpeedTestService.prototype.url_sep = function (url) { return url.match(/\?/) ? '&' : '?'; };
    /**
     * Su dung de truyen du lieu online den worker ...
     * @param command
     * @param work
     * @param data
     */
    ApiSpeedTestService.prototype.postCommand = function (command, work, data //for work dowload|upload
    ) {
        var objData;
        objData = {};
        if (command === 'init') {
            if (work === 'ip') {
                objData.graphName = "Check your IP";
                objData.unit = "ms";
                objData.statusColor = "#AA6060";
                objData.backgroundColor = "#E0E0E0";
                objData.progressColor = "#EEEEEE";
            }
            else if (work === 'ping') {
                objData.graphName = "Ping";
                objData.unit = "ms";
                objData.statusColor = "#AA6060";
                objData.backgroundColor = "#E0E0E0";
                objData.progressColor = "#EEEEEE";
            }
            else if (work === 'download') {
                objData.graphName = "Download";
                objData.unit = "Mbps";
                objData.statusColor = "#6060AA";
                objData.backgroundColor = "#E0E0E0";
                objData.progressColor = "#EEEEEE";
            }
            else if (work === 'upload') {
                objData.graphName = "Upload";
                objData.unit = "Mbps";
                objData.statusColor = "#309030";
                objData.backgroundColor = "#E0E0E0";
                objData.progressColor = "#EEEEEE";
            }
        }
        var objCommand = {
            command: command,
            work: work,
            data: (data) ? data : objData //thay the du lieu data khi khoi tao 
        };
        if (this.worker) {
            this.worker.postMessage(JSON.stringify(objCommand));
        }
    };
    //clear Request khi test vuot qua thoi gian 
    ApiSpeedTestService.prototype.clearRequests = function () {
        //tlog('stopping pending XHRs')
        //console.log('xoa request di:');
        if (xhr) {
            for (var i = 0; i < xhr.length; i++) {
                try {
                    xhr[i].onprogress = null;
                    xhr[i].onload = null;
                    xhr[i].onerror = null;
                }
                catch (e) { }
                try {
                    xhr[i].upload.onprogress = null;
                    xhr[i].upload.onload = null;
                    xhr[i].upload.onerror = null;
                }
                catch (e) { }
                try {
                    xhr[i].abort();
                }
                catch (e) { }
                try {
                    xhr[i].cancel();
                }
                catch (e) { }
                try {
                    xhr[i].unsubscribe();
                }
                catch (e) { }
                try {
                    delete (xhr[i]);
                }
                catch (e) { }
            }
            xhr = null;
        }
        clearInterval(interval); //xoa luong thoi gian de chay cua no
    };
    ApiSpeedTestService.prototype.downloadOne = function (i, step) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var prevLoaded = 0; // number of bytes loaded last time onprogress was called
            //var garbagePhp_chunkSize = 20;
            var req = new __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["d" /* HttpRequest */]('GET', speedtestServer.SERVER_URL + speedtestServer.DOWNLOAD + _this.url_sep(speedtestServer.DOWNLOAD) + "r=" + Math.random(), 
            //them chuoi random de khong bi cach
            {
                reportProgress: true,
                responseType: 'arraybuffer'
            });
            xhr[i] = _this.httpClient.request(req)
                .subscribe(function (event) {
                switch (event.type) {
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Sent:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].ResponseHeader:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].UploadProgress:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].DownloadProgress:
                        var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                        if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                            reject({
                                code: 403,
                                message: 'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'
                            });
                        }
                        totLoaded += loadDiff;
                        prevLoaded = event.loaded;
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Response:
                        resolve(totLoaded); //da xong mot step tren mot thread tra ve so luong dowload
                        break;
                    default:
                        console.log(event); //tra ve {type:0}
                        break;
                }
            }, function (err) {
                console.log(err);
                reject(err);
            });
            xhr[i].cancel = function () {
                reject({ code: 403, message: 'Too Slow network!' });
            };
        });
    };
    ApiSpeedTestService.prototype.uploadOne = function (i, step) {
        var _this = this;
        var xhr_ul_blob_megabytes = 20;
        return new Promise(function (resolve, reject) {
            var prevLoaded = 0; // number of bytes loaded last time onprogress was called
            var r;
            r = new ArrayBuffer(1048576);
            var maxInt = Math.pow(2, 32) - 1;
            try {
                r = new Uint32Array(r);
                for (var j = 0; j < r.length; j++)
                    r[j] = Math.random() * maxInt;
            }
            catch (e) { }
            var reqData = [];
            var reqsmall = [];
            for (var j = 0; j < xhr_ul_blob_megabytes; j++)
                reqData.push(r);
            var reqUL = new Blob(reqData);
            r = new ArrayBuffer(262144);
            try {
                r = new Uint32Array(r);
                for (var j = 0; j < r.length; j++)
                    r[i] = Math.random() * maxInt;
            }
            catch (e) { }
            reqsmall.push(r);
            var reqsmallUL = new Blob(reqsmall);
            var file = new File([reqsmallUL], 'data.dat');
            var req = new __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["d" /* HttpRequest */]('POST', speedtestServer.SERVER_URL + speedtestServer.UPLOAD + _this.url_sep(speedtestServer.UPLOAD) + "r=" + Math.random(), file, { reportProgress: true });
            xhr[i] = _this.httpClient.request(req)
                .subscribe(function (event) {
                switch (event.type) {
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Sent:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].ResponseHeader:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].UploadProgress:
                        var percentDone = Math.round(100 * event.loaded / event.total);
                        //console.log(`FileUploading... is ${percentDone}% uploaded`);
                        var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                        if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                            reject({
                                code: 403,
                                message: 'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'
                            });
                        }
                        totLoaded += loadDiff;
                        prevLoaded = event.loaded;
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].DownloadProgress:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Response:
                        resolve(totLoaded); //da xong mot step tren mot thread tra ve so luong dowload
                        break;
                    default:
                        console.log(event); //tra ve {type:0}
                        break;
                }
            }, function (err) {
                console.log(err);
                reject(err);
            });
            xhr[i].cancel = function () {
                reject({ code: 403, message: 'Too Slow network!' });
            };
        });
    };
    /**
     *
     * @param i mot tien trinh ping goi lenh
     */
    ApiSpeedTestService.prototype.pingOne = function (i) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = new __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["d" /* HttpRequest */]('GET', speedtestServer.SERVER_URL + speedtestServer.PING + _this.url_sep(speedtestServer.PING) + 'r=' + Math.random(), 
            //them chuoi random de khong bi cach
            { reportProgress: true });
            xhr[i] = _this.httpClient.request(req)
                .subscribe(function (event) {
                switch (event.type) {
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Sent:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].ResponseHeader:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].UploadProgress:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].DownloadProgress:
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Response:
                        resolve(event); //da xong mot step tra ve event.body nhe
                        break;
                    default:
                        //console.log(event); //tra ve {type:0}
                        break;
                }
            }, function (err) {
                console.log(err);
                reject(err);
            });
            xhr[i].cancel = function () {
                reject({ code: 403, message: 'Too Slow network!' });
            };
        });
    };
    //1. get-IP
    //cac ham speedtest
    //1. Lay dia chi IP
    ApiSpeedTestService.prototype.getISP = function () {
        var _this = this;
        progress = 0;
        contermet = '...';
        var startT = new Date().getTime(); // timestamp when test was started
        var durationGetIpInSecond = 10;
        this.postCommand("init", "ip");
        interval = setInterval(function () {
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            progress = passTime / (durationGetIpInSecond * 1000);
            this.postCommand("progress", "ip", { progress: progress, contermet: contermet });
            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this), 200); //cu 200ms thi thong bao ket qua cho contermet
        return this.httpClient.get(speedtestServer.SERVER_URL + speedtestServer.GET_IP + this.url_sep(speedtestServer.GET_IP) + "r=" + Math.random())
            .toPromise()
            .then(function (data) {
            //console.log(data);
            clearInterval(interval); //reset interval
            var d;
            d = data;
            d.dlProgress = 1;
            d.dlStatus = progress * 100;
            _this.postCommand("finish", "ip", {
                ip: d.processedString,
                server: d.server ? d.server.ip + ' - ' + d.server.org
                    + d.server.city + d.server.region
                    + d.server.country : '',
                duration: progress * durationGetIpInSecond
            });
            return data;
        });
    };
    //2. Test dowload
    /**
     * 10 thread x 20 step
     */
    ApiSpeedTestService.prototype.download = function () {
        var _this = this;
        totLoaded = 0.0;
        progress = 0;
        contermet = '...';
        xhr = []; //bat dau tao multithread
        var maxThread = 10; //so luong chay 10 thread
        var maxStep = 20; //moi luong chay qua 20 step
        var durationTestInSecond = 15; //so giay chay test thu
        var maxTime_ms = (durationTestInSecond / 2) * 1000; //thoi gian thu 10 s hoac 20 buoc
        var delayThread = 300;
        //var oneThreadFuntion = this.downloadOne; //gan ham de chay download
        var overheadCompensationFactor = 1.06; //can be changed to compensatie for transport overhead. (see doc.md for some other values)
        var useMebibits;
        var graceTimeDone = false; //bo thoi gian parse TCP de tinh toc do cho chinh xac 
        var time_dlGraceTime = 1.5; //time to wait in seconds before actually measuring dl speed (wait for TCP window to increase)
        var startT = new Date().getTime(); // timestamp when test was started
        this.postCommand("init", "download");
        interval = setInterval(function () {
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            if (graceTimeDone)
                progress = passTime / (durationTestInSecond * 1000);
            //reset thoi gian bat dau tinh toan toc doc
            if (!graceTimeDone) {
                if (passTime > 1000 * time_dlGraceTime) {
                    if (totLoaded > 0) {
                        startT = new Date().getTime(); //bat dau tinh thoi gian download
                        totLoaded = 0.0; //reset bien lai
                    }
                    graceTimeDone = true;
                }
            }
            else {
                var speed = totLoaded / (passTime / 1000.0);
                contermet = ((speed * 8 * overheadCompensationFactor) / (useMebibits ? 1048576 : 1000000)).toFixed(2); // speed is multiplied by 8 to go from bytes to bits, overhead compensation is applied, then everything is divided by 1048576 or 1000000 to go to megabits/mebibits
                this.postCommand("progress", "download", { progress: progress, contermet: contermet });
                if (progress >= 1) {
                    console.log('SLOW NETWORK for Download!');
                    this.clearRequests();
                }
            }
            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this), 200); //cu 200ms thi thong bao ket qua cho contermet
        return new Promise(function (resolve, reject) {
            startT = new Date().getTime(); // timestamp when test was started
            var testStream = function (i, delay, step, doneThread) {
                //chay 1 lan delay
                setTimeout(function () {
                    var timeout = new Date().getTime() - startT;
                    //console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);
                    this.downloadOne(i, step) //tien trinh nay chay rat cham neu mang cham
                        .then(function (total) {
                        /* console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        console.log(total); */
                        if (timeout < maxTime_ms && step < maxStep) {
                            //console.log("progress " + step);
                            //resolve('progress ' + i);
                            try {
                                xhr[i].unsubcriber();
                            }
                            catch (e) { } // reset the stream data to empty ram
                            testStream(i, 0, step + 1, doneThread); //goi tiep bien a
                        }
                        else {
                            //console.log("finish IN thread: " + i);
                            //console.log(doneThread);
                            if (doneThread)
                                doneThread(i); //bao xong thread so i
                            //resolve(total); //ket thuc thread voi n step mang tong so tra ve
                        }
                    })
                        .catch(function (err) {
                        //truong hop da reset ket qua gui ve sau thi
                        //console.log(err);
                        if (doneThread)
                            doneThread(i);
                    }); //goi ham dowload thread i va step 
                }.bind(this), 1 + delay);
            }.bind(_this);
            var countThreadDone = 0;
            var callBackThread = function (threadId) {
                countThreadDone++;
                if (countThreadDone == maxThread) {
                    resolve(totLoaded); //tra ve tong so luong bit nhan duoc
                }
            };
            for (var j = 0; j < maxThread; j++) {
                //console.log("Thread " + j);
                testStream(j, j * delayThread, 1, callBackThread); //chay tu step 1
            }
        })
            .then(function (data) {
            //reset interval clear no di
            clearInterval(interval);
            //Tra ve chu XONG!
            _this.postCommand("progress", "download", { progress: 1, contermet: contermet });
            _this.postCommand("finish", "download", { speed: contermet });
            return 'DOWNLOAD STOP!'; //tra ve cho phien goi no
        });
    };
    //3. test upload
    ApiSpeedTestService.prototype.upload = function () {
        var _this = this;
        totLoaded = 0.0;
        progress = 0;
        contermet = '...';
        xhr = []; //bat dau tao multithread
        var maxThread = 10; //so luong chay 10 thread
        var maxStep = 20; //moi luong chay qua 20 step
        var durationTestInSecond = 15; //so giay chay test thu
        var maxTime_ms = (durationTestInSecond / 2) * 1000; //thoi gian thu 10 s hoac 20 buoc
        var delayThread = 300;
        var overheadCompensationFactor = 1.06; //can be changed to compensatie for transport overhead. (see doc.md for some other values)
        var useMebibits;
        var graceTimeDone = false; //bo thoi gian parse TCP de tinh toc do cho chinh xac 
        var time_ulGraceTime = 3; //time to wait in seconds before actually measuring dl speed (wait for TCP window to increase)
        var startT = new Date().getTime(); // timestamp when test was started
        this.postCommand("init", "upload");
        interval = setInterval(function () {
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            if (graceTimeDone)
                progress = passTime / (durationTestInSecond * 1000);
            //reset thoi gian bat dau tinh toan toc doc
            if (!graceTimeDone) {
                if (passTime > 1000 * time_ulGraceTime) {
                    if (totLoaded > 0) {
                        startT = new Date().getTime(); //bat dau tinh thoi gian download
                        totLoaded = 0.0; //reset bien lai
                    }
                    graceTimeDone = true;
                }
            }
            else {
                var speed = totLoaded / (passTime / 1000.0);
                contermet = ((speed * 8 * overheadCompensationFactor) / (useMebibits ? 1048576 : 1000000)).toFixed(2); // speed is multiplied by 8 to go from bytes to bits, overhead compensation is applied, then everything is divided by 1048576 or 1000000 to go to megabits/mebibits
                //dua ve qua trinh
                this.postCommand("progress", "upload", { progress: progress, contermet: contermet });
                if (progress >= 1) {
                    console.log('SLOW NETWORK for Upload!');
                    this.clearRequests();
                }
            }
            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this), 200); //cu 200ms thi thong bao ket qua cho contermet
        return new Promise(function (resolve, reject) {
            startT = new Date().getTime(); // timestamp when test was started
            var testStream = function (i, delay, step, doneThread) {
                //chay 1 lan delay
                setTimeout(function () {
                    var timeout = new Date().getTime() - startT;
                    //console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);
                    this.uploadOne(i, step) //tien trinh nay chay rat cham neu mang cham
                        .then(function (total) {
                        //console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        if (timeout < maxTime_ms && step < maxStep) {
                            try {
                                xhr[i].unsubcriber();
                            }
                            catch (e) { } // reset the stream data to empty ram
                            testStream(i, 0, step + 1, doneThread); //goi tiep bien a
                        }
                        else {
                            if (doneThread)
                                doneThread(i); //bao xong thread so i
                        }
                    })
                        .catch(function (err) {
                        if (doneThread)
                            doneThread(i);
                    });
                }.bind(this), 1 + delay);
            }.bind(_this);
            var countThreadDone = 0;
            var callBackThread = function (threadId) {
                countThreadDone++;
                if (countThreadDone == maxThread) {
                    resolve(totLoaded); //tra ve tong so luong bit nhan duoc
                }
            };
            for (var j = 0; j < maxThread; j++) {
                //console.log("Thread " + j);
                testStream(j, j * delayThread, 1, callBackThread); //chay tu step 1
            }
        })
            .then(function (data) {
            //reset interval clear no di
            clearInterval(interval);
            _this.postCommand("progress", "upload", { progress: 1, contermet: contermet });
            _this.postCommand("finish", "upload", { speed: contermet });
            return 'UPLOAD STOP!'; //tra ve cho phien goi no
        });
    };
    //3. ping and jitter
    ApiSpeedTestService.prototype.ping = function () {
        var _this = this;
        var ping = 0.0; // current ping value
        var jitter = 0.0; // current jitter value
        var i = 0; // counter of pongs received
        var prevInstspd = 0; // last ping time, used for jitter calculation
        var count_ping = 10;
        var ping_allowPerformanceApi = true;
        var pingStatus;
        var jitterStatus;
        xhr = [];
        var startT = new Date().getTime(); // timestamp when test was started
        this.postCommand("init", "ping");
        return new Promise(function (resolve, reject) {
            // ping function
            var doPing = function () {
                var _this = this;
                progress = i / count_ping;
                startT = new Date().getTime();
                this.pingOne(0)
                    .then(function (result) {
                    //console.log("A Step in a Thread: " + i + " finish Total loaded:");
                    //console.log(result);
                    if (i === 0) {
                        startT = new Date().getTime(); // first pong
                    }
                    else {
                        var instspd = new Date().getTime() - startT;
                        if (ping_allowPerformanceApi) {
                            try {
                                //try to get accurate performance timing using performance api
                                var p;
                                p = performance.getEntries();
                                p = p[p.length - 1];
                                var d = p.responseStart - p.requestStart; //best precision: chromium-based
                                if (d <= 0)
                                    d = p.duration; //edge: not so good precision because it also considers the overhead and there is no way to avoid it
                                if (d > 0 && d < instspd)
                                    instspd = d;
                            }
                            catch (e) {
                                console.log('Performance API not supported, using estimate');
                            }
                        }
                        var instjitter = Math.abs(instspd - prevInstspd);
                        if (i === 1)
                            ping = instspd; /* first ping, can't tell jitter yet*/
                        else {
                            ping = instspd < ping ? instspd : ping * 0.8 + instspd * 0.2; // update ping, weighted average. if the instant ping is lower than the current average, it is set to that value instead of averaging
                            if (i === 2)
                                jitter = instjitter; //discard the first jitter measurement because it might be much higher than it should be
                            else
                                jitter = instjitter > jitter ? (jitter * 0.3 + instjitter * 0.7) : (jitter * 0.8 + instjitter * 0.2); // update jitter, weighted average. spikes in ping values are given more weight.
                        }
                        prevInstspd = instspd;
                    }
                    pingStatus = ping.toFixed(2);
                    jitterStatus = jitter.toFixed(2);
                    i++;
                    if (i < count_ping) {
                        doPing();
                        //continue .. postMessage
                        _this.postCommand("progress", "ping", { progress: progress, contermet: pingStatus });
                    }
                    else {
                        progress = 1;
                        resolve({
                            ping: pingStatus,
                            jitter: jitterStatus
                        });
                    } // more pings to do?
                })
                    .catch(function (err) {
                    //truong hop da reset ket qua gui ve sau thi
                    console.log(err);
                    reject({
                        code: 403,
                        message: 'fail!',
                        err: err
                    });
                });
            }.bind(_this);
            doPing(); // start first ping
        })
            .then(function (data) {
            //ping xong roi
            var dataPing;
            dataPing = data;
            //console.log('data:');
            _this.postCommand("progress", "ping", { progress: 1, contermet: dataPing.ping });
            _this.postCommand("finish", "ping", { ping: dataPing.ping, jitter: dataPing.jitter });
            return data;
        })
            .catch(function (err) {
            console.log('err');
            console.log(err);
            throw err; //tra ve xu ly o phien toi
        });
    };
    ApiSpeedTestService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]])
    ], ApiSpeedTestService);
    return ApiSpeedTestService;
}());

//# sourceMappingURL=apiSpeedTestService.js.map

/***/ }),

/***/ 248:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiAuthService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(371);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_rsa__ = __webpack_require__(372);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_rsa___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_node_rsa__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_jsonwebtoken__ = __webpack_require__(474);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_jsonwebtoken___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_jsonwebtoken__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ApiAuthService = /** @class */ (function () {
    function ApiAuthService(httpClient) {
        this.httpClient = httpClient;
        this.authenticationServer = 'https://cuongdq-oauth.herokuapp.com';
        this.clientKey = new __WEBPACK_IMPORTED_MODULE_3_node_rsa___default.a({ b: 512 }, { signingScheme: 'pkcs1-sha256' }); //for decrypte
        this.midleKey = new __WEBPACK_IMPORTED_MODULE_3_node_rsa___default.a(null, { signingScheme: 'pkcs1-sha256' }); //for test
        this.serverKey = new __WEBPACK_IMPORTED_MODULE_3_node_rsa___default.a(null, { signingScheme: 'pkcs1-sha256' }); //for crypte
        //key nay de test thu noi bo
        this.midleKey.importKey(this.clientKey.exportKey('public'));
    }
    ApiAuthService.prototype.getSpeedtestServerList = function () {
        return this.httpClient.get(this.authenticationServer + '/speedtest-server')
            .toPromise()
            .then(function (jsonData) {
            //console.log(jsonData); //tien xu ly truoc khi tra ve main
            return jsonData;
        });
    };
    ApiAuthService.prototype.getServerPublicRSAKey = function () {
        var _this = this;
        if (this.publicKey && this.publicKey.PUBLIC_KEY) {
            return (new Promise(function (resolve, reject) {
                try {
                    _this.serverKey.importKey(_this.publicKey.PUBLIC_KEY);
                }
                catch (err) {
                    reject(err); //bao loi khong import key duoc
                }
                resolve(_this.serverKey);
            }));
        }
        else {
            return this.httpClient.get(this.authenticationServer + '/key-json')
                .toPromise()
                .then(function (jsonData) {
                _this.publicKey = jsonData;
                if (_this.publicKey && _this.publicKey.PUBLIC_KEY) {
                    try {
                        _this.serverKey.importKey(_this.publicKey.PUBLIC_KEY);
                    }
                    catch (err) {
                        throw err;
                    }
                    return _this.serverKey;
                }
                else {
                    throw new Error('No PUBLIC_KEY exists!');
                }
            });
        }
    };
    ApiAuthService.prototype.login = function (formData) {
        var _this = this;
        return this.httpClient.post(this.authenticationServer + '/login', formData)
            .toPromise() //chuyen doi 200 -> then #200->catch
            .then(function (data) {
            //neu tra ve status=200 thi o day
            _this.userToken = data;
            return _this.userToken.token;
        }); //cac trang thai 403,404 thi se ve catch
    };
    ApiAuthService.prototype.pushToken = function (token) {
        //gan token cho user de xem nhu da login
        this.userToken = { token: token };
    };
    ApiAuthService.prototype.logout = function () {
        var _this = this;
        if (this.userToken && this.userToken.token) {
            //truong hop user co luu tren session thi xoa session di
            var req = { Authorization: 'Bearer ' + this.userToken.token };
            return this.httpClient.post(this.authenticationServer + '/logout', JSON.stringify(req))
                .toPromise()
                .then(function (data) {
                console.log(data);
                _this.userToken = null; //reset token nay
                return data; //tra ve nguyen mau data cho noi goi logout xu ly
            })
                .catch(function (err) {
                //xem nhu da logout khong cap luu tru
                console.log(err);
                _this.userToken = null; //reset token nay
                return err; //tra ve nguyen mau data cho noi goi logout xu ly
            });
        }
        else {
            return (new Promise(function (resolve, reject) {
                resolve({ status: 'ok', message: 'Logout susccess!' });
            }));
        }
    };
    ApiAuthService.prototype.register = function (formData) {
        return this.httpClient.post(this.authenticationServer + '/register', formData)
            .toPromise()
            .then(function (data) {
            return data;
        });
    };
    ApiAuthService.prototype.editUser = function (formData) {
        return this.httpClient.post(this.authenticationServer + '/user/save', formData)
            .toPromise()
            .then(function (data) {
            return data;
        });
    };
    //lay thong tin nguoi dung de edit
    ApiAuthService.prototype.getEdit = function () {
        var _this = this;
        if (this.userToken && this.userToken.token) {
            var jsonRequest = { Authorization: 'Bearer ' + this.userToken.token };
            return this.httpClient.post(this.authenticationServer + '/api/user-settings', JSON.stringify(jsonRequest))
                .toPromise()
                .then(function (jsonData) {
                _this.userSetting = jsonData;
                return jsonData;
            });
        }
        else {
            return (new Promise(function (resolve, reject) {
                _this.userSetting = null;
                reject({ error: 'No token, please login first' }); //bao loi khong import key duoc
            }));
        }
    };
    //tren cung site thi khong dung den
    //khong dung header de control
    //cac thong tin lay tu client memory
    //get token for post or get with authentication
    ApiAuthService.prototype.getUserToken = function () {
        return this.userToken.token;
    };
    //get userInfo from token
    ApiAuthService.prototype.getUserInfo = function () {
        //this.userInfo=null;
        try {
            this.userInfo = __WEBPACK_IMPORTED_MODULE_4_jsonwebtoken___default.a.decode(this.userToken.token);
            //console.log(this.userInfo);
            //chuyen doi duong dan image de truy cap anh dai dien
            if (this.userInfo.image
                &&
                    this.userInfo.image.toLowerCase()
                &&
                    this.userInfo.image.toLowerCase().indexOf('http://') < 0
                &&
                    this.userInfo.image.toLowerCase().indexOf('https://') < 0) {
                //chuyen doi duong dan lay tai nguyen tai he thong
                this.userInfo.image = this.authenticationServer
                    + '/resources/user-image/'
                    + this.userInfo.image
                    + '?token=' + this.userToken.token;
                //console.log(this.userInfo.image);
            }
        }
        catch (err) {
            this.userInfo = null;
        }
        return this.userInfo;
    };
    ApiAuthService.prototype.getUserInfoSetting = function () {
        if (this.userSetting.URL_IMAGE
            &&
                this.userSetting.URL_IMAGE.toLowerCase()
            &&
                this.userSetting.URL_IMAGE.toLowerCase().indexOf('http://') < 0
            &&
                this.userSetting.URL_IMAGE.toLowerCase().indexOf('https://') < 0) {
            //chuyen doi duong dan lay tai nguyen tai he thong
            this.userSetting.URL_IMAGE = this.authenticationServer
                + '/resources/user-image/'
                + this.userSetting.URL_IMAGE
                + '?token=' + this.userToken.token;
            //console.log(this.userSetting.URL_IMAGE);
        }
        return this.userSetting;
    };
    ApiAuthService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]])
    ], ApiAuthService);
    return ApiAuthService;
}());

//# sourceMappingURL=apiAuthService.js.map

/***/ }),

/***/ 294:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiLocationService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ionic_native_geolocation__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ApiLocationService = /** @class */ (function () {
    function ApiLocationService(geoLocation) {
        this.geoLocation = geoLocation;
    }
    ApiLocationService.prototype.getCurrentLocation = function () {
        var _this = this;
        //chuyen doi vi tri tra ve vi tri hien tai theo thuat toan
        if (this.currenLocation) {
            return new Promise(function (resolve, reject) {
                resolve(_this.currenLocation);
            });
        }
        else {
            return this.init();
        }
    };
    ApiLocationService.prototype.init = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.stopTracking();
            _this.geoLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 7000
            }).then(function (pos) {
                //console.log('current get ok');
                _this.currenLocation = pos;
                _this.currenLocation.timereturn = new Date().getTime();
                _this.startTracking();
                resolve(_this.currenLocation);
            }).catch(function (err) {
                //console.log('error get current');
                console.log(err);
                _this.startTracking();
                reject(err);
            });
        });
    };
    //Theo dõi thay đổi vị trí
    ApiLocationService.prototype.startTracking = function () {
        var _this = this;
        this.locationTracking = this.geoLocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 3000
        })
            .subscribe(function (pos) {
            //console.log('tracking get Ok');
            _this.currenLocation = pos;
            _this.currenLocation.timereturn = new Date().getTime(); //thoi gian tinh ms hien tai
        }, function (err) {
            // console.log('error get tracking');
            console.log(err);
        });
    };
    ApiLocationService.prototype.stopTracking = function () {
        try {
            this.locationTracking.unsubscribe();
        }
        catch (e) { }
        ;
    };
    ApiLocationService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__ionic_native_geolocation__["a" /* Geolocation */]])
    ], ApiLocationService);
    return ApiLocationService;
}());

//# sourceMappingURL=apiLocationService.js.map

/***/ }),

/***/ 295:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(296);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(316);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 316:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__ = __webpack_require__(241);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_geolocation__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__app_component__ = __webpack_require__(370);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_home_home__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__services_apiSpeedTestService__ = __webpack_require__(247);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__services_apiAuthService__ = __webpack_require__(248);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_apiImageService__ = __webpack_require__(490);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__services_apiMeterGraphService__ = __webpack_require__(246);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__services_apiStorageService__ = __webpack_require__(491);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__services_apiLocationService__ = __webpack_require__(294);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_7__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_8__pages_home_home__["a" /* HomePage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["d" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_7__app_component__["a" /* MyApp */], {}, {
                    links: []
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["b" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_7__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_8__pages_home_home__["a" /* HomePage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_6__ionic_native_geolocation__["a" /* Geolocation */],
                __WEBPACK_IMPORTED_MODULE_12__services_apiMeterGraphService__["a" /* ApiGraphService */],
                __WEBPACK_IMPORTED_MODULE_11__services_apiImageService__["a" /* ApiImageService */],
                __WEBPACK_IMPORTED_MODULE_10__services_apiAuthService__["a" /* ApiAuthService */],
                __WEBPACK_IMPORTED_MODULE_13__services_apiStorageService__["a" /* ApiStorageService */],
                __WEBPACK_IMPORTED_MODULE_9__services_apiSpeedTestService__["a" /* ApiSpeedTestService */],
                __WEBPACK_IMPORTED_MODULE_14__services_apiLocationService__["a" /* ApiLocationService */],
                { provide: __WEBPACK_IMPORTED_MODULE_2__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["c" /* IonicErrorHandler */] }
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 370:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(241);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(245);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"D:\IONIC\ionic-speedtest-client\src\app\app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n\n'/*ion-inline-end:"D:\IONIC\ionic-speedtest-client\src\app\app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 376:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 378:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 413:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 414:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 490:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiImageService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ApiImageService = /** @class */ (function () {
    function ApiImageService() {
    }
    //dua vao doi tuong file image
    //tra ve doi tuong file image co kich co nho hon
    ApiImageService.prototype.resizeImage = function (filename, file, newSize) {
        return new Promise(function (resolve, reject) {
            try {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var maxW = newSize;
                var maxH = newSize;
                var img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = function () {
                    var iw = img.width;
                    var ih = img.height;
                    var scale = Math.min((maxW / iw), (maxH / ih));
                    var iwScaled = iw * scale;
                    var ihScaled = ih * scale;
                    canvas.width = iwScaled;
                    canvas.height = ihScaled;
                    context.drawImage(img, 0, 0, iwScaled, ihScaled);
                    //image.src=canvas.toDataURL(); //gan canvas cho image viewer
                    //xu ly chat luong anh qua cac tham so cua ham toDataURL()
                    //chuyen sang file de ghi xuong dia hoac truyen tren mang
                    //su dung ham toBlob sau
                    canvas.toBlob(function (blob) {
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(blob); //ket qua la mot mang Uint8Array 
                        reader.onload = function () {
                            //console.log(reader.result); //ket qua la mot mang Uint8Array 
                            //newFile la mot file image da duoc resize roi nhe
                            resolve({
                                imageViewer: canvas.toDataURL(),
                                file: new Blob([reader.result], { type: 'image/png' }),
                                name: filename
                            });
                        };
                    });
                };
            }
            catch (err) {
                reject(err);
            }
        });
    };
    ApiImageService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], ApiImageService);
    return ApiImageService;
}());

//# sourceMappingURL=apiImageService.js.map

/***/ }),

/***/ 491:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiStorageService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__ = __webpack_require__(492);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var STORAGE_KEY = 'Cng@3500888';
var sessionStorageAvailable = Object(__WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__["b" /* isStorageAvailable */])(sessionStorage);
var ApiStorageService = /** @class */ (function () {
    function ApiStorageService(storage) {
        this.storage = storage;
    }
    ApiStorageService.prototype.doSomethingAwesome = function () {
        var awesomenessLevel = this.storage.get(STORAGE_KEY) || 1337;
        this.storage.set(STORAGE_KEY, awesomenessLevel + 1);
        return awesomenessLevel;
    };
    ApiStorageService.prototype.save = function (key, value) {
        this.storage.set(key, value);
    };
    ApiStorageService.prototype.read = function (key) {
        return this.storage.get(key);
    };
    ApiStorageService.prototype.delete = function (key) {
        this.storage.remove(key);
    };
    ApiStorageService.prototype.getStatus = function () {
        return "Session storage available: " + sessionStorageAvailable;
    };
    ApiStorageService.prototype.saveToken = function (value) {
        this.save('token', value);
    };
    ApiStorageService.prototype.getToken = function () {
        return this.read('token');
    };
    ApiStorageService.prototype.deleteToken = function () {
        this.delete('token');
    };
    ApiStorageService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["z" /* Inject */])(__WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__["a" /* LOCAL_STORAGE */])),
        __metadata("design:paramtypes", [Object])
    ], ApiStorageService);
    return ApiStorageService;
}());

//# sourceMappingURL=apiStorageService.js.map

/***/ })

},[295]);
//# sourceMappingURL=main.js.map