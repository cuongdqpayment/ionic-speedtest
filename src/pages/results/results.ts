import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { ApiSqliteService } from '../../services/apiSqliteService';
import { ApiStorageService } from '../../services/apiStorageService';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html'
})
export class ResultsPage {

  results = [];
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

  constructor(
    private navCtrl: NavController
    , private platform: Platform
    , private apiStorage: ApiStorageService
    , private apiSqlite: ApiSqliteService
    , private navParams: NavParams) { }

  ngOnInit() {

    this.dynamicList = this.navParams.get("form") ? this.navParams.get("form") : this.dynamicList;

    this.dynamicList.items = this.results;

    if (this.platform.is("cordova")){

    }else{
      this.results = this.apiStorage.getResults();
      console.log('results',this.results);
    }
  }

}
