var i=0;
this.addEventListener('message', function (e) {
    let data = JSON.parse(e.data);
    //console.log('commmand: ' + data.command);
    //console.log('message sent: ' + data.message);
    if (data.command === 'status') { // Neu lenh yeu cau lay trang thai thi tra loi ngay
        postMessage(JSON.stringify({
                    command: 'status',
                    results: {
                        testState: 1,
                        dlStatus: Math.round(i * 10 * Math.random()),
                        dlProgress: i++/100,
                    },
                    message: 'Lệnh trả lời trạng thái'
                }));
    }else if (data.command === 'start') { // bat dau chay
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
        if (data.work === 'dowload_test'){
            /* setTimeout(() => {
                postMessage(JSON.stringify({
                    command: 'status',
                    results: 'Báo cáo kết quả download đây ',
                    message: 'Gửi kết quả dowload'
                }));
            }, 1000); */
        }
    }
});