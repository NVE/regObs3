angular
    .module('RegObs')
    .controller('IceDangerObsCtrl', function IceDangerObsCtrl($scope, $ionicModal, $ionicPopup, Utility, Registration) {

        function init() {
            var vm = this;

            var indexEditing = -1;

            vm.areaArray = [
                "Ikke gitt",
                "Akkurat her",
                "På denne siden av vannet",
                "På dette vannet",
                "Mange vann i nærheten"
            ];

            var showConfirm = function () {
                return $ionicPopup.confirm({
                    title: 'Slett observasjoner',
                    template: 'Er du sikker på at du vil slette dette faretegnet?',
                    buttons: [
                        {text: 'Avbryt'},
                        {
                            text: 'Slett',
                            type: 'button-assertive',
                            onTap: function (e) {
                                // Returning a value will cause the promise to resolve with the given value.
                                return true;
                            }
                        }
                    ]
                });
            };

            var loadModal = function () {
                var url = 'app/ice/iceregistration/icedangerobs/newdangerobs.html'
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        vm.modal = modal;
                        return modal;
                    });
            };

            var loadDangerSignKdvArray = function () {
                return Utility
                    .getKdvArray('Ice_DangerSignKDV')
                    .then(function (response) {
                        console.log(response);
                        vm.dangerSignKdvArray = response;
                        return response;
                    });
            };

            vm.commentChanged = function () {
                vm.dangerObs.Comment = 'Område: ' + vm.dangerObs.tempArea + '. Beskrivelse: ' + (vm.dangerObs.tempComment ? vm.dangerObs.tempComment : '');
            };

            vm.dangerSignChanged = function () {
                vm.noDangerSign = vm.dangerObs.DangerSignTID === vm.dangerSignKdvArray[1].Id;
            };

            vm.addDangerObs = function () {
                vm.commentChanged();
                vm.dangerObsArray.push(vm.dangerObs);
                vm.modal.hide();
            };

            vm.newDangerObs = function () {
                vm.editing = false;
                vm.dangerObs = {
                    DangerSignTID: vm.dangerSignKdvArray[0].Id,
                    tempArea: vm.areaArray[0]
                };
                vm.dangerSignChanged();
                vm.dangerObs.DangerSignTID = vm.dangerSignKdvArray[0].Id;
                vm.modal.show();
            };

            vm.editDangerObs = function (dangerObs, index) {
                indexEditing = index;
                vm.dangerObs = dangerObs;
                vm.dangerSignChanged();
                vm.editing = true;
                vm.modal.show();
            };

            vm.deleteDangerObs = function () {
                showConfirm()
                    .then(function (response) {
                        if (response) {
                            vm.dangerObsArray.splice(indexEditing, 1);
                            vm.modal.hide();
                            indexEditing = -1;
                        }
                    });
            };

            vm.toggleNoDangerSign = function () {
                if (vm.noDangerSign) {
                    vm.dangerObs.DangerSignTID = vm.dangerSignKdvArray[1].Id;
                } else {
                    vm.dangerObs.DangerSignTID = vm.dangerSignKdvArray[0].Id;
                }
            };

            vm.getDangerSignName = function (tid) {
                if(angular.isArray(vm.dangerSignKdvArray)){
                    for (var i = 0; i < vm.dangerSignKdvArray.length; i++) {
                        var dangerSignKdv = vm.dangerSignKdvArray[i];
                        if(dangerSignKdv.Id == tid){
                            return dangerSignKdv.Name;
                        }
                    }
                }
            };

            vm.save = Registration.save;

            vm.dangerObsArray = Registration.getPropertyAsArray('ice', 'DangerObs');
            loadModal();
            loadDangerSignKdvArray();

            $scope.$on('$ionicView.beforeLeave', function () {
                vm.modal.hide();
            });

            $scope.$on('$destroy', function() {
                vm.modal.remove();
            });

        }

        $scope.$on( '$ionicView.loaded', init.bind(this) );



        /*"DangerObs": [{
         "DangerSignTID": 701,
         "Comment": "Område: På denne siden av vannet. Beskrivelse: Kommentar"
         }]*/
    });
