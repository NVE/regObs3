angular
    .module('RegObs')
    .factory('IceRegistration', function IceRegistration(Registration, Utility) {

        var service = this;
        var registration = Registration.createRegistration('ice');



        //Brukt der det er bilder (RegistrationTID)
        var OBSERVATIONS = [
            {name: "Ulykke/Hendelse", key: "Incident", RegistrationTID: "11"},
            {name: "Faretegn", key: "DangerObs", RegistrationTID: "13"},
            {name: "Snødekke", key: "SnowSurfaceObservation", RegistrationTID: "23"},
            {name: "Skredaktivitet", key: "AvalancheActivityObs", RegistrationTID: "27"},
            {name: "Snøskred", key: "AvalancheObs", RegistrationTID: "26"},
            {name: "Vær", key: "WeatherObs", RegistrationTID: "21"},
            {name: "Snøprofil", key: "SnowProfile", RegistrationTID: "23"},
            {name: "Skredproblem", key: "AvalancheEvalProblem2", RegistrationTID: "32"},
            {name: "Skredfarevurdering", key: "AvalancheEvaluation3", RegistrationTID: "31"},
            {name: "Bilde", key: "Picture", RegistrationTID: "12"},
            {name: "Isdekningsgrad", key: "IceCoverObs", RegistrationTID: "51"},
            {name: "Snø og istykkelse", key: "IceThickness", RegistrationTID: "50"},
            {name: "Vannstand", key: "WaterLevel", RegistrationTID: "61"},
            {name: "Skredhendelse", key: "LandSlideObs", RegistrationTID: "71"},
            {name: "Fritekst", key: "GeneralObservation", RegistrationTID: "10"}
        ];


        return service;
    });