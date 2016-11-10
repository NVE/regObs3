angular
    .module('RegObs')
    .directive('regobsIncident', function dangerObs($ionicModal, Registration, $ionicPopup, Utility, AppLogging) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/incident/regobsIncident.html',
            scope: {
                activityInfluencedKdv: '@'
            },
            restrict: 'EA'
        };

        function link(scope) {

            scope.reg = Registration.initPropertyAsObject('Incident');

            scope.$on('$stateChangeStart', function () {

                if (!Registration.propertyExists('Incident')) {
                    AppLogging.log('DELETE INCIDENT');
                    delete Registration.data['Incident'];
                }

            });
        }
    });