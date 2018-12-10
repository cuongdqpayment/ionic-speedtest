#thuc hien build IOS,
#npm i
#ionic cordova platform remove ios
#ionic cordova platform add ios --save
ionic cordova build ios --prod --release
#Open xcode select <project_name>.xcodeproj 
#File --> Project settings --> Build system = Legacy Build System
#project navigator -> select <project name> --> targets --> select <projectname> 
#in tab General --> go to row: signing --> select team --> add account registered with apple for deverloper
# run build and install in ioss
