angular
    .module('RegObs')
    .directive('replacecomma', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                scope.$watch(attrs.ngModel, function (newVal) {
                    console.log(newVal);
                    if (newVal !== undefined && newVal !== null) {
                        var val = parseFloat(String(newVal).replace(/,/g, '.'));
                        console.log(val)
                        ngModelCtrl.$setViewValue(val);
                        element.val(parseFloat(String(newVal).replace(/,/g, '.')));
                    }
                })

            }
        }
    });