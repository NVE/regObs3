angular
    .module('RegObs')
    .directive('regobsRegistrationTools', function ($http, $filter, $ionicModal, AppSettings, RegobsPopup, ObsLocation, Registration, AppLogging) {
        'ngInject';
        return {
            link: link,
            scope: {},
            templateUrl: 'app/directives/registrationtools/regobsRegistrationTools.html'
        };

        function link(scope){
            scope.ObsLocation = ObsLocation;            

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

            loadModal();

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
                ObsLocation.setPreviousUsedPlace(place.Id,place.Name);
                scope.placesModal.hide();
            };

            scope.loadPlaces = function () {
                scope.fetchingPlaces = true;
                return ObsLocation
                    .getObservationsWithinRadius(AppSettings.data.searchRange, Registration.data.GeoHazardTID)
                    .then(function(res){
                        scope.fetchingPlaces = false;
                        AppLogging.log(res);
                        var result = JSON.parse(res.data.Data);
                        if(result.data.length){
                            scope.places = result.data;
                            scope.placesModal.show();
                        } else {
                            RegobsPopup.alert(
                                'Ingen treff',
                                'Fant ingen eksisterende målepunkt innenfor ' + AppSettings.data.searchRange+
                                ' meter. Søkeradius kan utvides i innstillinger.'
                            );
                        }

                    })
                    .catch(function(err){
                        AppLogging.log('Error fetching places', err);
                        var header = 'Klarte ikke hente målepunkter';
                        var message;
                        if(err.status <= 0){
                            message =
                                'Dette kan skyldes manglende nett, eller at serverapplikasjonen må våkne og få seg en dugelig sterk kopp med kaffe først. Gi den noen minutter og prøv igjen.';
                        } else {
                            message =
                                'Det oppsto dessverre et problem med å hente målepunkter, beklager ulempen.. Vennligst prøv igjen om noen minutter og se om det bedrer seg. Melding mottatt fra server: ' + err.statusText;
                        }
                        RegobsPopup.alert(header, message);
                        scope.fetchingPlaces = false;
                    });

            };

            scope.getDistanceText = function(distance){
                if(!isNaN(distance)){
                    return Math.round(distance);
                }
            };

            scope.getPositionText = function () {
                var text = '',
                    margin = ObsLocation.data.Uncertainty,
                    place = ObsLocation.data.place,
                    lat = ObsLocation.data.Latitude,
                    lng = ObsLocation.data.Longitude,
                    clickedInMap = ObsLocation.data.UTMSourceTID === ObsLocation.source.clickedInMap,
                    marginText = clickedInMap ? '' : (' Usikkerhet: ' + margin + 'm');

                if (ObsLocation.data.ObsLocationId) {
                    text = ObsLocation.data.Name;
                } else if(place){
                     text = place.Navn + ' / ' + place.Fylke + marginText;
                 } else if(lat){
                     lat = $filter('number')(lat, 3);
                     lng = $filter('number')(lng, 3);
                     text = lat+'N ' + lng+'E ' + marginText;
                 } else {
                    text = 'Ikke funnet';
                }

                return text;

            };

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
