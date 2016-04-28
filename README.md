# regObs | Ionic
Ionic version of regObs.

## Requirements to get up and running
These are required to start developing:

* Node.js (0.12.7 and up)
* Gulp
* Bower
* Cordova
* Ionic

### Installation
After you have installed [node.js](https://nodejs.org), boot up a command prompt and run the following (make sure to use sudo, if you are on mac/linux):

    npm install -g gulp
    npm install -g bower
    npm install -g cordova
    npm install -g ionic

## Getting Started
1. Clone the repo
2. Run `npm install`

## Test deployment
In browser on local machine:
run `ionic serve`

In Ionic View app on device:
1. Run `ionic upload`
2. Log into your ionic.io accout
3. Open ionic view and click download files, and view app

## Production deployment ios
1. Install as above on a mac
2. `ionic build ios`
3. The resulting Xcode project under platforms/ios can be opened in Xcode
4. To run in emulator from command line `ionic emulate ios`

## Production deployment android
0. Make sure to have the android sdk installed
1. `ionic platform add android` if not already added
2. `ionic build android --release`
3. Resulting in apk under platforms/android/build/outputs/apk
4. navigate to the folder
5. Sign apk `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore nve.keystore .\android-release-unsigned.apk regobs`
6. Optimize it `{Android SDK location}\android-sdk\build-tools\{version}\zipalign.exe -v 4 .\android-release-unsigned.apk regobs.apk`
7. Upload resulting regobs.apk voa Google Play Developer console
