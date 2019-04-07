import { Component } from '@angular/core';
import { ApiLocationService } from '../../services/apiLocationService';

@Component({
  selector: 'page-cordova-info',
  templateUrl: 'cordova-info.html'
})
export class CordovaPage {

  constructor(
    private apiLocation: ApiLocationService
  ) { }

  ngOnInit() {
    this.apiLocation.getPlatform();
    this.apiLocation.getDevice();
    this.apiLocation.getSim();
    this.apiLocation.getNetwork();

  }

}
