angular
    .module('RegObs')
    .controller('IceCoverObsCtrl', function ($scope, Registration) {
        function init(){
            var vm = this;

            vm.save = Registration.save;

            vm.iceCoverObs = Registration.getPropertyAsObject('ice', 'IceCoverObs');

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );
    });

