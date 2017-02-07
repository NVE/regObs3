angular
    .module('RegObs')
    .component('regobsPosition',
    {
        templateUrl: 'app/directives/position/regobsposition.html',
        controller: function ($element, ObsLocation, $state, $filter, $ionicPopup, $rootScope, $ionicModal, AppSettings, $scope) {
            var ctrl = this;
            ctrl.location = ObsLocation.get();

            ctrl.hasPosition = function() {
                return ObsLocation.isSet();
            }

            ctrl.hasGpsPosition = function() {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.fetchedFromGPS;
            };
            ctrl.isStoredLocation = function () {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.storedPosition;
            };
            ctrl.hasMarkedPosition = function () {
                return ctrl.location && ctrl.location.UTMSourceTID === ObsLocation.source.clickedInMap;
            };

            ctrl.getDescription = function() {
                if (ctrl.location.ObsLocationId) {
                    return ctrl.location.Name;
                } else if (ctrl.location.place) {
                    return ctrl.location.place.Navn + ' / ' + ctrl.location.place.Fylke;
                } else if (ctrl.location.Latitude && ctrl.location.Longitude) {
                    var lat = $filter('number')(ctrl.location.Latitude, 3);
                    var lng = $filter('number')(ctrl.location.Longitude, 3);
                    return lat + 'N ' + lng + 'E ';
                }
                return 'UNKNOWN_POSITION';
            };

            ctrl.goBack = function() {
                $state.go('start');
            };

           
            ctrl.showPopup = function () {
                var popupScope = $rootScope.$new();

                var popup = $ionicPopup.show({
                    templateUrl: 'app/directives/position/positionpopup.html',
                    title: 'Oppdater posisjon',
                    scope: popupScope
                });

                popupScope.closePopup = function () {
                    popup.close();
                };

                popupScope.openMarkPosition = function () {
                    popup.close();
                    ctrl._loadModal()
                        .then(function() {
                            ctrl.modal.show();
                        });               
                };
            };

            
            ctrl._loadModal = function () {
                var mapScope = $rootScope.$new();
                mapScope.closeModal = function () {
                    ctrl.modal.hide();
                    ctrl.modal.remove();
                };
                mapScope.getEnvClass = function () {
                    return AppSettings.data.env === 'regObs' ? 'bar-dark' : (AppSettings.data.env === 'demo regObs' ? 'bar-assertive' : 'bar-calm');
                };
                var url = 'app/directives/position/markpositionmodal.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: mapScope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        ctrl.modal = modal;
                        return modal;
                    });
            };

            $scope.$on('$destroy', function () {
                if (ctrl.modal) {
                    ctrl.modal.remove();
                }
            });

            

        },
        bindings: {

        }
    });