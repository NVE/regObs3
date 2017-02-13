angular.module('RegObs').factory('ObservationType', function ($window) {
    var ObservationType = function (json) {
        if (!json || typeof json !== 'object') {
            throw new Error('Could not create ObservationType. Invalid json!');
        }
        this.data = json;
    };

    ObservationType.prototype.getName = function() {
        return (this.data.RegistrationName || '').trim();
    };

    ObservationType.prototype.getValues = function () {
        var result = [];
        if (this.data.TypicalValue2) {
            result.push(this.data.TypicalValue2);
        }
        if (this.data.TypicalValue1) {
            result.push(this.data.TypicalValue1);
        }
        return result;
    };

    /**
    * Factory for creating new ObservationType from json
    * @param {} json 
    * @returns {} 
    */
    ObservationType.fromJson = function (json) {
        return new ObservationType(json);
    };


    return ObservationType;
});