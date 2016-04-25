(function(){
    'use strict';

    var regobsNumber = {
        require: {
            formCtrl: '^form'
        },
        bindings: {
            fieldName: '@',
            label: '@',
            helpText: '@',
            pattern: '@',
            max: '@',
            min: '@',
            step: '@',
            model: '=',
            changeHandler: '&'
        },
        template: [
            '<label class="item item-input item-stacked-label">',
                '<span class="input-label" ng-class="{assertive:$ctrl.formCtrl[$ctrl.fieldName].$invalid}" ng-bind="$ctrl.label"></span>',
                '<input type="number" pattern="{{$ctrl.pattern}}" name="{{$ctrl.fieldName}}" placeholder="{{$ctrl.helpText}}" inputmode="numeric" ng-model="$ctrl.model" min="{{$ctrl.min || -100}}" max="{{$ctrl.max || 100}}" step="{{$ctrl.step || 0.01}}" ng-change="$ctrl.changeHandler()" />',
            '</label>'
        ].join(''),
        controller: function Ctrl(Registration){
            'ngInject';
            var ctrl = this;
            ctrl.reg = Registration.data;
        }
    };

    angular.module('RegObs')
        .component('regobsNumber', regobsNumber);


})();
