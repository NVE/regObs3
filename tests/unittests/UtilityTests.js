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


    it("test isEmpty: undefined object returns true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty(undefined)).toEqual(true);
    });

    it("test isEmpty: null returnes true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty(null)).toEqual(true);
    });

    it("test isEmpty: empty array returnes true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty([])).toEqual(true);
    });

    it("test isEmpty: object with no properties returns true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty({})).toEqual(true);
    });

    it("test isEmpty: object with empty properties returns true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty({prop1:null, prop2:undefined, prop3:[], prop4:''})).toEqual(true);
    });

    it("test isEmpty: nested object with empty properties returns true", function () {
        // Invoke the unit being tested as necessary
        expect(utility.isEmpty({ prop1: { prop1: null, prop2: undefined, prop3: [], prop4: '' }, prop2: undefined, prop3: [], prop4: '' })).toEqual(true);
    });
});