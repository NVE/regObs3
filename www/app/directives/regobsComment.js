(function () {

    var regobsComment = {
        bindings: {
            placeholder: '@',
            model: '='
        },
        controller: function(Utility){
            var ctrl = this;

            ctrl.textareaId = Utility.createGuid();

            ctrl.updateTextareaSize = function() {
                var element = document.getElementById(ctrl.textareaId);
                element.style.height =  element.scrollHeight + "px";
            }

        },
        template: [
            '<label class="item item-input item-stacked-label">',
                '<span class="input-label">Kommentar</span>',
                '<textarea id="{{$ctrl.textareaId}}" placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="3" maxlength="1024" ng-model="$ctrl.model" ng-change="$ctrl.updateTextareaSize()"></textarea>',
            '</label>'
        ].join('')
    };

    angular.module('RegObs')
        .component('regobsComment', regobsComment);
})();
