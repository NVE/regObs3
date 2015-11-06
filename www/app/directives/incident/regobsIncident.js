angular
    .module('RegObs')
    .directive('regobsIncident', function dangerObs($ionicModal, Registration, $ionicPopup, Utility) {
        return {
            link: link,
            templateUrl: 'app/directives/incident/regobsIncident.html',
            scope: {
                activityInfluencedKdv: '@'
            },
            restrict: 'EA'
        };

        function link(scope) {

            scope.incident = Registration.getPropertyAsObject('Incident');
        }
    });