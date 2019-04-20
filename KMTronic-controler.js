
"use strict"

var request = require('request'),
    username = "cuongdq",
    password = "cng3500888",
    urlStatus = "http://192.168.59.245/status.xml",
    urlControl = "http://192.168.59.245/relays.cgi?relay=",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
    
class KMTronic{
    constructor(){}
    
    switchRelay(id){
        return new Promise((resolve,reject)=>{
            request(
                {
                    url : urlControl+id,
                    headers : {
                        "Authorization" : auth
                    }
                },
                function (error, response, body) {
                   if (error){
                        reject(error);
                   }else{
                       resolve(body);
                   }
                }
            );
        })
    }

    getStatus(){
        return new Promise((resolve,reject)=>{
            request(
                {
                    url : urlStatus,
                    headers : {
                        "Authorization" : auth
                    }
                },
                function (error, response, body) {
                   if (error){
                        reject(error);
                   }else{
                       resolve(body);
                   }
                }
            );
        })
    }

}   


const control = new KMTronic();

const schedulers = {
    alert: [
                {start:"0700", end:"1800"}
            ]
            ,
    relay1:[
               {start:"0700", end:"0710"},
               {start:"1100", end:"1110"},
               {start:"1700", end:"1710"}
            ]
            ,
     relay2:[
                 {start:"0700", end:"0900"},
                 {start:"1000", end:"1200"},
                 {start:"1300", end:"1400"},
                 {start:"1500", end:"1600"},
                 {start:"1700", end:"1800"}
             ]
        }



/**
 * Gui tin nhan thong bao chuong trinh dang chay - 1 ngay 1 lan
 */
const send_sms = (phone,sms)=>{
    request.post({
        headers: {'content-type' : 'application/json'},
        url:     'https://c3.mobifone.vn/api/ext-auth/send-sms',
        body:    JSON.stringify({ 
                    phone: phone 
                   , sms: sms
                   , token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjkwMzUwMDAwMyIsIm9yaWdpbiI6Imh0dHA6Ly9jMy5tb2JpZm9uZS52biIsInJlcV9kZXZpY2UiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCA2LjEpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIGNvY19jb2NfYnJvd3Nlci83Mi40LjIwOCBDaHJvbWUvNjYuNC4zMzU5LjIwOCBTYWZhcmkvNTM3LjM2IiwicmVxX2lwIjoiMTAuMjQuMTk4LjIyMSIsImxldmVsIjoyLCJsb2NhbF90aW1lIjoxNTUzNzk2MjI3NTY2LCJpYXQiOjE1NTM4MjE0MjcsImV4cCI6MTU4NTM1NzQyN30.3cA0JoJao5pL_ZOVoZdX3rU2YgaMIMXAylS3kKgUu7A" 
                 })
      }, function(error, response, body){
        console.log('kq gui sms',body);
      });
}



/**
 * Cron jobs
 */


const cron = require("node-cron");

var isAlertOne = false;

cron.schedule("*/5 * * * * *", function() {

    control.getStatus()
    .then(xml=>{
        
        let xmlParser = require('xml-js');
        let json = JSON.parse(xmlParser.xml2json(xml,{compact: true, spaces: 3}))
        let curDate =new Date(); 
        let hh24mi =  (""+curDate.getHours()).padStart(2,0)+(""+curDate.getMinutes()).padStart(2,0);
        
        //console.log("running a task every 5 seconds", hh24mi);
        
        //thong bao qua sms cho quan tri he thong biet
        schedulers.alert.forEach(el=>{
            if (el.start<=hh24mi&&hh24mi<el.end){
                if (!isAlertOne){
                    //gui mot lan neu chua gui
                    isAlertOne = true; //da gui roi, lan sau khong gui nua
                    send_sms('903500888',hh24mi + " cuongdq - alive relay datetime: " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
                }
            }else{
                isAlertOne = false; //ngoai khung gio nen bat lai de lan sau gui tiep
            }
        })
        
        let hasOn = false;
        schedulers.relay1.forEach(el=>{
            if (el.start<=hh24mi&&hh24mi<el.end)
            {
                if (json.response.relay1._text==="0"){
                    //bat len
                    // console.log(
                    //     json.response.relay0._text
                    //    ,json.response.relay1._text
                    //    ,json.response.relay2._text);
                       control.switchRelay(1).then(data=> 
                           console.log(el.start,hh24mi,el.end,json.response.relay1._text,'Relay 1 on')
                        );
                    }     
                    el.current_in = true;   
                    hasOn = true;  
                }
            })
            
            if (!hasOn&&json.response.relay1._text==="1"){
                //tat di
                control.switchRelay(1).then(data=>
                    console.log(hh24mi,json.response.relay1._text,'Relay 1 off')
            );
        }

        hasOn = false;
        schedulers.relay2.forEach(el=>{
            if (el.start<=hh24mi&&hh24mi<el.end)
            {
               if (json.response.relay2._text==="0"){
                    //bat len
                    control.switchRelay(2).then(data=> 
                        console.log(el.start,hh24mi,el.end,json.response.relay2._text,'Relay 2 on')
                        );
                }     
                el.current_in = true;   
                hasOn = true;  
            }
        })

        if (!hasOn&&json.response.relay2._text==="1"){
            //tat di
            control.switchRelay(2).then(data=>
                console.log(hh24mi,json.response.relay2._text,'Relay 2 off')
            );
        }

        
    })
    .catch(e=>{
        console.log(e);
    })

});

console.log("Start!");

