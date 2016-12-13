describe("LocalStorageTests", function () {
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

    it("Get key returns windows storage item", inject(function (LocalStorage) {
        store = {
            'any key': 'Mock value'
        };

        var result = LocalStorage.get('any key');

        expect(result).toEqual('Mock value');
    }));

    it("Get key not in storage returns default value", inject(function (LocalStorage) {
        var result = LocalStorage.get('any key', 'default value');

        expect(result).toEqual('default value');
    }));
});