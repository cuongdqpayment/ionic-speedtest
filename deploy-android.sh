#ionic cordova plugin save
#ionic cordova platform remove android
#ionic cordova platform add android --save
#ionic cordova build android --prod --release
ionic cordova run android --device

#1. build --> release
#ionic cordova build android --prod --release

#2. get file: <app>\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk

#3. use keytoll create key pair for sign:
# keytool -genkey -v -keystore cng-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
# get file cng-release-key.keystore with pass when type

#4. sign apk file:
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore cng-release-key.keystore speedtest-app-unsigned.apk speedtest-app

#5. align file apk: 
# zipalign -v 4 speedtest-app-unsigned.apk speedtest-app.apk

#6. upload into playstore
