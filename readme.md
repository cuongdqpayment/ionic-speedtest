1. Cai dat IPhone
- Co tai khoan Apple
- ionic cordova platform add ios --save
- Xcode 

Xcode 10: A valid provisioning profile for this executable was not found

"File" > "Project Settings..." and then select "Legacy Build System" from the "Build System" dropdown.

- Van de Cors trong IOS :

*First, open config.xml and add the following properties

<feature name="CDVWKWebViewEngine">
<param name="ios-package" value="CDVWKWebViewEngine" />
</feature>
<preference name="CordovaWebViewEngine" value="CDVWKWebViewEngine" />

*then run the following commands – I hope you are familiar with this commands

ionic cordova plugin remove cordova cordova-plugin-ionic-webview --save
rm -rf platforms/
rm -rf plugins/
ionic cordova build ios

* Notes:
In iOS, there have been two webviews for a few years now, UIWebView and WKWebView. Historically, Ionic apps have used UIWebView, but no longer. Ionic now uses WKWebview by default when building for iOS.

We strongly believe WKWebview is the best option for any app, as it features many improvements over the older, legacy webview (UIWebView)

* SERVER:
res.header('Access-Control-Allow-Origin', '*'); //cho phep truy cap 
//IOS When enabling wkwebview, requests to a webserver are from "null" and therefore rejected even with Access-Control-Allow-Origin set to *
