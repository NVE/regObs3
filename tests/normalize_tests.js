// First argument to 'describe' (which is defined by Jasmine) is the testing module that will
// appear in test reports. The second argument is a callback containing the individual tests.

describe("testJSONParse", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 

    it("json parses normally", function () {
        // Invoke the unit being tested as necessary
        var json = '{"Name": "Maria", "PersonalIdentifier": 2111858}';
        var norm = JSON.parse(json);

        // Check the results; "expect" and toEqual are Jasmine methods.
        expect(norm.Name).toEqual("Maria");
        expect(norm.PersonalIdentifier).toEqual(2111858);
    });

    it("test fails", function () {
        // Invoke the unit being tested as necessary
        var json = '{"Name": "Maria", "PersonalIdentifier": 2111858}';
        var norm = JSON.parse(json);

        // Check the results; "expect" and toEqual are Jasmine methods.
        expect(norm.Name).toEqual("Maria-failed");
    });
});