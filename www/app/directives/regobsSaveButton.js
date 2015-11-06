angular
    .module('RegObs')
    .directive('regobsSaveButton', function (Registration) {
        return {
            link: link,
            scope: {},
            template: '<div class="padding">\
            <button class="button button-block button-calm"\
        ng-click="save(true)">Lagre</button>\
            </div>'
        };

        function link(scope){
            scope.save = Registration.save;
        }

    });