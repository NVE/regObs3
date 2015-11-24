# Issues / forbedringer
Badge på app icon dersom man har usendte registreringer?
Offline maps
Registrer ny bruker/Glemt passord

# regObs | Ionic
Ionic version of regObs.

## Requirements to get up and running
These are required to start developing:

* Node.js
* Gulp
* Bower
* Cordova
* Ionic

### Installation
After you have installed latest version of [node.js](https://nodejs.org/en/), boot up a command prompt and run the following (make sure to use sudo, if you are on mac/linux):

    npm install -g gulp
    npm install -g bower
    npm install -g cordova
    npm install -g ionic

## Getting Started
1. Clone the repo `git clone https://github.com/bgraphic/varsom-hybrid`
2. Run `npm install`

## Test deployment
In browser on local machine:
run `ionic serve`

In Ionic View app on device:
1. Run `ionic upload`
2. Share link with tester
3. Open ionic view and click download files, and view app

## Production deployment ios
1. `ionic platform add ios`
2. `ionic build ios`
3. The resulting Xcode project can be signed with proper keys
4. To run in emulator `ionic emulate ios`

## Production deployment android
1. `ionic platform add android`
2. `ionic build android`
3. Resulting in apk
4. To run on connected device: `ionic run android`
