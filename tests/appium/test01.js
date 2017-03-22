var yiewd = require("yiewd");
var chai = require("chai");
var expect = chai.expect;

var debugging = false;

var timeouts = {
    appium: debugging ? 60 : 10,              // Timeout before Appium stops the app
    framework: 1000 * (debugging ? 600 : 30), // Timeout for completing each test  
};

// Object to store the names of the frameworks once
var frameworks = {
    "mocha" : "mocha",
    "jasmine" : "jasmine"  
};

// Set this variable according to the framework you're using
//var framework = frameworks.mocha;
var framework = frameworks.jasmine;

var config = {};

config.android19Hybrid = { 
    automationName: 'Appium',
    browserName: '',
    platformName: 'Android',
    platformVersion: '6.0',    // API level integer, or a version string like '4.4.2'
    autoWebview: true,
    deviceName: 'any value; Appium uses the first device from *adb devices*',  
    app: "bin\\Android\\Debug\\android-debug.apk",
    newCommandTimeout: timeouts.appium
}; 

var appDriver  = yiewd.remote({
    hostname: 'localhost',
    port: 4723
});

// [Note 5]
describe ("Main tests", function () {
    // [Note 2 again]
    // Set the timeout in the framework
    switch (framework) {
        case frameworks.mocha:
            this.timeout(timeouts.framework);
            break;

        case frameworks.jasmine:
            jasmine.DEFAULT_TIMEOUT_INTERVAL = timeouts.framework;
            break;
    }

    beforeAll(function (done) {
        //Jasmine: beforeAll(function* (done) {
        appDriver.run(function* () {
            var session = yield this.init(config.android19Hybrid);
            yield this.sleep(3000);
            done();
        });
    });

    afterAll(function (done) {
        //Jasmine: afterAll(function* (done) {
        appDriver.run(function* () {
            yield appDriver.quit();
            done();
        });
    });


    // [Notes 6, 7]
    it ('displays start wizard on startup', function (done) {
        appDriver.run(function* () {
            yield this.sleep(3000);
            var elem = yield this.elementById('start-wizard-slides');
            var isVisible = yield elem.isDisplayed();
            expect(isVisible).to.equal(true);
            done();
        });
    });
});