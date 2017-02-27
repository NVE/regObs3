/**
 * Created by storskel on 09.11.2015.
 */
angular
    .module('RegObs')
    .directive('regobsAvalancheActivity',
        function regobsAvalancheActivity($filter, $ionicModal, RegobsPopup, Registration, Utility, AppLogging, $translate) {
            'ngInject';
            return {
                link: link,
                templateUrl: 'app/directives/avalancheactivity/regobsAvalancheAvtivity.html',
                scope: {},
                restrict: 'EA'
            };

            function link($scope) {

                var indexEditing = -1;
                $scope.reg = Registration.data;
                $scope.heightArray = [
                    2500, 2400, 2300, 2200, 2100,
                    2000, 1900, 1800, 1700, 1600,
                    1500, 1400, 1300, 1200, 1100,
                    1000, 900, 800, 700, 600,
                    500, 400, 300, 200, 100, 0
                ];

                $scope.noActivity = {};
                $scope.dates = {
                    timeFrames: [
                        {
                            id: 1,
                            start: {h:0, m:0},
                            end: {h:23, m:59},
                            text: $translate.instant('DURING_THE_DAY')
                        },
                        {
                            id: 2,
                            start: {h:0, m:0},
                            end: {h:6, m:0},
                            text: '0-6'
                        },
                        {
                            id: 3,
                            start: {h:6, m:0},
                            end: {h:12, m:0},
                            text: '6-12'
                        },
                        {
                            id: 4,
                            start: {h:12, m:0},
                            end: {h:18, m:0},
                            text: '12-18'
                        },
                        {
                            id: 5,
                            start: {h:18, m:0},
                            end: {h:23, m:59},
                            text: '18-24'
                        }
                    ]
                };

                var showConfirm = function () {
                    return RegobsPopup.confirm($translate.instant('DELETE_AVALANCHE_ACTIVITY'),
                        $translate.instant('DELETE_AVALANCHE_ACTIVITY_CONFIRM'));
                };

                $scope.estimatedNumChanged = function () {
                    $scope.noActivity.val = $scope.obs.EstimatedNumTID === $scope.estimatedNumKdvArray[1].Id;
                };

                $scope.dateChanged = function(){
                    var start = new Date($scope.dates.DtStart);
                    if ($scope.dates.timeFrame.start && $scope.dates.timeFrame.start.h) {
                        start.setHours($scope.dates.timeFrame.start.h);
                    }
                    if ($scope.dates.timeFrame.start && $scope.dates.timeFrame.start.m) {
                        start.setMinutes($scope.dates.timeFrame.start.m);
                    }
                    start.setSeconds(0);
                    start.setMilliseconds(0);

                    var end = new Date($scope.dates.DtStart);
                    if ($scope.dates.timeFrame.end && $scope.dates.timeFrame.end.h) {
                        end.setHours($scope.dates.timeFrame.end.h);
                    }
                    if ($scope.dates.timeFrame.end && $scope.dates.timeFrame.end.m) {
                        end.setMinutes($scope.dates.timeFrame.end.m);
                    }
                    end.setSeconds(0);
                    end.setMilliseconds(0);

                    $scope.obs.DtStart = start.toISOString();
                    $scope.obs.DtEnd = end.toISOString();
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
                    AppLogging.log($scope.obs);
                    $scope.obs.ExposedHeight2 = 0;
                };

                $scope.new = function () {
                    indexEditing = -1;
                    $scope.exposition = [0, 0, 0, 0, 0, 0, 0, 0];
                    $scope.allExpositionsToggled = false;
                    $scope.editing = false;
                    $scope.dates.DtStart = new Date();
                    $scope.dates.timeFrame = $scope.dates.timeFrames[0];
                    $scope.obs = {
                        exposedHeight: {
                            'top': false,
                            'mid': false,
                            'bot': false
                        }
                    };
                    $scope.dateChanged();
                    $scope.estimatedNumChanged();

                    $scope.modal.show();
                };

                $scope.add = function () {
                    if(!$scope.editing){
                        if(!$scope.reg.AvalancheActivityObs2){
                            $scope.reg.AvalancheActivityObs2 = [];
                        }
                        if (!Utility.isEmpty($scope.obs)) {
                            $scope.reg.AvalancheActivityObs2.push($scope.obs);
                        }
                    }
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

                $scope.toggleNoActivity = function(){
                    if ($scope.noActivity.val) {
                        $scope.obs.EstimatedNumTID = $scope.estimatedNumKdvArray[1].Id;
                    } else {
                        $scope.obs.EstimatedNumTID = $scope.estimatedNumKdvArray[0].Id;
                    }
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
                    .getKdvRepositories()
                    .then(function (repos) {
                        //Snow_AvalCauseAttributeFlags
                        $scope.avalancheExtDict = {};
                        $scope.estimatedNumDict = {};
                        repos['Snow_AvalancheExtKDV'].forEach(function (val) {
                            $scope.avalancheExtDict[val.Id] = val.Name;
                        });
                        $scope.estimatedNumKdvArray = repos['Snow_EstimatedNumKDV'];
                        $scope.estimatedNumKdvArray.forEach(function (val) {
                            $scope.estimatedNumDict[val.Id] = val.Name;
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