angular
    .module('RegObs')
    .directive('regobsStabilityTest', function ($ionicModal, Registration, RegobsPopup, Utility, AppLogging) {
        'ngInject';
        return {
            link: link,
            templateUrl: 'app/directives/stabilitytest/regobsStabilityTest.html',
            restrict: 'EA'
        };

        function link($scope) {
            var indexEditing = -1;
            var showConfirm = function () {
                return RegobsPopup.delete('Slett stabilitetstest',
                    'Er du sikker på at du vil slette denne stabilitetstesten?');
            };

            $scope.reg = Registration.initPropertyAsArray('CompressionTest');

            var checkAndCreateCompressionTestArray = function() {
                if (!$scope.reg.CompressionTest || !angular.isArray($scope.reg.CompressionTest)) {
                    $scope.reg.CompressionTest = [];
                }
            };

           
            $scope.save = Registration.save;

            var setFractureDepth = function(stest) {
                if (stest && stest.tempFractureDepth > 0) {
                    stest.FractureDepth = stest.tempFractureDepth / 100.0; //FractureDepth is in meter, so cm has to be converted to m
                }
            };

            $scope.addStabilityTest = function () {
                setFractureDepth($scope.stabilityTest);
                if (!$scope.editing) {
                    checkAndCreateCompressionTestArray();
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

            $scope.changeTestType = function() {
                if ($scope.isCTNorECTXorCTVorECTV()) {
                    $scope.stabilityTest.TapsFracture = null;
                }
                if ($scope.isCTNorECTX()) {
                    $scope.stabilityTest.ComprTestFractureTID = null;
                }
            };

            $scope.isCTNorECTX = function() {
                return $scope.stabilityTest &&
                    $scope.stabilityTest.PropagationTID &&
                    ($scope.stabilityTest.PropagationTID === 15 || $scope.stabilityTest.PropagationTID === 24);
            };

            $scope.isCTVorECTV = function () {
                return $scope.stabilityTest &&
                    $scope.stabilityTest.PropagationTID &&
                    ($scope.stabilityTest.PropagationTID === 11 || $scope.stabilityTest.PropagationTID === 21);
            };

            $scope.isCTNorECTXorCTVorECTV = function() {
                return $scope.isCTNorECTX() || $scope.isCTVorECTV();
            };

            var loadSnowPropagationKdvArray = function () {
                return Utility
                    .getKdvArray('Snow_PropagationKDV')
                    .then(function (response) {
                        $scope.snowPropagationKdvArray = response;
                        return response;
                    });
            };

            var loadComprTestFractureKdvArray = function () {
                return Utility
                    .getKdvArray('Snow_ComprTestFractureKDV')
                    .then(function (response) {
                        $scope.snowComprTestFractureKdvArray = response;
                        return response;
                    });
            };

            $scope.getPropagationName = function (tid) {
                if (angular.isArray($scope.snowPropagationKdvArray)) {
                    for (var i = 0; i < $scope.snowPropagationKdvArray.length; i++) {
                        var item = $scope.snowPropagationKdvArray[i];
                        if (item.Id === tid) {
                            return item.Name;
                        }
                    }
                }
                return '';
            };

            $scope.getComprTestFractureName = function (tid) {
                if (angular.isArray($scope.snowComprTestFractureKdvArray)) {
                    for (var i = 0; i < $scope.snowComprTestFractureKdvArray.length; i++) {
                        var item = $scope.snowComprTestFractureKdvArray[i];
                        if (item.Id === tid) {
                            return item.Name;
                        }
                    }
                }
                return '';
            };

            $scope.getStabilityTestName = function (stabilityTest) {
                return $scope.getPropagationName(stabilityTest.PropagationTID) + ' ' + (stabilityTest.TapsFracture || '') + '@' + (stabilityTest.tempFractureDepth || '') + 'cm' + $scope.getComprTestFractureName(stabilityTest.ComprTestFractureTID);
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

            loadSnowPropagationKdvArray().then(loadComprTestFractureKdvArray).then(loadModal);

            $scope.$on('$ionicView.beforeLeave', function () {
                $scope.modal.hide();
            });

            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
        }
    });
