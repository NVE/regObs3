angular.module('RegObs')
    .controller('MapStartCtrl', function ($scope, $rootScope, $state, $ionicHistory, Map, AppSettings, Registration, AppLogging, Utility) {
        var appVm = this;

        appVm.gotoState = $state.go;
        appVm.newRegistration = Registration.createAndGoToNewRegistration;
        appVm.getNewObservationText = Utility.getNewObservationText;
        appVm.gpsCenterClick = Map.centerMapToUser;
        appVm.updateObservationsInMap = Map.updateObservationsInMap;

        appVm.showTrip = function() {
            return AppSettings.getAppMode() === 'snow';
        }

        appVm.showEditRegistration = function() {
            return !Registration.isEmpty();
        }     

        $scope.$on('$ionicView.enter', function () {
            $ionicHistory.clearHistory();
            Map.updateMapFromSettings();
            Map.startWatch();
        });

        $scope.$on('$ionicView.leave', Map.clearWatch);
        $rootScope.$on('$regObs.appSettingsChanged', Map.updateMapFromSettings);
    });
