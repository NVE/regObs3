angular.module('RegObs').factory('ObservationType', function ($window, Utility, Translate, $q, $filter) {
    var ObservationType = function (json) {
        if (!json || typeof json !== 'object') {
            throw new Error('Could not create ObservationType. Invalid json!');
        }
        this.data = json;
    };

    ObservationType.prototype.getName = function () {
        return (this.data.RegistrationName || '').trim();
    };

    ObservationType.prototype._getValue = function(propName, geoHazardId) {
        var self = this;
        return $q(function(resolve) {
            if (propName.indexOf('TID') !== -1) {
                var id = self.data.FullObject[propName];
                var kdvProp = propName.replace('TID', 'KDV');
                if (geoHazardId) {
                    var prefix = Utility.getGeoHazardType(geoHazardId);
                    prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                    kdvProp = prefix + "_" + kdvProp;
                }
                Utility.getKdvValue(kdvProp, id)
                    .then(function(result) {
                        resolve({ value: result.Name.trim(), property: propName });
                    });
            } else {
                resolve({ value: self.data.FullObject[propName], property: propName });
            }
        });
    };

    ObservationType.prototype._forEachProperty = function (geoHazardId, properties, callback) {
        var self = this;
        for (var prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                self._getValue(prop, geoHazardId)
                    .then(function (result) {
                        var displayFormat = properties[result.property].displayFormat || {};
                        var hasValue = self.data.FullObject[result.property];
                        var valueText = '';
                        if (hasValue && (!displayFormat.condition || displayFormat.condition(result.value, self.data.FullObject))) {
                            valueText = (displayFormat.valueFormat ? displayFormat.valueFormat(result.value) : result.value).toString().trim();
                        }
                        callback(result.property, hasValue, result.value, valueText, displayFormat);
                    });
            }
        }
    };

    ObservationType.prototype._getValuesFromFullObject = function (geoHazardId, properties) {
        var self = this;
        return $q(function (resolve) {
            var result = [];

            var orderResult = function() {
                var orderedResult = $filter('orderBy')(result, 'order');
                var r = [];
                orderedResult.forEach(function (item) {
                    r.push(item.value);
                });
                return r;
            };

            var checkCallback = function () {
                if (result.length === Object.keys(properties).length) {              
                    resolve(orderResult());
                }
            };
            self._forEachProperty(geoHazardId, properties,
                function (prop, hasValue, value, valueText, displayFormat) {
                    if (displayFormat.hideDescription) {
                        result.push({ prop: prop, value: valueText, order: Object.keys(properties).indexOf(prop) });
                        checkCallback();
                    } else {
                        var translationName = Utility.camelCaseToUnderscore(prop.replace('TID', ''));
                        Translate.translateWithFallback(translationName, '')
                            .then(function (description) {
                                result.push({ prop: prop, value: description + ': ' + valueText, order: Object.keys(properties).indexOf(prop) });
                                checkCallback();
                            });
                    }
                });
        });
    };


    ObservationType.prototype.getValues = function () {
        var self = this;
        var def = Utility.getObservationDefinition(self.data.RegistrationTid); //Custom display format is specified
        if (def && def.properties) {
            return self._getValuesFromFullObject(def.geoHazardTid, def.properties);
        } else {
            return $q(function (resolve) {
                var result = [];
                //Use typical values if noting else is specified
                if (self.data.TypicalValue2) {
                    result.push(self.data.TypicalValue2);
                }
                if (self.data.TypicalValue1) {
                    result.push(self.data.TypicalValue1);
                }
                resolve(result);
            });
        }
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