/**
 * Created by storskel on 09.11.2015.
 */
angular
    .module('RegObs')
    .directive('regobsAvalancheActivity',
        function regobsAvalancheActivity($filter, $ionicModal, RegobsPopup, Registration, Utility) {
            return {
                link: link,
                templateUrl: 'app/directives/avalancheactivity/regobsAvalancheAvtivity.html',
                scope: {},
                restrict: 'EA'
            };

            function link($scope) {

                var avalancheExtDict;
                var indexEditing = -1;
                $scope.reg = Registration.data;
                $scope.heightArray = [
                    2500, 2400, 2300, 2200, 2100,
                    2000, 1900, 1800, 1700, 1600,
                    1500, 1400, 1300, 1200, 1100,
                    1000, 900, 800, 700, 600,
                    500, 400, 300, 200, 100, 0
                ];

                var showConfirm = function () {
                    return RegobsPopup.confirm('Slett skredproblem',
                        'Er du sikker på at du vil slette dette skredproblemet?');
                };

                $scope.exposedHeight = function (where) {
                    var expHeight = $scope.obs.exposedHeight;
                    expHeight[where] = !expHeight[where];
                    var top = expHeight.top;
                    var mid = expHeight.mid;
                    var bot = expHeight.bot;

                    if(top && mid && bot) {
                        $scope.obs.ExposedHeightComboTID = 0;
                    } else if(!top && mid && !bot){
                        $scope.obs.ExposedHeightComboTID = 4;
                    } else if(top && !mid && bot) {
                        $scope.obs.ExposedHeightComboTID = 3;
                    } else if(bot) {
                        $scope.obs.ExposedHeightComboTID = 2;
                    } else if(top){
                        $scope.obs.ExposedHeightComboTID = 1;
                    } else {
                        $scope.obs.ExposedHeightComboTID = 0;
                    }
                    console.log($scope.obs);
                    $scope.obs.ExposedHeight2 = 0;
                };

                $scope.new = function () {
                    indexEditing = -1;
                    $scope.exposition = [0, 0, 0, 0, 0, 0, 0, 0];
                    $scope.allExpositionsToggled = false;
                    $scope.editing = false;
                    $scope.obs = {

                        exposedHeight: {
                            'top': false,
                            'mid': false,
                            'bot': false
                        }
                    };

                    $scope.modal.show();
                };

                $scope.add = function () {
                    if(!$scope.reg.AvalancheActivityObs2){
                        $scope.reg.AvalancheActivityObs2 = [];
                    }
                    $scope.reg.AvalancheActivityObs2.push($scope.obs);
                    $scope.modal.hide();
                };

                $scope.edit = function (obs, index) {
                    indexEditing = index;
                    $scope.obs = obs;
                    loadValidExposition();
                    $scope.editing = true;
                    $scope.modal.show();
                };

                $scope.delete = function () {
                    showConfirm()
                        .then(function (response) {
                            if (response) {
                                $scope.reg.AvalancheActivityObs2.splice(indexEditing, 1);
                                $scope.modal.hide();
                                indexEditing = -1;
                            }
                        });
                };

                $scope.toggleExposition = function (index) {
                    $scope.exposition[index] = $scope.exposition[index] === 1 ? 0 : 1;
                    updateValidExposition();
                };

                $scope.toggleAllExpositions = function () {
                    if ($scope.allExpositionsToggled) {
                        $scope.exposition = [0, 0, 0, 0, 0, 0, 0, 0];
                    } else {
                        $scope.exposition = [1, 1, 1, 1, 1, 1, 1, 1];
                    }
                    $scope.allExpositionsToggled = !$scope.allExpositionsToggled;
                    updateValidExposition();
                };


                var loadModal = function () {
                    var url = 'app/directives/avalancheactivity/newactivity.html';
                    return $ionicModal
                        .fromTemplateUrl(url, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (modal) {
                            $scope.modal = modal;
                            return modal;
                        });
                };

                var updateValidExposition = function () {
                    $scope.obs.ValidExposition = $scope.exposition.join('');
                };

                var loadValidExposition = function () {

                    $scope.allExpositionsToggled = $scope.obs.ValidExposition === '11111111';

                    if($scope.obs.ValidExposition){
                        $scope.exposition = $scope.obs.ValidExposition.split('')
                            .map(function (val) {
                                return parseInt(val);
                            });
                    } else {
                        $scope.exposition = [0,0,0,0,0,0,0,0];
                    }
                };


                Utility
                    .getKdvRepositories('Snow_AvalancheExtKDV')
                    .then(function (repos) {
                        //Snow_AvalCauseAttributeFlags
                        avalancheExtDict = {};
                        repos['Snow_AvalancheExtKDV'].forEach(function (val) {
                            avalancheExtDict[val.Id] = val.Name;
                        });

                    })
                    .then(loadModal);

                $scope.$on('$ionicView.beforeLeave', function () {
                    $scope.modal.hide();
                });

                $scope.$on('$destroy', function() {
                    $scope.modal.remove();
                });

            }

        });