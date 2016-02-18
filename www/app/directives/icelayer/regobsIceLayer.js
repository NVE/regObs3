/**
 * Created by storskel on 11.11.2015.
 */
angular
    .module('RegObs')
    .directive('regobsIceLayer',
        function regobsIceLayer($ionicModal, RegobsPopup, Registration, Utility) {

            return {
                link: link,
                templateUrl: 'app/directives/icelayer/regobsIceLayer.html',
                scope: {
                    obsObject: '='
                },
                restrict: 'EA'
            };

            function link($scope){
                var id = 1;
                var indexEditing = -1;
                var loadModal = function () {
                    var url = 'app/directives/icelayer/newicelayer.html';
                    return $ionicModal
                        .fromTemplateUrl(url, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (modal) {
                            $scope.modal = modal;
                            return modal;
                        });
                };
                var showConfirm = function () {
                    return RegobsPopup.confirm('Slett observasjoner',
                       'Er du sikker på at du vil slette dette islaget?');
                };
                var loadKdvArray = function () {
                    return Utility
                        .getKdvArray('Ice_IceLayerKDV')
                        .then(function (response) {
                            console.log(response);
                            $scope.iceLayerKdvArray = response;
                            $scope.iceLayerDict = {};
                            response.forEach(function(val){
                                $scope.iceLayerDict[val.Id] = val.Name;
                            });
                            return response;
                        });
                };

                $scope.data = {
                    thickness: 0
                };

                $scope.new = function () {
                    indexEditing = -1;
                    $scope.editing = false;
                    $scope.data.thickness = undefined;
                    $scope.iceLayer = {
                        IceLayerID: id++,
                        IceLayerTID: 0
                    };
                    $scope.modal.show();
                };

                $scope.add = function () {
                    if(!$scope.editing){
                        $scope.obsObject.IceThicknessLayer = $scope.obsObject.IceThicknessLayer || [];
                        $scope.obsObject.IceThicknessLayer.push($scope.iceLayer);
                    }

                    var totalThickness = 0;
                    $scope.obsObject.IceThicknessLayer.forEach(function (layer) {
                        totalThickness += layer.IceLayerThickness;
                    });
                    $scope.obsObject.IceThicknessSum = totalThickness;
                    console.log($scope.obsObject);
                    $scope.modal.hide();
                };

                $scope.edit = function (obs, index) {
                    indexEditing = index;
                    $scope.iceLayer = obs;
                    $scope.data.thickness = $scope.iceLayer.IceLayerThickness ? Utility.nDecimal($scope.iceLayer.IceLayerThickness*100,3) : undefined;
                    $scope.editing = true;
                    $scope.modal.show();
                };

                $scope.delete = function () {
                    showConfirm()
                        .then(function (response) {
                            if (response) {
                                $scope.obsObject.IceThicknessLayer.splice(indexEditing, 1);
                                $scope.modal.hide();
                                indexEditing = -1;
                            }
                        });
                };

                $scope.thicknessChanged = function () {
                    var num = parseFloat($scope.data.thickness);
                    if(!isNaN(num)){
                        $scope.iceLayer.IceLayerThickness = Utility.nDecimal(num/100,3);

                    }
                };

                $scope.getLayerThicknessText = function(layer){
                    return Utility.nDecimal(layer.IceLayerThickness*100, 3);
                };

                loadKdvArray().then(loadModal);



                $scope.$on('$ionicView.beforeLeave', function () {
                    $scope.modal.hide();
                });

                $scope.$on('$destroy', function() {
                    $scope.modal.remove();
                });

            }
        });

/*"IceThicknessLayer": [
    {
        "IceLayerID": 0, //økende id bare
        "IceLayerTID": "1", //Sarpe osv
        "IceLayerThickness": "0.0100"
    }, {
        "IceLayerID": 1,
        "IceLayerTID": "9",
        "IceLayerThickness": "0.0200"
    }
]*/
