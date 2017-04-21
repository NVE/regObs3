(function () {

    var regobsComment = {
        bindings: {
            placeholder: '@',
            labelText: '@',
            model: '=',
            required: '@',
            hideLabel: '<',
            initialRows: '@'
        },
        controller: function ($timeout, $rootScope, Utility) {
            'ngInject';
            var ctrl = this;
            var element;
            var minheight = 20;

            ctrl.textareaId = Utility.createGuid();
            ctrl.labelText = ctrl.labelText || 'Kommentar';

            ctrl.updateTextareaSize = function() {
                if(!element){
                    element = document.getElementById(ctrl.textareaId);
                }
                if (element && element.style && element.scrollHeight > minheight) {
                    element.style.height = element.scrollHeight + "px";
                }
            };

            $rootScope.$on('$ionicView.enter', function(){
                ctrl.updateTextareaSize();
            });

        },
        template: [
            '<label class="item item-input item-stacked-label" ng-if="!$ctrl.hideLabel">',
                '<span class="input-label" ng-bind="$ctrl.labelText" ng-class="{assertive:$ctrl.required && !$ctrl.model.length}"></span>',
                '<textarea id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="{{$ctrl.initialRows || \'auto\'}}" maxlength="1024" ng-model="$ctrl.model" ng-keyup="$ctrl.updateTextareaSize()" ng-required="$ctrl.required"></textarea>',
            '</label>',
            '<textarea ng-if="$ctrl.hideLabel" id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="{{$ctrl.initialRows || \'auto\'}}" maxlength="1024" ng-model="$ctrl.model" ng-keyup="$ctrl.updateTextareaSize()" ng-required="$ctrl.required"></textarea>',
        ].join('')
    };

    angular.module('RegObs')
        .component('regobsComment', regobsComment);
})();
