describe("ObservationsTests", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 
    beforeEach(module('RegObs'));

    var testJson = JSON.parse("{\"RegId\":103789,\"DtObsTime\":\"2017-01-26T13:34:15.817\",\"DtRegTime\":\"2017-01-26T13:34:32.79\",\"DtChangeTime\":\"2017-01-26T13:34:32.42\",\"MunicipalNo\":\"0230\",\"MunicipalName\":\"LØRENSKOG\",\"ForecastRegionTid\":3044,\"ForecastRegionName\":\"Akershus\",\"LocationId\":47796,\"LocationName\":null,\"ObserverGroupId\":0,\"ObserverGroupName\":null,\"NickName\":\"Ukjent observatør\",\"ObserverId\":0,\"CompetenceLevelTid\":0,\"CompetenceLevelName\":\"\",\"SourceTid\":0,\"SourceName\":\"Ikke gitt\",\"GeoHazardTid\":10,\"GeoHazardName\":\"Snø\",\"UtmZone\":33,\"UtmEast\":273827,\"UtmNorth\":6642332,\"LangKey\":1,\"Registrations\":[{\"RegistrationTid\":10,\"RegistrationName\":\"Fritekst\",\"TypicalValue1\":\"\",\"TypicalValue2\":\"tester fritekst\"}],\"RegistrationCount\":1,\"PictureCount\":0,\"FirstPicture\":null,\"Latitude\":59.856532074084846,\"Longitude\":10.960907901492076}");

    it("test Observation: json parse validates json", inject(function (Observation) {
        var error;
        try {
            Observation.fromJson("some crappy data");
        } catch (e) {
            error = e;
        }
        expect(error.message).toEqual("Could not create Observation. Invalid json!");
    }));

    it("test Observation: json parse validates has RegId", inject(function (Observation) {
        var error;
        try {
            Observation.fromJson({});
        } catch (e) {
            error = e;
        }
        expect(error.message).toEqual("Could not create Observation. Invalid json!");
    }));

    it("test Observation: joson parse RegId correct", inject(function (Observation) {
        var obs = Observation.fromJson(testJson);
        expect(obs.RegId).toEqual(103789);
    }));

    it("test Observation: getDaysUntilExpery", inject(function (Observation, DateHelpers, moment, AppSettings) {
        spyOn(DateHelpers, 'now').and.callFake(function () {
            return moment('2017-01-27T13:34:15.816', moment.ISO_8601);
        });
        spyOn(AppSettings, 'getObservationsDaysBack').and.callFake(function () {
            return 1;
        });

        var obs = Observation.fromJson(testJson);

        expect(obs.getDaysUntilExpiery()).toEqual(1);
    }));

    it("test Observation: getDaysUntilExpery is over expiery by one day", inject(function (Observation, DateHelpers, moment, AppSettings) {
        spyOn(DateHelpers, 'now').and.callFake(function () {
            return moment('2017-01-29T13:34:15.816', moment.ISO_8601);
        });
        spyOn(AppSettings, 'getObservationsDaysBack').and.callFake(function () {
            return 1;
        });

        var obs = Observation.fromJson(testJson);

        expect(obs.getDaysUntilExpiery()).toEqual(-1);
    }));

});