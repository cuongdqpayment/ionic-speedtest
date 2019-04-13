"use strict"

//npm i request node-cron xml-js

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
    relay1:[{start:parseInt("0700"), end:parseInt("1700")}],
    relay2:[{start:parseInt("0700"), end:parseInt("0730")},
            {start:parseInt("1100"), end:parseInt("1200")}]
}

const cron = require("node-cron");

cron.schedule("*/5 * * * * *", function() {

    control.getStatus()
    .then(xml=>{
        
        let xmlParser = require('xml-js');
        let json = JSON.parse(xmlParser.xml2json(xml,{compact: true, spaces: 3}))
        let curDate =new Date(); 
        let hh24mi = parseInt(curDate.getHours()+""+curDate.getMinutes());
        
        console.log("running a task every 5 seconds");
        console.log(
            json.response.relay0._text
           ,json.response.relay1._text
           ,json.response.relay2._text);

        let hasOn = false;
        schedulers.relay1.forEach(el=>{
            console.log(el.start,hh24mi,el.end,json.response.relay1._text)
            if (el.start<=hh24mi&&hh24mi<el.end)
            {
                if (json.response.relay1._text==="0"){
                     //bat len
                     control.switchRelay(1).then(data=> console.log('1 on'));
                 }     
                 el.current_in = true;   
                 hasOn = true;  
             }
        })

        if (!hasOn&&json.response.relay1._text==="1"){
            //tat di
            control.switchRelay(1).then(data=>{
                console.log('1 off')
            });
        }

        hasOn = false;
        schedulers.relay2.forEach(el=>{
            if (el.start<=hh24mi&&hh24mi<el.end)
            {
               if (json.response.relay2._text==="0"){
                    //bat len
                    control.switchRelay(2).then(data=> console.log('2 on'));
                }     
                el.current_in = true;   
                hasOn = true;  
            }
        })

        if (!hasOn&&json.response.relay2._text==="1"){
            //tat di
            control.switchRelay(2).then(data=>{
                console.log('2 off')
            });
        }

        
    })
    .catch(e=>{
        console.log(e);
    })

});

console.log("Start!");

