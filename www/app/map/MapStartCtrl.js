angular.module('RegObs')
    .controller('MapStartCtrl', function ($scope, $state, $ionicHistory, Map, AppSettings, Registration, Property, Trip, User, RegobsPopup, HeaderColor, AppLogging, $ionicSideMenuDelegate, ObsLocation, Utility) {
        var appVm = this;

        appVm.gotoState = function (state) {
            $state.go(state);
        }

        appVm.newRegistration = Registration.createAndGoToNewRegistration;

        appVm.showTrip = function() {
            return AppSettings.getAppMode() === 'snow';
        }

        appVm.showEditRegistration = function() {
            return !Registration.isEmpty();
        }

        appVm.getNewObservationText = Utility.getNewObservationText;

        appVm.gpsCenterClick = function () {
            AppLogging.log('Center gps');
            $scope.$broadcast('centerMapPosition');
        };

        appVm.updateObservationsInMap = function() {
            $scope.$broadcast('updateObservationsInMap');
        };

        $scope.$on('$ionicView.enter', function () {
            $ionicHistory.clearHistory();
            $scope.$broadcast('startGpsWatch');

            Map.updateMapFromSettings();

        });

        $scope.$on('$ionicView.leave', function () {
            $scope.$broadcast('endGpsWatch');
        });
    });
