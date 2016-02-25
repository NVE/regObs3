(function(){
    'use strict';

    function Ctrl(Registration){
        var ctrl = this;
        ctrl.reg = Registration.data;
    }

    var regobsNumber = {
        require: {
            formCtrl: '^form'
        },
        bindings: {
            fieldName: '@',
            label: '@',
            helpText: '@',
            model: '='
        },
        template: [
            '<label class="item item-input item-stacked-label">',
                '<span class="input-label" ng-class="{assertive:$ctrl.formCtrl[$ctrl.fieldName].$invalid}" ng-bind="$ctrl.label"></span>',
                '<input type="number" name="{{$ctrl.fieldName}}" placeholder="{{$ctrl.helpText}}" inputmode="numeric" ng-model="$ctrl.model" min="-100" max="100" step="0.01" />',
            '</label>'
        ].join(''),
        controller: Ctrl
    };

    angular.module('RegObs')
        .component('regobsNumber', regobsNumber);


})();
