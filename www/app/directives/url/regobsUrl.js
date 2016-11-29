angular
    .module('RegObs')
    .directive('regobsUrl', function dangerObs($ionicModal, Registration, RegobsPopup, Utility, AppLogging) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/url/regobsUrl.html',
            restrict: 'EA',
            scope: {
                model: '=',
                property: '@'
            }
        };

        function link($scope) {

            var init = function()
            {
                if ($scope.model && $scope.property) {
                    if (Utility.isEmpty($scope.model[$scope.property])) {
                        $scope.model[$scope.property] = [];
                    }
                    $scope.urls = $scope.model[$scope.property];
                }
            };

            init();

            var indexEditing = -1;

            var showConfirm = function () {
                return RegobsPopup.delete('Slett url',
                    'Er du sikker på at du vil slette url?');
            };


            $scope.newUrl = function () {
                $scope.editing = false;
                $scope.url = {
                    UrlLine: '',
                    UrlDescription: ''
                };
                $scope.modal.show();
            };

            $scope.editUrl = function (url, index) {
                indexEditing = index;
                $scope.url = url;
                $scope.editing = true;
                $scope.modal.show();
            };

            var deleteCurrentUrl = function () {
                if (indexEditing >= 0 && indexEditing < $scope.urls.length) {
                    $scope.urls.splice(indexEditing, 1);
                }
            };

            $scope.addUrl = function () {
                if (!$scope.editing && !Utility.isEmpty($scope.url)) {
                    $scope.urls.push($scope.url);
                } else if (Utility.isEmpty($scope.url)) {
                    deleteCurrentUrl(); //remove empty url
                }
                $scope.modal.hide();
            };

            $scope.deleteUrl = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            deleteCurrentUrl();
                            $scope.modal.hide();
                            indexEditing = -1;
                        }
                    });
            };

            var loadModal = function () {
                var url = 'app/directives/url/newUrl.html';
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