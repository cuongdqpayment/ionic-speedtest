webpackJsonp([0],{

/***/ 159:
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
webpackEmptyAsyncContext.id = 159;

/***/ }),

/***/ 200:
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
webpackEmptyAsyncContext.id = 200;

/***/ }),

/***/ 244:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_apiMeterGraphService__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_apiSpeedTestService__ = __webpack_require__(246);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
//vung import ts




//khai bao bien toan cuc cua javascript
var meterBk = "#E0E0E0";
var dlColor = "#6060AA", ulColor = "#309030", pingColor = "#AA6060", jitColor = "#AA6060";
var progColor = "#EEEEEE";
var worker = null;
var data = null;
//var interval = null;
var isRuning = false;
var idx = 0;
//khai bao thanh phan cua trang nay
var HomePage = /** @class */ (function () {
    function HomePage(navCtrl, apiGraph, apiHttp) {
        this.navCtrl = navCtrl;
        this.apiGraph = apiGraph;
        this.apiHttp = apiHttp;
        this.objMeter = {
            graphName: 'Download',
            unit: 'Mbps',
        };
        this.objResult = {
            id: 1,
            time: '...',
            ip: '...',
            server: '...',
            jitter: '...',
            ping: '...',
            download: '...',
            upload: '...',
        };
        this.results = [];
    }
    HomePage.prototype.ngOnInit = function () {
        this.apiGraph.initUI(meterBk, dlColor, progColor);
    };
    HomePage.prototype.clearRuning = function () {
        isRuning = false;
        this.apiGraph.I("startStopBtn").className = "";
        //clearInterval(interval);
        worker = null;
        data = null;
    };
    HomePage.prototype.startStop = function () {
        var _this = this;
        isRuning = !isRuning;
        if (!isRuning) {
            this.apiGraph.I("startStopBtn").className = "";
            //dung test
        }
        else {
            this.apiGraph.I("startStopBtn").className = "running";
            //bat dau chay
            worker = new Worker('worker-message.js');
            this.apiHttp.setWorker(worker);
            //tao canvas đồng hồ html5
            this.apiGraph.initUI(meterBk, dlColor, progColor);
            //thuc thi goi lenh download nhe
            this.apiHttp.getISP()
                .then(function (data) {
                _this.objISP = data;
                //console.log(data);
                if (_this.objISP
                    && _this.objISP.processedString
                    && _this.objISP.rawIspInfo
                    && _this.objISP.server.distance) {
                    //ghi ket qua len form   
                    _this.objISP.server.distance = '(' + _this.objISP.server.distance + "km)";
                }
                if (_this.objISP && _this.objISP.server) {
                    //neu server tim thay thi test nhe
                    _this.apiHttp.multiDownload()
                        .then(function (result) {
                        console.log('Thuc hien xong multiDownload: ');
                        console.log(result);
                    })
                        .catch(function (err) {
                        console.log(err);
                    });
                }
            })
                .catch(function (err) {
                console.log(err);
            });
            worker.onmessage = function (e) { _this.onMessageProcess(e); };
        }
    };
    HomePage.prototype.onMessageProcess = function (e) {
        var workerReplyData = JSON.parse(e.data);
        //cap nhap nhan
        if (workerReplyData
            && workerReplyData.command === 'report'
            && !workerReplyData.status //trang thai
        ) {
            this.initUI(workerReplyData.work);
        }
        //cap nhap tien trinh 
        if (workerReplyData
            && workerReplyData.command === 'status'
            && workerReplyData.results) {
            data = workerReplyData.results;
            /* if (data.dlProgress >= 1 ){
              this.clearRuning();
            } */
            this.apiGraph.updateUI(data, meterBk, dlColor, progColor);
        }
        //cap nhap ket qua
        if (workerReplyData
            && workerReplyData.command === 'report'
            && workerReplyData.work //co cong viec gi
            && workerReplyData.status //hoan thanh
            && workerReplyData.data //du lieu
        ) {
            //console.log(workerReplyData); //in ket qua cong viec hoan thanh
            //this.clearRuning(); //xac dinh cong viec hoan thanh
            //cap nhap thong tin len web
            this.updateUI(workerReplyData.work, workerReplyData.data);
        }
    };
    HomePage.prototype.initUI = function (work) {
        if (work === 'get-ip') {
            this.objMeter = {
                graphName: 'Checking your IP',
                unit: 'ms',
            };
            this.apiGraph.initUI(progColor, pingColor, progColor);
        }
        else if (work === 'download') {
            this.objMeter = {
                graphName: 'Download',
                unit: 'Mbps',
            };
            this.apiGraph.initUI(progColor, dlColor, progColor);
        }
        else if (work === 'upload') {
            this.objMeter = {
                graphName: 'Upload',
                unit: 'Mbps',
            };
            this.apiGraph.initUI(progColor, ulColor, progColor);
        }
        else if (work === 'Ping') {
            this.objMeter = {
                graphName: 'Ping',
                unit: 'ms',
            };
            this.apiGraph.initUI(progColor, pingColor, progColor);
        }
        else if (work === 'jitter') {
            this.objMeter = {
                graphName: 'Jitter',
                unit: 'ms',
            };
            this.apiGraph.initUI(progColor, jitColor, progColor);
        }
    };
    HomePage.prototype.updateUI = function (work, d) {
        //co cong viec va ket qua hoan thanh
        if (work === 'get-ip') {
            //cong viec hoan thanh lay ip
            var dt = new Date();
            var timeString = dt.toISOString().replace(/T/, ' ').replace(/\..+/, '')
                + " GMT"
                + dt.getTimezoneOffset() / 60
                + " Local: "
                + dt.toLocaleTimeString();
            //cap nhap ket qua ip
            var result = {
                id: ++idx,
                time: timeString,
                ip: d.processedString + ' - ' + d.rawIspInfo.org
                    + d.rawIspInfo.city + d.rawIspInfo.region
                    + d.rawIspInfo.country,
                server: d.server.ip + ' - ' + d.server.org
                    + d.server.city + d.server.region
                    + d.server.country
            };
            this.results.push(result);
        }
        else if (work == 'download') {
            var result = this.results.pop();
            result.download = d.dlStatus;
            this.results.push(result);
            this.clearRuning(); //da xong cac buoc
        }
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"D:\IONIC\ionic-speedtest-client\src\pages\home\home.html"*/'<ion-header>\n\n  <ion-navbar>\n\n    <ion-title>\n\n      HOME\n\n    </ion-title>\n\n  </ion-navbar>\n\n</ion-header>\n\n\n\n<ion-content padding>\n\n  <ion-grid>\n\n    <ion-row>\n\n      <ion-col col-24 col-xl-6 col-lg-6 col-md-12 col-sm-12>\n\n        <ion-card class="card-meter">\n\n          <div class="graphArea">\n\n            <div class="graphName">{{objMeter?.graphName}}</div>\n\n            <canvas class="meter" id="dlMeter"></canvas>\n\n            <div class="meterText" id="dlText"></div>\n\n            <div class="unit">{{objMeter?.unit}}</div>\n\n          </div>\n\n          <p>Your IP: {{objISP?.processedString}} - {{objISP?.rawIspInfo?.org}} {{objISP?.rawIspInfo?.city}}\n\n            {{objISP?.rawIspInfo?.region}} {{objISP?.rawIspInfo?.country}}</p>\n\n          <p>\n\n            Server IP: {{objISP?.server?.ip}} - {{objISP?.server?.org}} {{objISP?.server?.city}}\n\n            {{objISP?.server?.region}}\n\n            {{objISP?.server?.country}} {{objISP?.server?.distance}}\n\n          </p>\n\n          <div id="startStopBtn" (click)="startStop()"></div>\n\n        </ion-card>\n\n      </ion-col>\n\n    </ion-row>\n\n  </ion-grid>\n\n  <ion-card class="card-meter">\n\n    <div id="resultBtn"></div>\n\n    <ion-grid>\n\n      <ion-row>\n\n        <ion-col col-1>\n\n          Id\n\n        </ion-col>\n\n        <ion-col col-3>\n\n          Time\n\n        </ion-col>\n\n        <ion-col col-4>\n\n          YourIp\n\n        </ion-col>\n\n        <ion-col col-4>\n\n          ServerIP\n\n        </ion-col>\n\n        <ion-col col-3>\n\n          Jitter\n\n        </ion-col>\n\n        <ion-col col-3>\n\n          Ping\n\n        </ion-col>\n\n        <ion-col col-3>\n\n          Download\n\n        </ion-col>\n\n        <ion-col col-3>\n\n          Upload\n\n        </ion-col>\n\n      </ion-row>\n\n\n\n      <ion-row *ngFor="let result of results">\n\n          <ion-col col-1>\n\n            {{result?.id}}\n\n          </ion-col>\n\n          <ion-col col-3>\n\n              {{result?.time}}\n\n          </ion-col>\n\n          <ion-col col-4>\n\n              {{result?.ip}}\n\n          </ion-col>\n\n          <ion-col col-4>\n\n              {{result?.server}}\n\n          </ion-col>\n\n          <ion-col col-3>\n\n              {{result?.jitter}}\n\n          </ion-col>\n\n          <ion-col col-3>\n\n              {{result?.ping}}\n\n          </ion-col>\n\n          <ion-col col-3>\n\n              {{result?.download}}\n\n          </ion-col>\n\n          <ion-col col-3>\n\n              {{result?.upload}}\n\n          </ion-col>\n\n        </ion-row>\n\n    </ion-grid>\n\n  </ion-card>\n\n</ion-content>'/*ion-inline-end:"D:\IONIC\ionic-speedtest-client\src\pages\home\home.html"*/
        })
        //class dieu khien rieng cua no
        ,
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["d" /* NavController */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_apiMeterGraphService__["a" /* ApiGraphService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_apiMeterGraphService__["a" /* ApiGraphService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__services_apiSpeedTestService__["a" /* ApiSpeedTestService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__services_apiSpeedTestService__["a" /* ApiSpeedTestService */]) === "function" && _c || Object])
    ], HomePage);
    return HomePage;
    var _a, _b, _c;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 245:
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
    }
    ApiGraphService.prototype.initUI = function (bk, fg, prClor) {
        this.drawMeter(this.I("dlMeter"), 0, bk, fg, 0, prClor);
        this.I("dlText").textContent = "";
    };
    ApiGraphService.prototype.I = function (id) { return document.getElementById(id); };
    ApiGraphService.prototype.drawMeter = function (c, amount, bk, fg, progress, prog) {
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
        ctx.strokeStyle = bk;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, Math.PI * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = fg;
        ctx.lineWidth = 16 * sizScale;
        ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, amount * Math.PI * 1.2 - Math.PI * 1.1);
        ctx.stroke();
        if (typeof progress !== "undefined") {
            ctx.fillStyle = prog;
            ctx.fillRect(c.width * 0.3, c.height - 16 * sizScale, c.width * 0.4 * progress, 4 * sizScale);
        }
    };
    ApiGraphService.prototype.mbpsToAmount = function (s) {
        return 1 - (1 / (Math.pow(1.3, Math.sqrt(s))));
    };
    ApiGraphService.prototype.msToAmount = function (s) {
        return 1 - (1 / (Math.pow(1.08, Math.sqrt(s))));
    };
    ApiGraphService.prototype.updateUI = function (data, bk, fg, prClor) {
        if (data) {
            var status = data.testState;
            this.I("dlText").textContent = (status == 1 && data.dlStatus == 0) ? "..." : data.dlStatus;
            this.drawMeter(this.I("dlMeter"), this.mbpsToAmount(Number(data.dlStatus * (status == 1 ? this.oscillate() : 1))), bk, fg, Number(data.dlProgress), prClor);
        }
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

/***/ 246:
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


var speedtestServer = 'https://cuongdq-speedtest.herokuapp.com';
var metter;
var xhr = null; //tao da luong de truy cap server
var interval = null;
var totLoaded = 0.0;
var garbagePhp_chunkSize = 20;
var http;
var ApiSpeedTestService = /** @class */ (function () {
    function ApiSpeedTestService(httpClient) {
        this.httpClient = httpClient;
        http = httpClient;
    }
    //bien worker de truyen message giua cac thread voi nhau
    ApiSpeedTestService.prototype.setWorker = function (worker) {
        this.worker = worker;
    };
    //ham trao doi du lieu voi worker 
    ApiSpeedTestService.prototype.postMessage = function (object) {
        if (this.worker) {
            this.worker.postMessage(JSON.stringify(object));
        }
    };
    //tham tham so cho url ? hoac & theo bien
    //url_sep (url) { return url.match(/\?/) ? '&' : '?'; }
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
    ///////
    //cac ham speedtest
    //1. Lay dia chi IP
    ApiSpeedTestService.prototype.getISP = function () {
        var _this = this;
        this.postMessage({
            command: 'report',
            work: 'get-ip',
            status: false,
            startTime: new Date().getTime(),
            message: 'start'
        });
        return this.httpClient.get(speedtestServer + "/speedtest/get-ip")
            .toPromise()
            .then(function (data) {
            _this.postMessage({
                command: 'report',
                work: 'get-ip',
                data: data,
                status: true,
                endTime: new Date().getTime(),
                message: 'success' //
            });
            return data;
        });
    };
    //2. Test dowload
    /**
     * 10 thread x 20 step
     */
    ApiSpeedTestService.prototype.multiDownload = function () {
        var _this = this;
        totLoaded = 0.0;
        xhr = []; //bat dau tao multithread
        var maxThread = 10; //so luong chay 10 thread
        var maxStep = 20; //moi luong chay qua 20 step
        var durationTestInSecond = 15; //so giay chay test thu
        var maxTime_ms = (durationTestInSecond / 2) * 1000; //thoi gian thu 10 s hoac 20 buoc
        var delayThread = 300;
        var oneThreadFuntion = this.downloadOne; //gan ham de chay download
        var overheadCompensationFactor = 1.06; //can be changed to compensatie for transport overhead. (see doc.md for some other values)
        var useMebibits;
        var graceTimeDone = false; //bo thoi gian parse TCP de tinh toc do cho chinh xac 
        var time_dlGraceTime = 1.5; //time to wait in seconds before actually measuring dl speed (wait for TCP window to increase)
        var startT = new Date().getTime(); // timestamp when test was started
        /* let graceTimeDone = false; //set to true after the grace time is past
        let failed = false; // set to true if a stream fails*/
        this.postMessage({
            command: 'report',
            work: 'download',
            status: false,
            startTime: startT,
            message: 'start'
        });
        interval = setInterval(function () {
            //console.log('gui thong bao tien trinh: ' + totLoaded);
            var passTime = new Date().getTime() - startT;
            var progress = 0;
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
                metter = ((speed * 8 * overheadCompensationFactor) / (useMebibits ? 1048576 : 1000000)).toFixed(2); // speed is multiplied by 8 to go from bytes to bits, overhead compensation is applied, then everything is divided by 1048576 or 1000000 to go to megabits/mebibits
                //neu qua thoi gian thi reset cai interval nay di
                //muon reset tien trinh dang dowload ve thi sao????
                //lay totloaded thoi gian troi qua de tinh toan
                //dua ve qua trinh
                this.postMessage({
                    command: 'progress',
                    work: 'download',
                    data: {
                        dlProgress: progress,
                        dlStatus: metter
                    },
                    status: false,
                    startTime: startT,
                    reportTime: new Date().getTime(),
                    message: 'continue' //tiep tuc cho toi
                });
                if (progress >= 1) {
                    //truong hop vuot qua thoi gian cho phep roi ma van chua ket thuc
                    //bao ket thuc roi reset connection
                    console.log('SLOW NETWORK');
                    //send interupt
                    //xem lai cac ham xoa request trong angular
                    this.clearRequests();
                }
            }
            //qua trinh = thoi gian troi qua chia cho thoi gian du dinh chay thu
        }.bind(this), 200); //cu 200ms thi thong bao ket qua cho metter
        return new Promise(function (resolve, reject) {
            var startT = new Date().getTime(); // timestamp when test was started
            var testStream = function (i, delay, step, doneThread) {
                setTimeout(function () {
                    var timeout = new Date().getTime() - startT;
                    //console.log("test thread: " + i + ", step: " + step + ', timeout: ' + timeout);
                    oneThreadFuntion(i, step) //tien trinh nay chay rat cham neu mang cham
                        .then(function (total) {
                        /* console.log("A Step in a Thread: " + i + " finish Total loaded:");
                        console.log(total); */
                        if (timeout < maxTime_ms && step < maxStep) {
                            //console.log("progress " + step);
                            //resolve('progress ' + i);
                            try {
                                xhr[i].abort();
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
                    }); //goi ham dowload thread i va step 
                }.bind(this), 1 + delay);
            }.bind(_this);
            var countThreadDone = 0;
            var callBackThread = function (threadId) {
                //console.log("finish thread CALLBACK: " + threadId);
                countThreadDone++;
                if (countThreadDone == maxThread) {
                    console.log('XONG ROI NHE:' + countThreadDone);
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
            _this.postMessage({
                command: 'progress',
                work: 'download',
                data: {
                    dlProgress: 1,
                    dlStatus: metter
                },
                status: false,
                startTime: startT,
                reportTime: new Date().getTime(),
                message: 'finish' //tiep tuc cho toi
            });
            //thong bao xu ly xong
            _this.postMessage({
                command: 'report',
                work: 'download',
                data: {
                    dlProgress: 1,
                    dlStatus: metter,
                    totLoaded: data
                },
                status: true,
                startTime: startT,
                endTime: new Date().getTime(),
                message: 'success'
            });
            return 'DOWNLOAD STOP!'; //tra ve cho phien goi no
        });
    };
    ApiSpeedTestService.prototype.downloadOne = function (i, step) {
        return new Promise(function (resolve, reject) {
            var prevLoaded = 0; // number of bytes loaded last time onprogress was called
            var req = new __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["d" /* HttpRequest */]('GET', speedtestServer + "/speedtest/download", 
            //neu lay server khac phai khai bao cors control 
            //"http://10.151.54.84:9235/garbage.php?" + 'r=' + Math.random() + '&ckSize=' + garbagePhp_chunkSize,
            {
                reportProgress: true,
                responseType: 'arraybuffer'
            }); // 'arraybuffer' | 'blob' | 'json' | 'text'
            xhr[i] = http.request(req)
                .subscribe(function (event) {
                //lam sao khi goi unsubcriber thi no se kich cai nay???
                switch (event.type) {
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Sent:
                        //console.log('1. Request sent!');
                        //1. 
                        //this.getHttpEvent().next(event);
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].ResponseHeader:
                        //console.log('2. Response header received!');
                        //console.log(event); // tra ve thong tin cua header
                        //this.getHttpEvent().next(event);
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].UploadProgress:
                        //truong hop download nen khong co cai nay
                        //console.log('HttpEventType.UploadProgress!')
                        //console.log(event);
                        //this.getHttpEvent().next(event);
                        //const percentDone = Math.round(100 * event.loaded / event.total);
                        /* console.log(`Posting in progress! ${percentDone}% \n
                        Bytes being upload: ${event.loaded} \n
                        Total no. of bytes to upload: ${event.total}`); */
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].DownloadProgress:
                        //lay tong so byte nhan duoc
                        //console.log('3. HttpEventType.DownloadProgress!');
                        //console.log(event); // event.type va event.loaded (so byte loaded)
                        var loadDiff = event.loaded <= 0 ? 0 : (event.loaded - prevLoaded);
                        if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) {
                            reject({
                                code: 403,
                                message: 'isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0'
                            });
                        }
                        totLoaded += loadDiff;
                        prevLoaded = event.loaded;
                        //console.log('DownloadProgress: ' + totLoaded);
                        break;
                    case __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["c" /* HttpEventType */].Response:
                        //console.log('4. HttpEventType.Response ' + totLoaded)
                        //console.log('finish!', event.body); //toan du lieu nhan duoc
                        /* this.getHttpEvent().next(event);
                        /* tlog('dl stream finished ' + i)
                        try { xhr[i].abort() } catch (e) { } // reset the stream data to empty ram
                        testStream(i, 0) */
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
        });
    };
    ApiSpeedTestService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]) === "function" && _a || Object])
    ], ApiSpeedTestService);
    return ApiSpeedTestService;
    var _a;
}());

//# sourceMappingURL=apiSpeedTestService.js.map

/***/ }),

/***/ 292:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(293);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(313);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 313:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__ = __webpack_require__(240);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__(367);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_home_home__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__services_apiSpeedTestService__ = __webpack_require__(246);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__services_apiAuthService__ = __webpack_require__(368);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__services_apiImageService__ = __webpack_require__(488);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_apiMeterGraphService__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__services_apiStorageService__ = __webpack_require__(489);
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
                __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_7__pages_home_home__["a" /* HomePage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["c" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */], {}, {
                    links: []
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_3_ionic_angular__["a" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_7__pages_home_home__["a" /* HomePage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_5__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_4__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_11__services_apiMeterGraphService__["a" /* ApiGraphService */],
                __WEBPACK_IMPORTED_MODULE_10__services_apiImageService__["a" /* ApiImageService */],
                __WEBPACK_IMPORTED_MODULE_9__services_apiAuthService__["a" /* ApiAuthService */],
                __WEBPACK_IMPORTED_MODULE_12__services_apiStorageService__["a" /* ApiStorageService */],
                __WEBPACK_IMPORTED_MODULE_8__services_apiSpeedTestService__["a" /* ApiSpeedTestService */],
                { provide: __WEBPACK_IMPORTED_MODULE_2__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["b" /* IonicErrorHandler */] }
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 367:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(240);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(244);
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
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Platform */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]) === "function" && _c || Object])
    ], MyApp);
    return MyApp;
    var _a, _b, _c;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 368:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiAuthService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(86);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(369);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_rsa__ = __webpack_require__(370);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_node_rsa___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_node_rsa__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_jsonwebtoken__ = __webpack_require__(472);
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
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]) === "function" && _a || Object])
    ], ApiAuthService);
    return ApiAuthService;
    var _a;
}());

//# sourceMappingURL=apiAuthService.js.map

/***/ }),

/***/ 374:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 376:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 411:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 412:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 488:
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

/***/ 489:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiStorageService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__ = __webpack_require__(490);
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
var sessionStorageAvailable = Object(__WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__["c" /* isStorageAvailable */])(sessionStorage);
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
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__["StorageService"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1_angular_webstorage_service__["StorageService"]) === "function" && _a || Object])
    ], ApiStorageService);
    return ApiStorageService;
    var _a;
}());

//# sourceMappingURL=apiStorageService.js.map

/***/ })

},[292]);
//# sourceMappingURL=main.js.map