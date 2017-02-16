angular.module('RegObs').directive('regobsObservationTypeGenerator', function ($compile, $injector) {
    return {
        scope: {
            registration: '<'
        },
        link: function (scope, element) {
            var generatedTemplate = '<observation-type-generic registration="registration"></observation-type-generic>';

            var componentName = 'observationType' + scope.registration.data.RegistrationTid +'Directive';
            var exist = $injector.has(componentName);
            if (exist) {
                var directiveName = 'observation-type-' + scope.registration.data.RegistrationTid;
                generatedTemplate = '<' + directiveName + ' registration="registration"></' + directiveName + '>';
            }
            element.append($compile(generatedTemplate)(scope));
        }
    };
});