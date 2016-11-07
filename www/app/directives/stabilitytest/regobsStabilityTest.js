angular
    .module('RegObs')
    .directive('regobsStabilityTest', function ($ionicModal, Registration, RegobsPopup, Utility) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/stabilitytest/regobsStabilityTest.html',
            restrict: 'EA'
        };

        function link($scope){
            var indexEditing = -1;
            var showConfirm = function () {
                return RegobsPopup.delete('Slett stabilitetstest',
                    'Er du sikker på at du vil slette denne stabilitetstesten?');
            };

            $scope.reg = Registration.initPropertyAsArray('CompressionTest');

            $scope.save = Registration.save;

            $scope.addStabilityTest = function () {
                if(!$scope.editing){
                    $scope.reg.CompressionTest.push($scope.stabilityTest);
                }
                $scope.modal.hide();
            };

            $scope.newStabilityTest = function () {
                $scope.editing = false;
                $scope.stabilityTest = {};
                $scope.modal.show();
            };

            $scope.editStabilityTest = function (stabilityTest, index) {
                indexEditing = index;
                $scope.stabilityTest = stabilityTest;
                $scope.editing = true;
                $scope.modal.show();
            };

            $scope.deleteStabilityTest = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            $scope.reg.CompressionTest.splice(indexEditing, 1);
                            $scope.modal.hide();
                            indexEditing = -1;
                        }
                    });
            };

            $scope.getStabilityTestName = function (stabilityTest) {
                return stabilityTest.PropagationTID + stabilityTest.TapsFracture + '@' + stabilityTest.FractureDepth + 'cm' + stabilityTest.ComprTestFractureTID;
            };

            var loadModal = function () {
                var url = 'app/directives/stabilitytest/newstabilitytest.html';
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

            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.modal.hide();
            });

            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
        }
    });
