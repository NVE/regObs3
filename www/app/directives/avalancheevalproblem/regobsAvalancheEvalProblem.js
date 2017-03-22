/**
 * Created by storskel on 09.11.2015.
 */
angular
    .module('RegObs')
    .directive('regobsAvalancheEvalProblem',
        function regobsAvalancheEvalProblem($filter, $ionicModal, RegobsPopup, Registration, Utility, AppLogging, $translate) {
            'ngInject';
            return {
                link: link,
                templateUrl: 'app/directives/avalancheevalproblem/regobsAvalancheEvalProblem.html',
                scope: {},
                restrict: 'EA'
            };

            function link($scope) {

                var viewArray, avalancheExtDict, avalCauseDict;
                var indexEditing = -1;
                $scope.reg = Registration.initPropertyAsArray('AvalancheEvalProblem2');
                $scope.heightArray = [
                    2500, 2400, 2300, 2200, 2100,
                    2000, 1900, 1800, 1700, 1600,
                    1500, 1400, 1300, 1200, 1100,
                    1000, 900, 800, 700, 600,
                    500, 400, 300, 200, 100, 0
                ];

                var showConfirm = function () {
                    return RegobsPopup.confirm($translate.instant('DELETE_AVALANCHE_PROBLEM'),
                        $translate.instant('DELETE_AVALANCHE_PROBLEM_CONFIRM'));
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
                    $scope.obs = {
                        AvalCauseTID: null,
                        exposedHeight: {
                            'top': false,
                            'mid': false,
                            'bot': false
                        }
                    };
                    $scope.setAvalancheExtArray();
                    loadAttributeValues();
                    $scope.modal.show();
                };

                $scope.add = function () {
                    if(!$scope.editing){
                        $scope.reg.AvalancheEvalProblem2.push($scope.obs);
                    }
                    $scope.modal.hide();
                };

                $scope.edit = function (obs, index) {
                    indexEditing = index;
                    $scope.obs = obs;
                    loadValidExposition();
                    loadAttributeValues();
                    $scope.setAvalancheExtArray();
                    $scope.editing = true;
                    $scope.modal.show();
                };

                $scope.delete = function () {
                    showConfirm()
                        .then(function (response) {
                            if (response) {
                                $scope.reg.AvalancheEvalProblem2.splice(indexEditing, 1);
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

                $scope.weakLayersCheckBoxFlagCreator = function () {
                    $scope.obs.AvalCauseAttributes = $scope.avalCauseAttributeFlags
                        .reduce(function (prevVal, curVal) {
                            return prevVal + (curVal.val * curVal.Id);
                        }, 0);
                };

                $scope.setAvalancheExtArray = function () {
                    var filteredViewArray = $filter('filter')(viewArray, { AvalCauseTID: $scope.obs.AvalCauseTID || 0 }, true).filter(function (item) { return item.AvalancheExtTID > 0 });
                    AppLogging.log(filteredViewArray);
                    $scope.avalancheExtArray = filteredViewArray.map(function (val) {
                        return {
                            Id: val.AvalancheExtTID,
                            Name: avalancheExtDict[val.AvalancheExtTID + '']
                        };
                    });
                    AppLogging.log($scope.avalancheExtArray);
                };

                $scope.getDisplayName = function (obs) {
                    if (!avalancheExtDict || !avalCauseDict) //dictionaries not loaded
                        return '';

                    var seperator = avalancheExtDict[obs.AvalancheExtTID]? ', ' : '';
                    return (avalancheExtDict[obs.AvalancheExtTID] || '').trim() + seperator + (avalCauseDict[obs.AvalCauseTID] || '');
                };

                var loadModal = function () {
                    var url = 'app/directives/avalancheevalproblem/newevalproblem.html';
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

                var loadAttributeValues = function () {
                    var setAttributes = ($scope.obs && $scope.obs.AvalCauseAttributes) || 0;
                    for (var i = $scope.avalCauseAttributeFlags.length; i--;) {
                        var flag = $scope.avalCauseAttributeFlags[i];
                        if (flag.Id <= setAttributes) {
                            flag.val = 1;
                            setAttributes -= flag.Id;
                        } else {
                            flag.val = 0;
                        }
                    }
                };

                Utility
                    .getViewRepositories()
                    .then(function (KdvRepos) {
                        viewArray = KdvRepos['AvalancheProblemMenu3V'];
                    });
                Utility
                    .getKdvRepositories()
                    .then(function (repos) {
                        //Snow_AvalCauseAttributeFlags
                        $scope.avalCauseAttributeFlags = repos['Snow_AvalCauseAttributeFlags'];

                        $scope.avalCauseKDV = repos['Snow_AvalCauseKDV'].filter(function(item){ return item.Id > 0 });

                        avalancheExtDict = {};
                        avalCauseDict = {};
                        repos['Snow_AvalancheExtKDV'].forEach(function (val) {
                            avalancheExtDict[val.Id] = val.Name;
                        });
                        $scope.avalCauseKDV.forEach(function (val) {
                            avalCauseDict[val.Id] = val.Name;
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