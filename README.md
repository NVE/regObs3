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

	Please note that many plugins is not compatible with Ionic View, so it is not recommended to use this for more then internal testing.


## App token
To use the regObs API, you need a valid app token. Request one from the regobs team. When you have a valid app token, create file `secret.json` in the folder `www/app/json`. The file should have the following format:

    {
    	"apiKey": "your app token here"
    }

## NVE keystore
You need a file called nve.keystore in the root of your project. Ask regObs management to get the keystore file in order to build for Android.

## Production deployment

### Production deployment ios
* Install as above on a mac
* The gulp tasks scripts and run-scripts-and-update-config will automatically set version number correct in `/app/json/version.js` and `config.xml`. The version number is taken from `package.json`.
* The hook `regobs_path_plist.js` will automatically format the Config version number to a numric format when building for ios.
* `ionic build ios`
* The resulting Xcode project under platforms/ios can be opened in Xcode
* To run in emulator from command line `ionic emulate ios`

### Production deployment android (without Cordova Tools for Visual Studio)
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

## How to set up build using Cordova Tools for Visual Studio
Read more about installation and setup [here](https://taco.visualstudio.com/)

* Install taco-remote build on a Mac and run `remotebuild --secure false`.
* Set up Mac IP address and port number in `Visual Studio -> Tools -> Options -> Tools for Apache Cordova -> IOS Configuration`.
* After build you can open xcode project from the cordova/build/tasks/build number directory and debug on device.
* Archive build and upload to iTunes [directly from xcode or use Application Loader](https://developer.apple.com/library/content/documentation/LanguagesUtilities/Conceptual/iTunesConnect_Guide/Chapters/UploadingBinariesforanApp.html).
* APK's for Android is automatically signed if you have a valid `nve.keystore` file in the root of the project and also `build.json` configuration file. Ask the regObs-management to get a valid keystore and build.json configuration.

## How to Alfa and Beta-test the app before deploying to production

### Testing iOS devices
* Alfa-testers are `iTunes Connect` users set up on the `NVE iTunes account`. These users is listed under `iTunes Connect Users` in `TestFlight`.
* Beta testers is external tester that can be added directly to the `External Testers` group in `TestFlight`.
* Please note that a new version that is uploaded to Beta program (External testers) needs to be reviewed before testing. This normally takes around 24 hours.

### Testing Android devices
* Upload release APK to Alfa to start internal alfa-testing. Only users in test-users list is allowed to download alfa-version from play store.
* To join the Beta program, any user that follows [this link](https://play.google.com/apps/testing/no.nlink.nve) can join the test program. The user will see `Beta tester` in `Google Play` when installing the app.

## How to run unit tests
* Unit tests are set up using [karma](https://karma-runner.github.io/1.0/index.html) and [jasmine](https://jasmine.github.io/).
* Unit tests are located in the `\tests\unittests` folder.
* Karma configuration is in `karma.conf.js`.
* Run unit tests by staring gulp task `test`. Code coverage will be generated in the `coverage` folder.
* Support for Appium tests is also added, but no tests are yet written. Read more [here](https://taco.visualstudio.com/en-us/docs/uitest-05-designing-tests/)
