import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { ApiSpeedTestService } from '../services/apiSpeedTestService';
import { ApiAuthService } from '../services/apiAuthService';
import { ApiImageService } from '../services/apiImageService';
import { ApiGraphService } from '../services/apiMeterGraphService';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiLocationService } from '../services/apiLocationService'

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    ApiGraphService,
    ApiImageService,
    ApiAuthService,
    ApiStorageService,
    ApiSpeedTestService,
    ApiLocationService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
