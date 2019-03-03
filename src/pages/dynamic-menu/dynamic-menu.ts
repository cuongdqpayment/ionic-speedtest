import { Component, } from '@angular/core';
import { ApiMediaService } from '../../services/apiMediaService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-dynamic-menu',
  templateUrl: 'dynamic-menu.html',
})
export class DynamicMenuPage {

  dynamicTree: any ={
    title:"Trang chủ menu"
    , items: [
      //1.
      {   short_detail:{
              avatar: "assets/imgs/ca_nau.jpg"
              ,h1:"Cuong.dq"
              ,p:"Cần thiết là nội dung chi tiết đây, có thể viết tóm lượt nhiều thông tin cũng được"
              ,note:"1h ago"
              ,action: {color:"primary", icon: "more", next:"MORE" }
          }
          ,title:"Chi tiết các ảnh hiển thị"
          ,note:"Bài viết chi tiết kết thúc"
          ,medias: [
              {image:"assets/imgs/img_forest.jpg"
                  ,title:"Miền quê yêu dấu"
                  ,h1: "Chốn yên bình"
                  ,p: "Là nơi bình yên nhất. Bạn có thể dạo bước trên con đường rợp bóng mát thanh bình đến lạ"}
              ,{image:"assets/imgs/anh_vua.png"
                  ,h1: "Nội dung bài viết vể cao tốc"
                  ,p: "Một bài viết về cao tốc đây nhé"}
              ,{image:"assets/imgs/ca_nau.jpg"
                  ,h2: "Cá Nâu ở Quê Mỹ lợi"
                  ,p: "Cá ngày mồng 3 tết ở quê"}
              ,{image:"assets/imgs/ca_the.jpg"
                  ,h1: "Cá Thệ ở Quê Mỹ lợi"
                  ,p: "Cá ngày mồng 3 tết ở quê, Cá thệ kho dưa rất tuyệt vời"}
              ,{image:"assets/imgs/img_forest.jpg"}
              ,{image:"assets/imgs/anh_nho.png"
                  ,h1: "Mùa trái cây chín đỏ"
                  ,p: "Trái cây vựa, miền quê nhiều cá lắm đó"}
          ]
          ,results:{ 
              likes:{
                  like:["Cuong.dq","abc","xyz"]
                  ,love:["love"]
                  ,unlike:["dog"]
                  ,sad:["cat"]
                  ,angery:["tiger"]
              }
              ,comments:[
                  {name:"cuong.dq"
                  ,comment:"day la cai gi vay"
                  ,time:new Date().getTime()
                  }
                  ,
                  {name:"cu.dq"
                  ,comment:"la cai nay do nhe"
                  ,time:new Date().getTime()
                  }
              ]
              ,shares:[
                  {name:"cuong.dq"
                  ,comment:"day la cai gi vay"
                  ,time:new Date().getTime()
                  }
                  ,
                  {name:"cu.dq"
                  ,comment:"la cai nay do nhe"
                  ,time:new Date().getTime()
                  }
              ]
              
          }
          ,actions:{
              like: {name:"LIKE", color:"primary", icon: "thumbs-up", next:"LIKE"}
              ,comment: {name:"COMMENT", color:"primary", icon: "chatbubbles", next:"COMMENT"}
              ,share: {name:"SHARE", color:"primary", icon: "share-alt", next:"SHARE"}
          }
      }
    ]
  };

  userInfo:any;

  constructor(
    private apiMedia: ApiMediaService
    , private apiStorageService: ApiStorageService
  ) { }

  ngOnInit() {

    setTimeout(()=>{
      this.checkTokenLogin()
    },1000);

  }

  checkTokenLogin(){

    if (this.apiStorageService.getToken()) {
      this.apiMedia.authorizeFromResource
        (this.apiStorageService.getToken())
        .then(login => {
          if (login.status
            && login.user_info
            && login.token
            ) {
              this.userInfo = login.user_info;
              //console.log('userInfo:',this.userInfo);
              this.apiMedia.listFiles()
              .then(data=>{
                /* 
      device: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36"
      file_date: null
      file_name: "ca_nau.JPG"
      file_size: 354908
      file_type: "image/jpeg"
      func: "auth"
      id: 2
      ip: "10.151.50.36"
      status: 1
      sys: "admin"
      time: 1550717933463
      //https://c3.mobifone.vn/media/db/get-file
          url: "upload_files/201902/21/354908_ca_nau.JPG"
          user: "903500888" 
      */
                let items = [];
                if (data.length<10){
                  data.forEach(el => {
                    items.push(
                      {  
                        title: el.user
                        ,note: el.time
                        ,medias: [
                            {image:"https://c3.mobifone.vn/media/db/get-file/" + el.url
                            ,title:el.file_name
                            }
                        ]
                        ,actions:{
                            like: {name:"LIKE", color:"primary", icon: "thumbs-up", next:"LIKE"}
                            ,comment: {name:"COMMENT", color:"primary", icon: "chatbubbles", next:"COMMENT"}
                            ,share: {name:"SHARE", color:"primary", icon: "share-alt", next:"SHARE"}
                        }
                      })
                  });
                  
                }else{
                  let medias =[];
                  data.forEach(el => {
                    medias.push(  
                            {image:"https://c3.mobifone.vn/media/db/get-file" + el.url
                            ,title: el.file_name
                            })
                  });
                  items.push(
                    {  
                      medias: medias
                      ,actions:{
                          like: {name:"LIKE", color:"primary", icon: "thumbs-up", next:"LIKE"}
                          ,comment: {name:"COMMENT", color:"primary", icon: "chatbubbles", next:"COMMENT"}
                          ,share: {name:"SHARE", color:"primary", icon: "share-alt", next:"SHARE"}
                      }
                    })
                }

                this.dynamicTree.items = items;

              })
              .catch(err=>{
                console.log(err);
              })

          }
        })
        .catch(err => {});
    } else {
      this.userInfo = undefined;
    }

  }

  // Xử lý sự kiện click button theo id
  onClickAdd() {
    this.apiMedia.listFiles()
    .then(data=>{
      console.log(data);

    })
    .catch(err=>{
      console.log(err);
    })
  }

  onClickMedia(idx,item){
    console.log(idx,item);
    
  }

  onClickHeader(btn){
    console.log(btn);
  }
  
  onClickShortDetails(btn,item){
    console.log(btn, item);
  }

  onClickActions(btn,item){
    console.log(btn, item);
  }

}
