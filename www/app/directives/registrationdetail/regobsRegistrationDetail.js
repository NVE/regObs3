angular.module('RegObs').component('registrationDetail', {
    templateUrl: 'app/directives/registrationdetail/registrationDetail.html',
    controller: function (AppSettings, PresistentStorage, AppLogging) {
        var ctrl = this;

        ctrl.images = [];

        ctrl.registration.Registrations.forEach(function (item) {
            if (item.RegistrationTid === 12 || item.RegistrationTid === 23) {
                var pictureId = item.TypicalValue2;
                var url = 'picture/' +
                    AppSettings.data.env.replace(/ /g, '') +
                    '/' +
                    pictureId +
                    '.jpg';
                var fullUrl = PresistentStorage.getUri(url);              
                ctrl.images.push({ id:pictureId, url: fullUrl, description: 'Desc' });
            }
        });
    },
    bindings: {
        registration: '='
    }
});