angular.module('RegObs').component('registrationFooter', {
    templateUrl: 'app/directives/footer/registrationfooter.html',
    controller: function (Registration) {
        var vm = this;
        vm.registration = Registration;
    }
});