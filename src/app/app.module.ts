import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { ArraySortPipe } from '../pipes/arrayOrder'

import { ApiSpeedTestService } from '../services/apiSpeedTestService';
import { ApiAuthService } from '../services/apiAuthService';
import { ApiImageService } from '../services/apiImageService';
import { ApiGraphService } from '../services/apiMeterGraphService';
import { ApiStorageService } from '../services/apiStorageService';
import { ApiLocationService } from '../services/apiLocationService'
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { DynamicFormWebPage } from '../pages/dynamic-form-web/dynamic-form-web';
import { DynamicListPage } from '../pages/dynamic-list/dynamic-list';
import { DynamicFormMobilePage } from '../pages/dynamic-form-mobile/dynamic-form-mobile';
import { DynamicCardSocialPage } from '../pages/dynamic-card-social/dynamic-card-social';
import { DynamicMediasPage } from '../pages/dynamic-medias/dynamic-medias';
import { DynamicListOrderPage } from '../pages/dynamic-list-order/dynamic-list-order';
import { SignaturePage } from '../pages/signature/signature';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    TabsPage,
    DynamicFormWebPage,
    DynamicListPage,
    DynamicFormMobilePage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    SignaturePage,
    ArraySortPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    TabsPage,
    DynamicFormWebPage,
    DynamicListPage,
    DynamicFormMobilePage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    SignaturePage
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
