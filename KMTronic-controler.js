
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
    relay1:[
                {start:"0700", end:"0900"},
                {start:"1000", end:"1200"},
                {start:"1300", end:"1400"},
                {start:"1500", end:"1600"},
                {start:"1700", end:"1800"}
            ],
    relay2:[
                {start:"0700", end:"0730"},
                {start:"1100", end:"1200"},
                {start:"1700", end:"1730"}
            ]
}

const cron = require("node-cron");

cron.schedule("*/5 * * * * *", function() {

    control.getStatus()
    .then(xml=>{
        
        let xmlParser = require('xml-js');
        let json = JSON.parse(xmlParser.xml2json(xml,{compact: true, spaces: 3}))
        let curDate =new Date(); 
        let hh24mi =  (""+curDate.getHours()).padStart(2,0)+(""+curDate.getMinutes()).padStart(2,0);
        
        //console.log("running a task every 5 seconds", hh24mi);
        
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
