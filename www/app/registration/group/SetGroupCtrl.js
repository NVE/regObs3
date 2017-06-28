angular
    .module('RegObs')
    .controller('SetGroupCtrl', function (User, $scope, Registration) {
        var ctrl = this;

        ctrl.reg = Registration.data;

        ctrl._init = function () {
            ctrl.groups = User.getObserverGroups();
        };

        ctrl.reset = function () {
            ctrl.reg.ObserverGroupID = null;
        };

        $scope.$on('$ionicView.enter', ctrl._init);
    });