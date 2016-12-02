angular
    .module('RegObs')
    .directive('mapMenu', function mapmenu($ionicModal, $ionicPopup, Utility, AppLogging) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/mapmenu/mapmenu.html',
            scope: {
            },
            restrict: 'EA'
        };

        function link(scope) {
        }
    });