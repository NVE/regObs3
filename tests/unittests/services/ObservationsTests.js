describe("ObservationsTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(module('RegObs'));

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
});