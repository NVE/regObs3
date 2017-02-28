describe("UtilityTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    var mockedAppService, mockedAppLogging, mockedUserService;

    beforeEach(module('RegObs', function ($provide, UtilityProvider) {
        mockedAppService = {
            save: jasmine.createSpy()
        };
        mockedAppLogging = {
            log: jasmine.createSpy(),
            debug: jasmine.createSpy()
        };
        mockedUserService = {
            
        };

        $provide.value('AppSettings', mockedAppService);
        $provide.value('User', mockedUserService);
        $provide.value('AppLogging', mockedAppLogging);

        var utils = UtilityProvider.$get();
        utils.shouldUpdateKdvElements = function() {
            return false;
        };
        $provide.value('Utility', utils);
    }));

    var store = {};

    beforeEach(inject(function ($httpBackend) {
        spyOn(localStorage, 'getItem').and.callFake(function (key) {
            return store[key];
        });
        spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
            store[key] = value;
        });
        $httpBackend.whenGET(/.*/).respond('');
    }));

    afterEach(function () {
        store = {};
    });


    it("test isEmpty: undefined object returns true", inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty(undefined)).toEqual(true);
    }));

    it("test isEmpty: null returnes true",  inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty(null)).toEqual(true);
    }));

    it("test isEmpty: empty array returnes true",  inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty([])).toEqual(true);
    }));

    it("test isEmpty: object with no properties returns true",  inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty({})).toEqual(true);
    }));

    it("test isEmpty: object with empty properties returns true", inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty({ prop1: null, prop2: undefined, prop3: [], prop4: '' })).toEqual(true);
    }));

    it("test isEmpty: number returns false", inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty(2)).toEqual(false);
    }));

    it("test isEmpty: object with string property returns false", inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty({testprop:"This is a test"})).toEqual(false);
    }));

    it("test isEmpty: nested object with empty properties returns true",  inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isEmpty({ prop1: { prop1: null, prop2: undefined, prop3: [], prop4: '' }, prop2: undefined, prop3: [], prop4: '' })).toEqual(true);
    }));

    it("test getKdvElements: on app update, when new kdv elements exists, update old values from local storage", function (done) {
        inject(function (Utility, AppSettings, $rootScope, $q) {
            store = {
                'kdvDropdowns': '{"KdvRepositories":{"Dirt_DangerSignKDV":"Some array of old values"}}'
            };

            Utility.getAppEmbeddedKdvElements = function () {
                return $q(function (resolve) {
                    resolve({"KdvRepositories":{"Some_New_App_KDV":"Some array of new values"}});
                });
            };
            Utility.getKdvElements()
                    .then(function (result) {
                        expect(result.data.KdvRepositories.Some_New_App_KDV).toEqual("Some array of new values"); //expect new kdv elements to be there
                        expect(result.data.KdvRepositories.Dirt_DangerSignKDV).toEqual("Some array of old values"); //expect old kdv element to still be present
                        done();
                    });

            $rootScope.$apply();
        });
    });

    it("test getKdvElements: no kdv elements in local storage returns embedded kdv elements", function (done) {
        inject(function (Utility, AppSettings, $rootScope, $q) {
            store = {
                'kdvDropdowns': null
            };

            Utility.getAppEmbeddedKdvElements = function () {
                return $q(function (resolve) {
                    resolve({ "KdvRepositories": { "Embedded_App_KDV": "Some kdv value" } });
                });
            };
            Utility.getKdvElements()
                    .then(function (result) {
                        expect(result.data.KdvRepositories.Embedded_App_KDV).toEqual("Some kdv value"); //expect embedded kdv value to exist
                        done();
                    });

            $rootScope.$apply();
        });
    });

    it("test refreshKdvElements: merges existing values with new values from API and is saved to storage", function (done) {
        inject(function (Utility, AppSettings, $rootScope, $q) {
            Utility.getAppEmbeddedKdvElements = function () {
                return $q(function (resolve) {
                    resolve({"KdvRepositories": { "Some_Old_KDV": "Some array of old values" }});
                });
            };
            Utility._getDropdownsFromApi = function() {
                return $q(function (resolve) {
                    resolve({"KdvRepositories": { "Some_New_API_Kdv": "Some array of new values" }});
                });
            };

            Utility._refreshKdvElements()
                    .then(function () {
                        var storeObs = JSON.parse(store.kdvDropdowns);
                        expect(storeObs.KdvRepositories["Some_Old_KDV"]).toEqual("Some array of old values");
                        expect(storeObs.KdvRepositories["Some_New_API_Kdv"]).toEqual("Some array of new values");
                        done();
                    });

            $rootScope.$apply();
        });
    });

    it("test refreshKdvElements: new values from API overrites exsting items in storage", function (done) {
        inject(function (Utility, AppSettings, $rootScope, $q) {
            Utility.getAppEmbeddedKdvElements = function () {
                return $q(function (resolve) {
                    resolve({ "KdvRepositories": { "Some_Existing_Kdv": [1, 2, 3] } });
                });
            };
            Utility._getDropdownsFromApi = function () {
                return $q(function (resolve) {
                    resolve({ "KdvRepositories": { "Some_Existing_Kdv": [2,3,4] } });
                });
            };

            Utility._refreshKdvElements()
                    .then(function () {
                        var storeObs = JSON.parse(store.kdvDropdowns);
                        expect(storeObs.KdvRepositories["Some_Existing_Kdv"]).toEqual([2, 3, 4]);
                        done();
                    });

            $rootScope.$apply();
        });
    });

    it("test isObservation: image is not counted as observation", inject(function (Utility) {
        // Invoke the unit being tested as necessary
        expect(Utility.isObservation('Picture')).toEqual(false);
    }));

    it("test _filterZeroKdvElements: -1,  0, 100, 200, 300, 400 is filtered", inject(function (Utility) {
        var arr = [{ Id: -1 }, { Id: 0 }, { Id: 1 }, { Id: 10 }, { Id: 11 }, { Id: 100 }, { Id: 101 }, { Id: 111 }, { Id: 200 }, { Id: 201 }, { Id: 300 }, { Id: 400 }, { Id: 500 }, { Id: 600 }, { Id: 1000 }];
        var result = Utility._filterZeroKdvElements(arr);
        var expected = [{ Id: 1 }, { Id: 10 }, { Id: 11 }, { Id: 101 }, { Id: 111 }, { Id: 201 }];
        var isSame = true;

        for (var i = 0; i < expected.length; i++) {
            if (result[i].Id !== expected[i].Id) {
                isSame = false;
            }
        }
        expect(isSame).toEqual(true);
    }));
});