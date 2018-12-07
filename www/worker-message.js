/**
 * File Worker in www
 */
var i=0;
var dlStatus = 0.0;
var dlProgress = 0.0;

this.addEventListener('message', function (e) {
    let data = JSON.parse(e.data);
    //console.log('commmand: ' + data.command);
    //console.log('message sent: ' + data.message);
    if (data.command === 'start') { // bat dau chay
        if (data.work === 'dowload_test'){
            //cong viec bat dau dowload 
            //thiet lap cac tham so chuan bi dowload
            
            setTimeout(() => {
                //cong viec bat dau
                /* postMessage(JSON.stringify({
                    command: 'reply',
                    results: 'Kết quả xử lý???',
                    message: 'Trả lời lệnh start dowload!'
                })); */
            }, 5000);
        }
    }else if (data.command === 'report') {
        //neu lenh report thi bao cao truoc tiep den Home/Main
        postMessage(e.data); //lay nguyen goc bao cao

    }else if (data.command === 'progress') { 
        //thong bao tien trinh
        //bao cao toc do, tien trinh la bao nhieu %
        //de hien thi dong ho
        //console.log('nhan lenh: ' + data.command);
        // dlProgress =  i++/100; //du lieu demo
        // dlStatus = Math.round(i * 10 * Math.random()) //du lieu demo
        if (
            data.data&&data.data.dlStatus
            &&data.data.dlProgress
            ){
                postMessage(JSON.stringify({
                    command: 'status',
                    results: {
                        testState: 1,
                        dlStatus: data.data.dlStatus, //toc do, 
                        dlProgress: data.data.dlProgress,
                    },
                    message: 'Lệnh trả lời trạng thái'
                }));
            }
        
    } else if (data.command === 'status') { // Neu lenh yeu cau lay trang thai thi tra loi ngay
        /* postMessage(JSON.stringify({
                    command: 'status',
                    results: {
                        testState: 1,
                        dlStatus: dlStatus, //toc do, 
                        dlProgress: dlProgress,
                    },
                    message: 'Lệnh trả lời trạng thái'
                })); */
    }
});