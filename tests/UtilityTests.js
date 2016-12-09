describe("UtilityTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(module('RegObs'));

    var utility;
    // Setup the mock service in an anonymous module.
    beforeEach(inject(function (Utility) {
        //$provide.value('oneOfMyOtherServicesStub', {
        //    someVariable: 1
        //});
        utility = Utility;
    }));


    it("undefined object returns empty", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty(undefined)).toEqual(true);
    });
});