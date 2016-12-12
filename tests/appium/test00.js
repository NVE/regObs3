var wd = require("wd");
var appDriver = wd.remote({
    hostname: '127.0.0.1',
    port: 4723,
});

var config = {};

config.android19Hybrid = {
    automationName: 'Appium',
    browserName: '',
    platformName: 'Android',
    platformVersion: 19,// API level integer, or a version string like '4.4.2'
    autoWebview: true,
    deviceName: 'any value; Appium uses the first device from *adb devices*',
    app: "..\\..\\bin\\Android\\Debug\\android-debug.apk"
};

appDriver.init(config.android19Hybrid);