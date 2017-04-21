angular.module('RegObs').component('formFooter', {
    templateUrl: 'app/directives/footer/formfooter.html',
    controller: function (Property, $state) {
        var vm = this;
        vm.resetProperty = function () {
            var prop = $state.current.data.registrationProp;
            Property.reset(prop);
        };
    }
});