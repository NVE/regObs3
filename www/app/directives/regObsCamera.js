angular
    .module('RegObs')
    .directive('regobsCamera', function ($ionicPlatform, Pictures, $state) {
        'ngInject';

        return {
            link: link,
            replace: true,
            scope: {},
            template: '<button type="button" class="button button-clear button-block button-dark icon-left ion-camera" ng-click="click()">Foto</button>'
        };

        function link(scope) {
            scope.click = window.Camera && function () {
                    $ionicPlatform.ready(function () {
                        Pictures.getCameraPicture($state.current.data.registrationProp);
                    });
                }
        }
    });