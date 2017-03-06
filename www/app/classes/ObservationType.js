angular.module('RegObs').factory('ObservationType', function ($window, Utility, Translate, $q, $filter) {
    var ObservationType = function (geoHazardTid, json) {
        if (!geoHazardTid) throw new Error('geoHazardTid must be set!');
        if (!json || typeof json !== 'object') {
            throw new Error('Could not create ObservationType. Invalid json!');
        }
        this.geoHazardTid = geoHazardTid;
        this.data = json;
    };

    ObservationType.prototype.getName = function () {
        return (this.data.RegistrationName || '').trim();
    };

    ObservationType.prototype._getValue = function (propName, prop) {
        var self = this;
        return $q(function (resolve) {
            if (propName.indexOf('TID') !== -1) {
                var id = self.data.FullObject[propName];
                if (!id) {
                    resolve({ value: null, property: propName });
                } else {
                    var kdvProp = prop.kdvKey;
                    if (!prop.kdvKey) {
                        kdvProp = propName.replace('TID', 'KDV');
                        var prefix = Utility.getGeoHazardType(self.geoHazardTid);
                        prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
                        kdvProp = prefix + "_" + kdvProp;
                    }

                    Utility.getKdvValue(kdvProp, id)
                        .then(function(result) {
                            resolve({ value: result.Name.trim(), property: propName });
                        });
                }
            } else {
                resolve({ value: self.data.FullObject[propName], property: propName });
            }
        });
    };

    ObservationType.prototype._forEachProperty = function (properties, callback) {
        var self = this;
        for (var prop in properties) {
            if (properties.hasOwnProperty(prop)) {
                self._getValue(prop, properties[prop])
                    .then(function (result) {
                        var displayFormat = properties[result.property].displayFormat || {};
                        var hasValue = !Utility.isEmpty(self.data.FullObject[result.property]);
                        if (result.property.indexOf('TID') !== -1) {
                            hasValue = self.data.FullObject[result.property] > 0;
                        }

                        var valueText = '';
                        if (hasValue && (!displayFormat.condition || displayFormat.condition(result.value, self.data))) {
                            valueText = (displayFormat.valueFormat ? displayFormat.valueFormat(result.value, self.data) : result.value);                           
                        }
                        if (valueText && angular.isFunction(valueText.then)) {
                            valueText.then(function(promiseResult) {
                                callback(result.property, !Utility.isEmpty(promiseResult), result.value, promiseResult, displayFormat);
                            });
                        } else {
                            valueText = valueText.toString().trim();
                            callback(result.property, !Utility.isEmpty(valueText), result.value, valueText, displayFormat);
                        }
                    });
            }
        }
    };

    ObservationType.prototype._getValuesFromFullObject = function (properties) {
        var self = this;
        return $q(function (resolve) {
            var result = [];

            var orderResult = function () {
                var orderedResult = $filter('orderBy')(result, 'order');
                var r = [];
                orderedResult.forEach(function (item) {
                    if (item.hasValue) {
                        r.push(item.value);
                    }
                });
                return r;
            };

            var checkCallback = function () {
                if (result.length === Object.keys(properties).length) {
                    resolve(orderResult());
                }
            };
            self._forEachProperty(properties,
                function (prop, hasValue, value, valueText, displayFormat) {
                    var hideDescription = angular.copy(displayFormat.hideDescription);
                    if (angular.isFunction(hideDescription)) {
                        hideDescription = hideDescription(self.data.FullObject[prop], self.data);
                    }

                    if (hideDescription) {
                        result.push({ prop: prop, hasValue: hasValue, value: valueText, order: Object.keys(properties).indexOf(prop) });
                        checkCallback();
                    } else {
                        var translationName = Utility.camelCaseToUnderscore(prop.replace('TID', ''));
                        Translate.translateWithFallback(translationName, '')
                            .then(function (description) {
                                result.push({ prop: prop, hasValue: hasValue, value: description + ': ' + valueText, order: Object.keys(properties).indexOf(prop) });
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
            return self._getValuesFromFullObject(def.properties);
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

    return ObservationType;
});