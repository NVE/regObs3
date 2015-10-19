angular
    .module('RegObs')
    .factory('User', function User($http, LocalStorage, AppSettings) {
        var service = this;
        var storageKey = 'regObsUser';
        var user = LocalStorage.getAndSetObject(storageKey, 'Guid', makeAnonymousUser());

        service.logIn = function (username, password) {
            var endpoints = AppSettings.getEndPoints();

            var config = {
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                },
                cache: true
            };
            return $http.get(endpoints.getObserver, config).then(function(response) {
                user = JSON.parse(response.data.Data);
                user.email = username;
                LocalStorage.setObject(storageKey, user);
                console.log("Logged in user",user);

            }, function (response) {
                alert('Failed logging in!');
            });
        };

        service.logOut = function () {
            user = makeAnonymousUser();
            LocalStorage.setObject(storageKey, user);
        };

        service.getUser = function () {
            return user;
        };

        return service;

        function makeAnonymousUser() {
            return {
                Guid: (AppSettings.env === 'demo' ? 'A9D7E614-2EE4-4589-B490-A36DDB586AF9' : '92E6A41D-8E7B-46A8-8957-3F14AA2544A0'),
                ObserverGroup: null,
                anonymous: true
            };
        }

    });
