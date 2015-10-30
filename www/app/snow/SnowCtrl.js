/**
 * Created by storskel on 03.06.2015.
 */
angular
    .module('RegObs')
    .controller('SnowCtrl', function SnowCtrl($scope) {

        function init() {
            var vm = this;

           /* $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                console.log(toState);
                if(toState.name === 'snowregistration'){
                    event.preventDefault();
                }
            });*/
        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );


    });