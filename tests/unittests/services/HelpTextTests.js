describe("HelpTextsTests", function () {
    beforeEach(module('RegObs'));

    beforeEach(inject(function ($httpBackend) {
        $httpBackend.whenGET(/.*/).respond('');
    }));

    it("_getHelpTexts: when no local storage items found, return embedded help texts", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getLocalStorageHelpTexts')
                .and.callFake(function () {
                    return [];
                });
            spyOn(HelpTexts, '_getAppEmbeddedHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([{
                            "ApplicationId": "1b83d144-6a2c-499b-8bdd-d40149212415",
                            "RegistrationTID": 0,
                            "GeoHazardTID": 10,
                            "LangKey": 1,
                            "Text": "Hjelpetekst mangler."
                        }]);
                    });
                });

            HelpTexts._getHelpTexts().then(function (result) {
                expect(result.length).toEqual(1);
                expect(result[0].ApplicationId).toEqual("1b83d144-6a2c-499b-8bdd-d40149212415");
                expect(result[0].RegistrationTID).toEqual(0);
                expect(result[0].GeoHazardTID).toEqual(10);
                expect(result[0].LangKey).toEqual(1);
                expect(result[0].Text).toEqual("Hjelpetekst mangler.");
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: local storage items found, return local stored items", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getLocalStorageHelpTexts')
                .and.callFake(function () {
                    return [{
                        "ApplicationId": "1b83d144-6a2c-499b-8bdd-d40149212415-2",
                        "RegistrationTID": 99,
                        "GeoHazardTID": 101,
                        "LangKey": 10,
                        "Text": "Hjelpetekst mangler 2."
                    }];
                });
            spyOn(HelpTexts, '_getAppEmbeddedHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([{
                            "ApplicationId": "1b83d144-6a2c-499b-8bdd-d40149212415",
                            "RegistrationTID": 0,
                            "GeoHazardTID": 10,
                            "LangKey": 1,
                            "Text": "Hjelpetekst mangler."
                        }]);
                    });
                });

            HelpTexts._getHelpTexts().then(function (result) {
                expect(result.length).toEqual(1);
                expect(result[0].ApplicationId).toEqual("1b83d144-6a2c-499b-8bdd-d40149212415-2");
                expect(result[0].RegistrationTID).toEqual(99);
                expect(result[0].GeoHazardTID).toEqual(101);
                expect(result[0].LangKey).toEqual(10);
                expect(result[0].Text).toEqual("Hjelpetekst mangler 2.");
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: filters correct registration TID", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([
                            {
                                "RegistrationTID": 98,
                                "GeoHazardTID": 10,
                                "LangKey": 1
                            },
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                                "Text": "This is it!"
                            },
                            {
                                "RegistrationTID": 100,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                            }]);
                    });
                });


            HelpTexts._getHelpText(99, 10, 1).then(function (result) {
                expect(result).toEqual("This is it!");
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: filters correct GeoHazardTID", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 70,
                                "LangKey": 1
                            },
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                                "Text": "This is it!"
                            },
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 40,
                                "LangKey": 1,
                            }]);
                    });
                });


            HelpTexts._getHelpText(99, 10, 1).then(function (result) {
                expect(result).toEqual("This is it!");
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: filters correct LangKey", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 21
                            },
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                                "Text": "This is it!"
                            },
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 2,
                            }]);
                    });
                });


            HelpTexts._getHelpText(99, 10, 1).then(function (result) {
                expect(result).toEqual("This is it!");
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: undefined Texts returns text", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                            }]);
                    });
                });


            HelpTexts._getHelpText(99, 10, 1).then(function (result) {
                expect(result).toEqual('');
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: not found item returns empty text", function (done) {
        inject(function (HelpTexts, $q, $rootScope) {
            spyOn(HelpTexts, '_getHelpTexts')
                .and.callFake(function () {
                    return $q(function (resolve) {
                        resolve([
                            {
                                "RegistrationTID": 99,
                                "GeoHazardTID": 10,
                                "LangKey": 1,
                                "Text": "Help text"
                            }]);
                    });
                });


            HelpTexts._getHelpText(999, 999, 999).then(function (result) {
                expect(result).toEqual('');
                done();
            });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        })
    });

    it("_getHelpTexts: not found item returns empty text", function (done) {
        inject(function (HelpTexts, AppSettings, LocalStorage) {
            AppSettings._defaults = { env: 'testEnv regObs' };
            AppSettings.load();
            var result = HelpTexts._getLocalStorageHelpTexts();
            expect(resultKey).toEqual(HelpTexts._localStorageKey+ '_testEnv_regObs');
        })
    });

});