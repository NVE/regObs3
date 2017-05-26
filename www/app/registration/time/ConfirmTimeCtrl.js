angular
    .module('RegObs')
    .controller('ConfirmTimeCtrl', function ($scope, Registration, $state, RegobsPopup, $translate, Utility) {
        var ctrl = this;

        ctrl.setToNow = function () {
            ctrl.time = new Date(moment().seconds(0).milliseconds(0).toISOString());
        };

        ctrl.save = function () {
            var doSave = function () {
                Registration.data.DtObsTime = ctrl.time.toISOString();
                Registration.save();
                if (Registration.data.GeoHazardTID === Utility.geoHazardTid('water')){
                    $state.go('waterlevel', {}, { reload: true });
                } else {
                    $state.go('newregistration', {}, {reload: true});
                }
            };

            if (!ctrl.time || (ctrl.time > new Date())) {
                $translate(['INVALID_VALUE', 'INVALID_OBSERVATION_TIME']).then(function (translations) {
                    RegobsPopup.alert(translations['INVALID_VALUE'], translations['INVALID_OBSERVATION_TIME']).then(function () {
                        ctrl.setToNow();
                    });
                });
            } else {
                doSave();
            }
        };

        $scope.$on('$ionicView.enter', function () {
            var time = new Date();
            if (Registration.data && Registration.data.DtObsTime) {
                time = new Date(Registration.data.DtObsTime);
            }

            time = new Date(moment(time).seconds(0).milliseconds(0).toISOString());

            ctrl.time = time;
        });

    });