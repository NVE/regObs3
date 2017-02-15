angular.module('RegObs').component('registrationDetail', {
    templateUrl: 'app/directives/registrationdetail/registrationDetail.html',
    controller: function (AppSettings, $cordovaInAppBrowser) {
        var ctrl = this;

        ctrl.onViewWebRegistrationClick = function () {
            var url = AppSettings.getWebRoot() + '/Registration/' + ctrl.registration.RegId;
            $cordovaInAppBrowser.open(url, '_system');
        };

        var hasMoreThanOneImage = ctrl.registration.getImageCount() > 1;

        ctrl.options = {
            loop: false,
            pagination: hasMoreThanOneImage //there is an issue with showing pagination when using ng-repeat
        };    
    },
    bindings: {
        registration: '<'
    }
});