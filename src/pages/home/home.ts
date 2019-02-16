import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ApiSqliteService } from '../../services/apiSqliteService';
import { TabsPage } from '../tabs/tabs';
import { SpeedTestPage } from '../speed-test/speed-test';

/* var dataType = {};

dataType.integer = 'INTEGER';
dataType.text = 'TEXT';
dataType.numeric='NUMERIC';
dataType.real = 'REAL';
dataType.blob = 'BLOB'; */


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(private navCtrl: NavController
    , private apiSqlite: ApiSqliteService) { }

  ngOnInit() {
    this.apiSqlite.createTable({
      name: "SPEEDTEST"
      , cols: [
        {
          name: 'id',
          type: 'INTEGER',
          option_key: 'PRIMARY KEY AUTOINCREMENT',
          description: 'Mã tự tăng'
        }
        ,
        {
          name: 'time',
          type: 'INTEGER',
          option_key: '',
          description: 'Lưu thời gian test để tìm'
        }
        ,
        {
          name: 'result',
          type: 'BLOB',
          option_key: '',
          description: 'Lưu trữ kết quả test từ máy'
        }
      ]
    })
    .then(data => { console.log('data', data) 
      this.navCtrl.setRoot(SpeedTestPage);
    })
    .catch(err => { console.log('err', err) 
      this.navCtrl.setRoot(TabsPage);
    })


  }



}
