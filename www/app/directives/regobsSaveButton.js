angular
    .module('RegObs')
    .directive('regobsSaveButton', function ($ionicHistory) {
        return {
            link: link,
            scope: {},
            require: '?^form',
            template: '<button class="button button-block button-calm" ng-click="save()">Lagre</button>',
            replace: true
        };

        function link(scope, elem, attrs, formCtrl){
            console.log('formCtrl', formCtrl);
            scope.save = function(){
                $ionicHistory.goBack();
            }
        }

    });