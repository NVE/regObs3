angular
    .module('RegObs')
    .directive('regobsIncidentUrl', function dangerObs($ionicModal, Registration, RegobsPopup, Utility, AppLogging) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/incident/regobsIncidentUrl.html',
            restrict: 'EA'
        };

        function link($scope) {

            var indexEditing = -1;

            var showConfirm = function () {
                return RegobsPopup.delete('Slett url',
                    'Er du sikker på at du vil slette url?');
            };

            var init = function () {
                Registration.initPropertyAsObject('Incident');

                if (Utility.isEmpty(Registration.data.Incident.IncidentURLs)) {
                    Registration.data.Incident.IncidentURLs = [];
                }

                $scope.incidentUrls = Registration.data.Incident.IncidentURLs;
            };

            init();

            $scope.newIncidentUrl = function () {
                $scope.editing = false;
                $scope.url = {
                    UrlLine: '',
                    UrlDescription: ''
                };
                $scope.modal.show();
            };

            $scope.editIncidentUrl = function (url, index) {
                indexEditing = index;
                $scope.url = url;
                $scope.editing = true;
                $scope.modal.show();
            };

            $scope.addUrl = function () {
                if (!$scope.editing) {
                    $scope.incidentUrls.push($scope.url);
                }
                $scope.modal.hide();
            };

            $scope.deleteUrl = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            $scope.incidentUrls.splice(indexEditing, 1);
                            $scope.modal.hide();
                            indexEditing = -1;
                        }
                    });
            };

            var loadModal = function () {
                var url = 'app/directives/incident/newIncidentUrl.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.modal = modal;
                        return modal;
                    });
            };

            loadModal();

            $scope.$on('$ionicView.loaded', function () {
                init();
            });

            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.modal.hide();
            });

            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
        }
    });