(function () {

    var regobsComment = {
        bindings: {
            placeholder: '@',
            labelText: '@',
            model: '=',
            required:'@'
        },
        controller: function ($timeout, $rootScope, Utility) {
            'ngInject';
            var ctrl = this;
            var element;

            ctrl.textareaId = Utility.createGuid();
            ctrl.labelText = ctrl.labelText || 'Kommentar';

            ctrl.updateTextareaSize = function() {
                if(!element){
                    element = document.getElementById(ctrl.textareaId);
                }
                if (element && element.style) {
                    element.style.height = element.scrollHeight + "px";
                }
            };

            $rootScope.$on('$ionicView.enter', function(){
                ctrl.updateTextareaSize();
            });

        },
        template: [
            '<label class="item item-input item-stacked-label">',
                '<span class="input-label" ng-bind="$ctrl.labelText" ng-class="{assertive:$ctrl.required && !$ctrl.model.length}"></span>',
                '<textarea id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="auto" maxlength="1024" ng-model="$ctrl.model" ng-change="$ctrl.updateTextareaSize()" ng-required="$ctrl.required"></textarea>',
            '</label>'
        ].join('')
    };

    angular.module('RegObs')
        .component('regobsComment', regobsComment);
})();
