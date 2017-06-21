angular
    .module('RegObs')
    .controller('SetGroupCtrl', function (User, $scope, Registration) {
        var ctrl = this;

        ctrl.reg = Registration.data;

        ctrl._init = function () {
            var user = User.getUser();
            ctrl.groups = [];
            if (!user.anonymous) {
                var groups = user.ObserverGroup;
                for (var g in groups) {
                    ctrl.groups.push({ Id: g, Name: groups[g] });
                };
            }
        };

        ctrl.reset = function () {
            ctrl.reg.ObserverGroupID = null;
        };

        $scope.$on('$ionicView.enter', ctrl._init);
    });