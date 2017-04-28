angular.module('RegObs').directive('regobsObservationTypeGenerator', function ($compile, $injector) {
    return {
        scope: {
            registration: '<',
            isSummary: '<',
            showHeader: '<',
            showBullets: '<'
        },
        link: function (scope, element) {
            var generatedTemplate = '<observation-type-generic show-header="showHeader" show-bullets="showBullets" registration="registration"></observation-type-generic>';

            var componentName = 'observationType' + (scope.isSummary ? 'Summary' : '') + scope.registration.data.RegistrationTid +'Directive';
            var exist = $injector.has(componentName);
            if (exist) {
                var directiveName = 'observation-type-' + (scope.isSummary ? 'summary-' : '') + scope.registration.data.RegistrationTid;
                generatedTemplate = '<' + directiveName + ' registration="registration"></' + directiveName + '>';
            }
            element.append($compile(generatedTemplate)(scope));
        }
    };
});