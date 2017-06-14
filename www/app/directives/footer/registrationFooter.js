angular.module('RegObs').component('registrationFooter', {
    templateUrl: 'app/directives/footer/registrationfooter.html',
    controller: function (Registration, $rootScope) {
        var vm = this;
        vm.registration = Registration;
    }
});