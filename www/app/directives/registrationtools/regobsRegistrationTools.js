angular
    .module('RegObs')
    .directive('regobsRegistrationTools', function ($ionicModal,ObsLocation) {
        return {
            link: link,
            scope: {},
            templateUrl: 'app/directives/registrationtools/regobsRegistrationTools.html'
        };

        function link(scope){
            scope.ObsLocation = ObsLocation;

            var loadModal = function () {
                var url = 'app/directives/registrationtools/mapModal.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        scope.modal = modal;
                        return modal;
                    });
            };

            loadModal();

            scope.setPositionInMap = function () {
                scope.$broadcast('setPositionInMap');
                scope.modal.show();

            };

            scope.$on('$destroy', function() {
                scope.modal.remove();
            });
        }

    });