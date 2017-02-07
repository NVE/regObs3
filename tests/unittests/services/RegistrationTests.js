describe("RegistrationTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(function () {
        module('RegObs');
    });

    afterEach(function () {
    });

    it("New registration is empty", inject(function (Registration) {
        Registration.createNew(10);
        var result = Registration.isEmpty();
        expect(result).toEqual(true);
    }));

    it("New registration has observation length 0", inject(function (Registration) {
        Registration.createNew(10);
        var result = Registration.getObservationsLength();
        expect(result).toEqual(0);
    }));

    it("New registration with freetext observation has observation length 1", inject(function (Registration) {
        Registration.createNew(10);
        Registration.data.GeneralObservation = { ObsComment: "Test comment" };
        var result = Registration.getObservationsLength();
        expect(result).toEqual(1);
    }));

    it("New registration with freetext observation and picture has observation length 1", inject(function (Registration, Pictures) {
        Registration.createNew(10);
        Registration.data.GeneralObservation = { ObsComment: "Test comment" };
        Pictures.addPicture('GeneralObservation', 'dummydata');
        var result = Registration.getObservationsLength();
        expect(result).toEqual(1);
    }));
});