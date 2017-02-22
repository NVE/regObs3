angular.module('RegObs').component('observationTypeGeneric', {
    template: '<strong class="registration-detail-type-header">{{$ctrl.registration.getName()}}:</strong>&nbsp;<span ng-repeat="desc in $ctrl.values track by $index"><span ng-if="$index > 0">&nbsp;&bull;&nbsp;</span><span ng-bind-html="desc.trim()"></span></span> ',
    controller: function () {
        var ctrl = this;

        ctrl.values = [];
        ctrl.registration.getValues()
            .then(function(result) {
                ctrl.values = result;
            });

    },
    bindings: {
        registration: '<'
    }
});