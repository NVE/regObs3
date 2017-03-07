angular
    .module('RegObs')
    .controller('SnowSurfaceObservationCtrl', function ($scope, $state, $timeout, Utility, Registration, AppLogging) {
        var vm = this;
        vm.propChanged = function (prop){
          $timeout(function(){

            var numText = vm[prop];
            var num = parseFloat(numText);

            if(num){
                vm.reg.SnowSurfaceObservation[prop] = Utility.nDecimal(num/100, 5);
            }

            AppLogging.log(vm.reg.SnowSurfaceObservation);
          });
        };


        $scope.$on( '$ionicView.loaded', function(){
            vm.reg = Registration.initPropertyAsObject($state.current.data.registrationProp);
            vm.SnowDepth = vm.reg.SnowSurfaceObservation.SnowDepth ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.SnowDepth*100) : undefined;
            vm.NewSnowDepth24 = vm.reg.SnowSurfaceObservation.NewSnowDepth24 ? Utility.twoDecimal(vm.reg.SnowSurfaceObservation.NewSnowDepth24*100) : undefined;
        });
    });
