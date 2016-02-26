(function () {

    var regobsComment = {
        bindings: {
            placeholder: '@',
            model: '='
        },
        template: [
            '<label class="item item-input item-stacked-label">',
                '<span class="input-label">Kommentar</span>',
                '<textarea placeholder="{{$ctrl.placeholder}}" name="comment" cols="30" rows="3" maxlength="1024" ng-model="$ctrl.model"></textarea>',
            '</label>'
        ].join('')
    };

    angular.module('RegObs')
        .component('regobsComment', regobsComment);
})();
