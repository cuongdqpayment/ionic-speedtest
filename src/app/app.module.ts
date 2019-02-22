import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { StorageServiceModule } from 'angular-webstorage-service';
import { SQLite } from '@ionic-native/sqlite';

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
import { ApiHttpPublicService } from '../services/apiHttpPublicServices';
import { ApiResourceService } from '../services/apiResourceServices';
import { RequestInterceptor } from '../interceptors/requestInterceptor';
import { ResponseInterceptor } from '../interceptors/responseInterceptor';
import { SpeedTestPage } from '../pages/speed-test/speed-test';
import { ApiSqliteService } from '../services/apiSqliteService';
import { ResultsPage } from '../pages/results/results';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { ApiMapService } from '../services/apiMapService';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    ResultsPage,
    TabsPage,
    SpeedTestPage,
    DynamicFormWebPage,
    DynamicListPage,
    DynamicFormMobilePage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    GoogleMapPage,
    SignaturePage,
    ArraySortPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StorageServiceModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    ResultsPage,
    TabsPage,
    SpeedTestPage,
    DynamicFormWebPage,
    DynamicListPage,
    DynamicFormMobilePage,
    DynamicCardSocialPage,
    DynamicMediasPage,
    DynamicListOrderPage,
    GoogleMapPage,
    SignaturePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    SQLite,
    ApiGraphService,
    ApiImageService,
    ApiAuthService,
    ApiStorageService,
    ApiSqliteService,
    ApiSpeedTestService,
    ApiHttpPublicService,
    ApiResourceService,
    ApiLocationService,
    ApiMapService,
    RequestInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true
    },
    {provide: ErrorHandler,
       useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
