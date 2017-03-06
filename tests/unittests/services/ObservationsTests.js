describe("ObservationsTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(module('RegObs'));

    beforeEach(inject(function ($httpBackend) {
        $httpBackend.whenGET(/.*/).respond('');
    }));

    var obs;
    // Setup the mock service in an anonymous module.
    beforeEach(inject(function (Observations) {
        //$provide.value('oneOfMyOtherServicesStub', {
        //    someVariable: 1
        //});
        obs = Observations;
    }));

    it("_validateRegistrationDate: date older than 3 days returns false", function () {
        obs._getShowObservationsDaysBack = function() {
            return 3;
        };
        var dateToTest = '2000-01-09T12:30:46.363'; //This is older than 3 days
        var result = obs._validateRegistrationDate(dateToTest);
        expect(result).toEqual(false);
    });

    it("_validateRegistrationDate: date newer than 3 days returns true", function () {
        obs._getShowObservationsDaysBack = function () {
            return 3;
        };
        var dateToTest = '2099-01-09T12:30:46.363'; //This is newer than 3 days
        var result = obs._validateRegistrationDate(dateToTest);
        expect(result).toEqual(true);
    });

    it("_validateRegistrationDate: today and days back=0 (today) returns true", function () {
        obs._getShowObservationsDaysBack = function () {
            return 0;
        };
        var dateToTest = moment().toISOString(); //Today ISO string
        var result = obs._validateRegistrationDate(dateToTest);
        expect(result).toEqual(true);
    });

    it("_validateRegistrationDate: today and days back=-1 (tomorrow) returns false", function () {
        obs._getShowObservationsDaysBack = function () {
            return -1; //tomorrow
        };
        var dateToTest = moment().toISOString(); //Today ISO string
        var result = obs._validateRegistrationDate(dateToTest);
        expect(result).toEqual(false);
    });

    it("_validateRegistrationDate: today and one day back at midnight returns true", function () {
        obs._getShowObservationsDaysBack = function () {
            return 1; //one day back
        };
        obs._now = function() {
            return moment('2017-01-09T12:30:46.363');
        }
        var dateToTest = '2017-01-08T00:00:00.00'; //one day back at midnight
        expect(obs._validateRegistrationDate(dateToTest)).toEqual(true);
    });

    it("_validateRegistrationDate: one day back returns false when obs is two days back", function () {
        obs._getShowObservationsDaysBack = function () {
            return 1; //one day back
        };
        obs._now = function () {
            return moment('2017-01-09T12:00:00.01'); //today at noon
        }
        var dateToTest = '2017-01-07T11:00:00.000'; //two days back
        expect(obs._validateRegistrationDate(dateToTest)).toEqual(false);
    });

    it("_validateRegistrationDate: invalid day returns false", function () {
        obs._getShowObservationsDaysBack = function () {
            return 1; //one day back
        };
        var dateToTest = 'invalid date string';
        expect(obs._validateRegistrationDate(dateToTest)).toEqual(false);
    });

    it("_findOldItemsToDelete test one registration that is valid", inject(function (Observations) {
        
        var now = '2017-01-16T00:00:00.000';
        spyOn(Observations, '_now').and.callFake(function () {
            return moment(now);
        });
        var registrations = [{ RegId: 1, DtObsTime: '2017-01-16T00:00:00.000' }];

        var result = Observations._findOldItemsToDelete(registrations);
        expect(result.keep.length).toEqual(1);
        expect(result.old.length).toEqual(0);
    }));

    it("_findOldItemsToDelete test one registration that is invalid", inject(function (Observations) {

        var now = '2017-01-17T00:00:00.000';
        spyOn(Observations, '_now').and.callFake(function () {
            return moment(now);
        });
        var registrations = [{ RegId: 1, DtObsTime: '2017-01-01T00:00:00.000' }];

        var result = Observations._findOldItemsToDelete(registrations);
        expect(result.keep.length).toEqual(0);
        expect(result.old.length).toEqual(1);
    }));

    it("_findOldItemsToDelete test one registration that is valid and one invalid with parameter", inject(function (Observations) {

        var now = '2017-01-17T00:00:00.000';
        spyOn(Observations, '_now').and.callFake(function () {
            return moment(now);
        });
        var registrations = [{ RegId: 1, DtObsTime: '2017-01-16T00:00:00.000' }, { RegId: 2, DtObsTime: '2017-01-15T00:00:00.000' }];

        var result = Observations._findOldItemsToDelete(registrations, 1);
        expect(result.keep.length).toEqual(1);
        expect(result.keep[0].RegId).toEqual(1);
        expect(result.old.length).toEqual(1);
        expect(result.old[0].RegId).toEqual(2);
    }));


    it("_validateRegistrationDate should use days back specified", inject(function (Observations) {
        spyOn(Observations, '_getShowObservationsDaysBack')
               .and.callFake(function () {
                   return 0;
               });

        var now = '2017-02-17T00:00:00.000';
        spyOn(Observations, '_now').and.callFake(function () {
            return moment(now);
        });
        var yesterday = '2017-02-16T00:00:00.000';

        var resultWithParameter = Observations._validateRegistrationDate(yesterday, 1);
        var resultWithOutParameter = Observations._validateRegistrationDate(yesterday);
        expect(resultWithParameter).toEqual(true);
        expect(resultWithOutParameter).toEqual(false);
    }));

    it("removeOldObservationsFromPresistantStorage should delete items that is older than 15 days", function (done) {
        inject(function (Observations, $q, $rootScope) {

            var registrations = [{ RegId: 1, DtObsTime: '2017-02-16T00:00:00.000' }, { RegId: 2, DtObsTime: '2017-02-01T00:00:00.000' }];

            spyOn(Observations, '_getRegistrationsFromPresistantStorage')
                .and.callFake(function() {
                    return $q(function (resolve) { resolve(registrations); });
                });

            var itemsToDelete = [];
            var itemsToKeep = [];

            spyOn(Observations, '_now').and.callFake(function () {
                return moment('2017-02-17T00:00:00.000');
            });

            spyOn(Observations, '_deleteAllImagesForRegistration').and.callFake(function (item) {
                return $q(function(resolve) {
                    itemsToDelete.push(item);
                    resolve();
                });
            });

            spyOn(Observations, '_storeRegistrations').and.callFake(function (registrations) {
                return $q(function (resolve) {
                    itemsToKeep = registrations;
                    resolve();
                });
            });

            Observations.removeOldObservationsFromPresistantStorage()
                .then(function () {
                    expect(itemsToKeep.length).toEqual(1);
                    expect(itemsToKeep[0].RegId).toEqual(1);
                    expect(itemsToDelete.length).toEqual(1);
                    expect(itemsToDelete[0].RegId).toEqual(2);
                    done();
                });

            $rootScope.$apply(); //needs to be called to trigger $q promise
        });
    });
});