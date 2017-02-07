describe("AppSettingsTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    var store = {};

    beforeEach(function () {
        module('RegObs');
        spyOn(localStorage, 'getItem').and.callFake(function (key) {
            return store[key];
        });
        spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
            store[key] = value;
        });
    });

    afterEach(function () {
        store = {};
    });

    it("Undefined local storage returns new default value", inject(function (AppSettings) {
        AppSettings._defaults = { testprop:'123'};
        AppSettings.load();

        expect(AppSettings.data.testprop).toEqual('123');
        expect(JSON.parse(store.regobsAppSettings).testprop).toEqual('123');
    }));

    it("Undefined local storage returns new nested default value", inject(function (AppSettings) {
        AppSettings._defaults = { testprop: [{ key: 1, value: 1 }, { key: 2, value: 2 }] };
        AppSettings.data = {};
        store = { 'regobsAppSettings': JSON.stringify({ testprop: [{ key: 1, value: 1 }] }) };
        AppSettings.load();

        expect(AppSettings.data.testprop.length).toEqual(2);
        expect(AppSettings.data.testprop[0].key).toEqual(1);
        expect(AppSettings.data.testprop[0].value).toEqual(1);
        expect(AppSettings.data.testprop[1].key).toEqual(2);
        expect(AppSettings.data.testprop[1].value).toEqual(2);
    }));
});