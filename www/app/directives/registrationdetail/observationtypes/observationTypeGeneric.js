angular.module('RegObs').component('observationTypeGeneric', {
    template: '<strong>{{$ctrl.registration.getName()}}:</strong>&nbsp;<span ng-repeat="desc in $ctrl.values track by $index"><span ng-if="$index > 0">&nbsp;&bull;&nbsp;</span>{{desc.trim()}}</span>. ',
    controller: function () {
        var ctrl = this;

        ctrl.values = [];
        ctrl.registration.getValues()
            .then(function(result) {
                ctrl.values = result;
            });

    },
    bindings: {
       registration:'<'
    }
});