angular.module('RegObs').factory('AvalancheEvaluation', function (ObservationType) {
    var AvalancheEvaluation = function(json) {
        ObservationType.call(this, json);
    };

    AvalancheEvaluation.prototype = Object.create(ObservationType.prototype);

    AvalancheEvaluation.prototype.getValues = function () {
        var result = ObservationType.prototype.getValues.call(this);

        if (this.data.FullObject.AvalancheEvaluation) {
            result.push(this.data.FullObject.AvalancheEvaluation);
        }
        
        return result;
    };

    return AvalancheEvaluation;
});