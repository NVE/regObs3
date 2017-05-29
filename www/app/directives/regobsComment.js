(function () {

    var regobsComment = {
        bindings: {
            placeholder: '@',
            labelText: '@',
            model: '=',
            required: '@',
            hideLabel: '<',
            minHeight: '<'
        },
        controller: function ($timeout, $rootScope, Utility, $translate) {
            'ngInject';
            var ctrl = this;
            var element;
            var minheight = ctrl.minHeight || 40;

            ctrl.textareaId = Utility.createGuid();
            $translate('COMMENT').then(function (translation) {
                ctrl.labelText = ctrl.labelText || translation;
            });
            

            ctrl.updateTextareaSize = function() {
                if(!element){
                    element = document.getElementById(ctrl.textareaId);
                }
                if (element) {
                    element.style.height = (element.scrollHeight > minheight ? element.scrollHeight : minheight) + "px";
                    element.scrollTop = element.scrollHeight; //scroll to bottom when typing
                }
            };

            angular.element(document).ready(function () {
                ctrl.updateTextareaSize();
            });
        },
        template: [
            '<label class="item item-input item-stacked-label" ng-if="!$ctrl.hideLabel">',
                '<span class="input-label" ng-bind="$ctrl.labelText" ng-class="{assertive:$ctrl.required && !$ctrl.model.length}"></span>',
                '<textarea id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="auto" maxlength="1024" ng-model="$ctrl.model" ng-keyup="$ctrl.updateTextareaSize()" ng-required="$ctrl.required"></textarea>',
            '</label>',
            '<textarea ng-if="$ctrl.hideLabel" id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="auto" maxlength="1024" ng-model="$ctrl.model" ng-keyup="$ctrl.updateTextareaSize()" ng-required="$ctrl.required"></textarea>',
        ].join('')
    };

    angular.module('RegObs')
        .component('regobsComment', regobsComment);
})();
