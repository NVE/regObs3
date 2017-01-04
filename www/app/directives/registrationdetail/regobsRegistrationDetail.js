angular.module('RegObs').component('registrationDetail', {
    templateUrl: 'app/directives/registrationdetail/registrationDetail.html',
    controller: function (AppSettings, PresistentStorage, AppLogging, Utility, $cordovaInAppBrowser) {
        var ctrl = this;

        ctrl.images = [];
        ctrl.descriptions = [];

        ctrl.observationCount = function() {
            return ctrl.registration.Registrations.filter(function(item) {
                return !Utility.isObsImage(item);
            }).length;
        };


        var getObsDescription = function(item) {
            var result = [];
            if (item.TypicalValue2) {
                result.push(item.TypicalValue2);
            }
            if (item.TypicalValue1) {
                result.push(item.TypicalValue1);
            }
            return result;
        };

        ctrl.onViewWebRegistrationClick = function () {
            var url = AppSettings.getWebRoot() + '/Registration/' + ctrl.registration.RegId;
            $cordovaInAppBrowser.open(url, '_system');
        };

        var init = function () {
            AppLogging.log('Registration details: ' + JSON.stringify(ctrl.registration));
            ctrl.registration.Registrations.forEach(function(item) {
                if (Utility.isObsImage(item)) {
                    var pictureId = item.TypicalValue2;
                    var path = AppSettings.getImageRelativePath(pictureId);
                    var uri = PresistentStorage.getUri(path);
                    ctrl.images.push({ id: pictureId, url: uri, description: '' });
                } else {
                    ctrl.descriptions.push({ name: (item.RegistrationName || '').trim(), description: getObsDescription(item) });
                }
            });
        };

        init();
    },
    bindings: {
        registration: '='
    }
});