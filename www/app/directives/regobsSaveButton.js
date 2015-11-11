angular
    .module('RegObs')
    .directive('regobsSaveButton', function ($ionicHistory) {
        return {
            link: link,
            scope: {},
            template: '<button class="button button-block button-calm" ng-click="save()">Lagre</button>',
            replace: true
        };

        function link(scope){
            scope.save = function(){
                $ionicHistory.goBack();
            }
        }

    });