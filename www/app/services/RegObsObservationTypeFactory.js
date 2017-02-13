angular.module('RegObs').factory('RegObsObservationTypeFactory', function (ObservationType, AvalancheEvaluation) {
    var service = this;

    service.getObservationTypeInstance = function (json) {
        if (json.RegistrationTid === 31) {
            return new AvalancheEvaluation(json);
        }

        return new ObservationType(json);
    };
    
    return service;
});