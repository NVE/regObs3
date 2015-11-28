angular
    .module('RegObs')
    .directive('regobsRegistrationTools', function ($http, $filter, $ionicModal,AppSettings,ObsLocation,Registration) {
        return {
            link: link,
            scope: {},
            templateUrl: 'app/directives/registrationtools/regobsRegistrationTools.html'
        };

        function link(scope){
            scope.ObsLocation = ObsLocation;
            scope.Registration = Registration;

            var chosenPlace;

            var loadModal = function () {
                var url = 'app/directives/registrationtools/mapModal.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        scope.modal = modal;
                        return modal;
                    });
            };

            var loadPlacesModal = function () {
                var url = 'app/directives/registrationtools/placesModal.html';
                return $ionicModal
                    .fromTemplateUrl(url, {
                        scope: scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        scope.placesModal = modal;
                        return modal;
                    });
            };

            loadPlacesModal();

            scope.setPlace = function(place) {
                chosenPlace = place;
                Registration.data.ObsLocation = {
                    ObsLocationId: place.LocationId,
                    Name: place.Name
                };
                Registration.save();
                scope.placesModal.hide();
            };

            scope.loadPlaces = function () {
                scope.fetchingPlaces = true;
                return $http.get(
                    AppSettings.getEndPoints().getObservationsWithinRadius, {
                        params: {
                            latitude:Registration.data.ObsLocation.Latitude,
                            longitude:Registration.data.ObsLocation.Longitude,
                            range:AppSettings.data.searchRange,
                            geohazardId: Registration.data.GeoHazardTID
                        }
                    })
                    .then(function(res){
                        scope.fetchingPlaces = false;
                        console.log(res);
                        var result = JSON.parse(res.data.Data);
                        if(result.data.length){
                            scope.places = result.data;
                            scope.placesModal.show();
                        }

                    })
                    .catch(function(err){
                        scope.fetchingPlaces = false;

                    });

            };

            scope.getPositionText = function () {
                var text = '';
                if(Registration.data.ObsLocation.Latitude){
                    var margin = Registration.data.ObsLocation.Uncertainty;
                    var lat = $filter('number')(Registration.data.ObsLocation.Latitude, 3);
                    var lng = $filter('number')(Registration.data.ObsLocation.Longitude, 3);
                    text = lat+'N ' + lng+'E ' + '+/-' +margin+'m';
                } else if (Registration.data.ObsLocation.ObsLocationId) {
                    text = Registration.data.ObsLocation.Name;
                } else {
                    text = 'Ikke funnet';
                }

                return text;

            };

            loadModal();

            scope.openPositionInMap = function () {
                scope.$broadcast('openPositionInMap');
                scope.modal.show();
            };

            scope.setPositionInMap = function () {
                scope.$broadcast('setPositionInMap');
                scope.modal.hide();
            };

            scope.$on('$destroy', function() {
                scope.modal.remove();
                scope.placesModal.remove();
            });
        }

    });

//{"ContentEncoding":null,
// "ContentType":"application/json",
// "Data":
// "{\"data\":[{\"Name\":\"Sognsvann 183 moh\",\"LocationId\":8350,\"Distance\":499.6,\"LatLngObject\":{\"Latitude\":59.974645292638186,\"Longitude\":10.72891842741361},\"ObserverNick\":\"aask@nve\",\"ObserverGroup\":null},{\"Name\":\"Svartkulp 202 moh\",\"LocationId\":8343,\"Distance\":1080.46,\"LatLngObject\":{\"Latitude\":59.975961074701772,\"Longitude\":10.739010464622536},\"ObserverNick\":\"aask@nve\",\"ObserverGroup\":null},{\"Name\":\"Nedre Blanksjø 223 moh\",\"LocationId\":8344,\"Distance\":1314.18,\"LatLngObject\":{\"Latitude\":59.9814501573238,\"Longitude\":10.738303850470496},\"ObserverNick\":\"aask@nve\",\"ObserverGroup\":null},{\"Name\":\"Lille Åklungen 259 moh\",\"LocationId\":8349,\"Distance\":1880.19,\"LatLngObject\":{\"Latitude\":59.990784564117028,\"Longitude\":10.716694361140034},\"ObserverNick\":\"aask@nve\",\"ObserverGroup\":null}]}","JsonRequestBehavior":0,"MaxJsonLength":null,"RecursionLimit":null}
//"https://api.nve.no/hydrology/demo/regobs/webapi/Observations/GetObservationsWithinRadius?latitude=59.9739991936675&longitude=10.720081329345703&range=2500&geohazardId=70"