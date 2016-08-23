# regObs | Ionic
Ionic version of regObs.

## Requirements to get up and running
These are required to start developing:

* Node.js (0.12.7 and up)

### Installation
After you have installed [node.js](https://nodejs.org), boot up a command prompt and run the following (make sure to use sudo, if you are on mac/linux):

    npm install -g gulp bower cordova ionic

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

## App token
To use the regObs API, you need a valid app token. Request one from the regobs team. When you have a valid app token, create file `secret.json` in the folder `www/app/json`. The file should have the following format:

    {
    	"apiKey": "your app token here"
    }

## Production deployment
When deploying to production, remember to remove the cordova-plugin-console plugin, as this is meant purely for debugging purposes. This can be done by running `cordova plugin rm cordova-plugin-console`. It will still remain in the package.json file, and therefore be installed on fresh pulls of the repo, or when you run `ionic state reset`.

### Production deployment ios
* Install as above on a mac
* Make sure config.xml is on the format `<widget id="nve.varsom" version="302" ios-CFBundleVersion="306"`
* `ionic build ios`
* The resulting Xcode project under platforms/ios can be opened in Xcode
* To run in emulator from command line `ionic emulate ios`

### Production deployment android
* Make sure to have the android sdk installed
* `ionic platform add android` if not already added
* `ionic build android --release`
* Resulting in apk under platforms/android/build/outputs/apk
* navigate to the folder
* Sign apk `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore nve.keystore .\android-release-unsigned.apk regobs`
* Optimize it `{Android SDK location}\android-sdk\build-tools\{version}\zipalign.exe -v 4 .\android-release-unsigned.apk regobs.apk`
* Upload resulting regobs.apk via Google Play Developer console

### Additional info
[You can read more info on deployment here](http://ionicframework.com/docs/guide/publishing.html)

